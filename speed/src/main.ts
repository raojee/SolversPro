import SpeedTest from '@cloudflare/speedtest';

// DOM Elements
const clientIpEl = document.getElementById('client-ip')!;
const clientIspEl = document.getElementById('client-isp')!;
const serverLocationEl = document.getElementById('server-location')!;

const needleGroup = document.getElementById('needle-group')!;
const gaugeProgress = document.getElementById('gauge-progress') as unknown as SVGPathElement;
const liveSpeedEl = document.getElementById('live-speed')!;
const testPhaseBadge = document.getElementById('test-phase-badge')!;
const testSubstatus = document.getElementById('test-substatus')!;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;

const metricDownload = document.getElementById('metric-download')!;
const metricDownloadPeak = document.getElementById('metric-download-peak')!;
const metricUpload = document.getElementById('metric-upload')!;
const metricUploadPeak = document.getElementById('metric-upload-peak')!;
const metricLatency = document.getElementById('metric-latency')!;
const metricJitter = document.getElementById('metric-jitter')!;
const metricLoadedPing = document.getElementById('metric-loaded-ping')!;

const cardDownload = document.getElementById('card-download')!;
const cardUpload = document.getElementById('card-upload')!;
const cardLatency = document.getElementById('card-latency')!;
const cardBufferbloat = document.getElementById('card-bufferbloat')!;

const scoreGaming = document.getElementById('score-gaming')!;
const scoreStreaming = document.getElementById('score-streaming')!;
const scoreRtc = document.getElementById('score-rtc')!;

const resultsActions = document.getElementById('results-actions')!;
const btnCopySummary = document.getElementById('btn-copy-summary') as HTMLButtonElement;
const btnShare = document.getElementById('btn-share') as HTMLButtonElement;
const toastEl = document.getElementById('toast')!;

// Internal State
let speedTestInstance: any = null;
let currentPhase: 'idle' | 'latency' | 'download' | 'upload' | 'finished' = 'idle';
let peakDownload = 0;
let peakUpload = 0;
let finalSummary: any = null;
let finalScores: any = null;

// Convert Mbps to Gauge Rotation (-120deg to +120deg)
function mbpsToAngle(mbps: number): number {
  if (mbps <= 0) return -120;
  if (mbps >= 1000) return 120;
  // Non-linear scale for human perception
  // 0 -> -120deg
  // 10 -> -80deg
  // 50 -> -30deg
  // 100 -> 0deg
  // 250 -> 40deg
  // 500 -> 80deg
  // 1000 -> 120deg
  const logVal = Math.log10(Math.max(1, mbps)); // 0 to 3
  const normalized = logVal / 3; // 0 to 1
  return -120 + normalized * 240;
}

// Update Gauge Visuals
function updateGauge(mbps: number, labelPhase?: string) {
  liveSpeedEl.textContent = mbps.toFixed(1);
  const angle = mbpsToAngle(mbps);
  needleGroup.setAttribute('transform', `rotate(${angle} 160 180)`);

  // Dashoffset from 471 (0%) down to 0 (100%)
  const percent = Math.min(1, Math.max(0, (angle + 120) / 240));
  const offset = 471 - (percent * 471);
  if (gaugeProgress) {
    gaugeProgress.style.strokeDashoffset = String(offset);
  }

  if (labelPhase) {
    testPhaseBadge.textContent = labelPhase;
  }
}

// Fetch Edge Telemetry (ISP, IP, Datacenter)
async function fetchTelemetry() {
  try {
    const res = await fetch('/api/meta');
    if (res.ok) {
      const data = await res.json();
      if (data.clientIp) clientIpEl.textContent = data.clientIp;
      if (data.asOrganization) clientIspEl.textContent = data.asOrganization;
      if (data.colo) {
        serverLocationEl.textContent = `Cloudflare (${data.colo}${data.city ? ` - ${data.city}` : ''})`;
      }
      return;
    }
  } catch (_) {
    // Local development or fallback
  }

  // Fallback to client-side public IP lookup if /api/meta is unavailable
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const { ip } = await res.json();
      clientIpEl.textContent = ip;
      clientIspEl.textContent = 'Detected (Local/ISP)';
    }
  } catch (_) {
    clientIpEl.textContent = 'Active Connection';
    clientIspEl.textContent = 'Local Network';
  }
}

// Reset UI for a fresh test
function resetUI() {
  peakDownload = 0;
  peakUpload = 0;
  finalSummary = null;
  finalScores = null;

  updateGauge(0, 'PREPARING');
  testSubstatus.textContent = 'Connecting to nearest Cloudflare edge...';

  metricDownload.textContent = '—';
  metricDownloadPeak.textContent = '—';
  metricUpload.textContent = '—';
  metricUploadPeak.textContent = '—';
  metricLatency.textContent = '—';
  metricJitter.textContent = '—';
  metricLoadedPing.textContent = '—';

  [cardDownload, cardUpload, cardLatency, cardBufferbloat].forEach(card => card.classList.remove('active-testing'));

  [scoreGaming, scoreStreaming, scoreRtc].forEach(badge => {
    badge.className = 'score-badge badge-pending';
    badge.textContent = 'PENDING';
  });

  resultsActions.classList.add('hidden');
}

// Map score classification to CSS class and label
function applyBadgeScore(badgeEl: HTMLElement, scoreObj?: { classificationName: string }) {
  if (!scoreObj) return;
  const grade = scoreObj.classificationName.toLowerCase();
  badgeEl.className = `score-badge badge-${grade}`;
  badgeEl.textContent = grade.toUpperCase();
}

// Start Speed Test Execution
function runSpeedTest() {
  resetUI();
  startBtn.disabled = true;
  startBtn.querySelector('span')!.textContent = 'Testing Network...';

  speedTestInstance = new SpeedTest({
    autoStart: true,
    measureDownloadLoadedLatency: true,
    measureUploadLoadedLatency: true,
  });

  // Track phase changes
  speedTestInstance.onPhaseChange = (payload: { measurement: { type: string } }) => {
    const type = payload?.measurement?.type;
    [cardDownload, cardUpload, cardLatency, cardBufferbloat].forEach(c => c.classList.remove('active-testing'));

    if (type === 'latency') {
      currentPhase = 'latency';
      testPhaseBadge.className = 'phase-badge';
      testPhaseBadge.textContent = 'LATENCY';
      testSubstatus.textContent = 'Measuring baseline unloaded ping & jitter...';
      cardLatency.classList.add('active-testing');
    } else if (type === 'download') {
      currentPhase = 'download';
      testPhaseBadge.className = 'phase-badge active-download';
      testPhaseBadge.textContent = 'DOWNLOAD';
      testSubstatus.textContent = 'Measuring downstream throughput & bufferbloat...';
      cardDownload.classList.add('active-testing');
    } else if (type === 'upload') {
      currentPhase = 'upload';
      testPhaseBadge.className = 'phase-badge active-upload';
      testPhaseBadge.textContent = 'UPLOAD';
      testSubstatus.textContent = 'Measuring upstream bandwidth to edge network...';
      cardUpload.classList.add('active-testing');
    }
  };

  // Track real-time metric updates
  speedTestInstance.onResultsChange = () => {
    const results = speedTestInstance.results;

    // Latency & Jitter
    const ping = results.getUnloadedLatency();
    const jitter = results.getUnloadedJitter();
    if (ping !== undefined) {
      metricLatency.textContent = Math.round(ping).toString();
    }
    if (jitter !== undefined && jitter !== null) {
      metricJitter.textContent = Math.round(jitter).toString();
    }

    // Download Speed
    const downBps = results.getDownloadBandwidth();
    if (downBps !== undefined) {
      const downMbps = downBps / 1e6;
      metricDownload.textContent = downMbps.toFixed(1);
      if (downMbps > peakDownload) {
        peakDownload = downMbps;
        metricDownloadPeak.textContent = peakDownload.toFixed(1);
      }
      if (currentPhase === 'download') {
        updateGauge(downMbps, 'DOWNLOAD');
      }
    }

    // Upload Speed
    const upBps = results.getUploadBandwidth();
    if (upBps !== undefined) {
      const upMbps = upBps / 1e6;
      metricUpload.textContent = upMbps.toFixed(1);
      if (upMbps > peakUpload) {
        peakUpload = upMbps;
        metricUploadPeak.textContent = peakUpload.toFixed(1);
      }
      if (currentPhase === 'upload') {
        updateGauge(upMbps, 'UPLOAD');
      }
    }

    // Loaded Latency (Bufferbloat)
    const downLoadedLatency = results.getDownLoadedLatency();
    const upLoadedLatency = results.getUpLoadedLatency();
    const maxLoaded = Math.max(downLoadedLatency || 0, upLoadedLatency || 0);
    if (maxLoaded > 0) {
      metricLoadedPing.textContent = Math.round(maxLoaded).toString();
    }
  };

  // Test Finished
  speedTestInstance.onFinish = (results: any) => {
    currentPhase = 'finished';
    [cardDownload, cardUpload, cardLatency, cardBufferbloat].forEach(c => c.classList.remove('active-testing'));

    finalSummary = results.getSummary();
    finalScores = results.getScores();

    const finalDown = finalSummary.download ? (finalSummary.download / 1e6) : peakDownload;
    const finalUp = finalSummary.upload ? (finalSummary.upload / 1e6) : peakUpload;

    metricDownload.textContent = finalDown.toFixed(1);
    metricUpload.textContent = finalUp.toFixed(1);

    updateGauge(finalDown, 'COMPLETED');
    testPhaseBadge.className = 'phase-badge';
    testSubstatus.textContent = 'Speed test completed successfully';

    // Apply AIM Scores
    if (finalScores) {
      applyBadgeScore(scoreGaming, finalScores.gaming);
      applyBadgeScore(scoreStreaming, finalScores.streaming);
      applyBadgeScore(scoreRtc, finalScores.rtc);
    }

    startBtn.disabled = false;
    startBtn.querySelector('span')!.textContent = 'Test Again';
    resultsActions.classList.remove('hidden');
  };

  speedTestInstance.onError = (err: string) => {
    console.error('Speed test error:', err);
    testPhaseBadge.textContent = 'ERROR';
    testSubstatus.textContent = 'Connection test interrupted. Click start to retry.';
    startBtn.disabled = false;
    startBtn.querySelector('span')!.textContent = 'Retry Test';
  };
}

// Show Toast
function showToast(message: string) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3000);
}

// Copy Results Summary
function copySummary() {
  if (!finalSummary) return;
  const down = finalSummary.download ? (finalSummary.download / 1e6).toFixed(1) : metricDownload.textContent;
  const up = finalSummary.upload ? (finalSummary.upload / 1e6).toFixed(1) : metricUpload.textContent;
  const ping = metricLatency.textContent;
  const jitter = metricJitter.textContent;
  const loadedPing = metricLoadedPing.textContent;

  const text = [
    `⚡ SolversPro Internet Speed Test (speed.solverspro.com)`,
    `⬇️ Download: ${down} Mbps`,
    `⬆️ Upload: ${up} Mbps`,
    `📶 Latency: ${ping} ms (Jitter: ${jitter} ms)`,
    `🔄 Bufferbloat: ${loadedPing} ms under load`,
    `🎮 Gaming: ${scoreGaming.textContent} | 🎬 Streaming: ${scoreStreaming.textContent} | 📹 Video Calls: ${scoreRtc.textContent}`,
    `Tested via Cloudflare Global Edge`
  ].join('\n');

  navigator.clipboard.writeText(text).then(() => {
    showToast('Results copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy to clipboard');
  });
}

// Share Test
function shareTest() {
  if (navigator.share) {
    navigator.share({
      title: 'SolversPro Speed Test Results',
      text: `My connection speed is ${metricDownload.textContent} Mbps download / ${metricUpload.textContent} Mbps upload on SolversPro Speed Test.`,
      url: window.location.href
    }).catch(() => {});
  } else {
    copySummary();
  }
}

// Event Listeners
startBtn.addEventListener('click', runSpeedTest);
btnCopySummary.addEventListener('click', copySummary);
btnShare.addEventListener('click', shareTest);

// Initialize telemetry on load
fetchTelemetry();
