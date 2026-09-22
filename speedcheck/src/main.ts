import SpeedTest from '@cloudflare/speedtest';

// ============================================================
// DOM Elements
// ============================================================
const statusLabel = document.getElementById('status-label')!;
const speedValue = document.getElementById('speed-value')!;
const btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;
const progressRing = document.getElementById('progress-ring')!;
const progressFill = document.getElementById('progress-ring__fill')!;
const progressPhase = document.getElementById('progress-phase')!;
const btnDetails = document.getElementById('btn-details') as HTMLButtonElement;
const btnDetailsText = document.getElementById('btn-details-text')!;
const detailsPanel = document.getElementById('details-panel')!;
const detailPing = document.getElementById('detail-ping')!;
const detailLoaded = document.getElementById('detail-loaded')!;
const detailUpload = document.getElementById('detail-upload')!;
const infoClient = document.getElementById('info-client')!;
const infoServer = document.getElementById('info-server')!;
const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
const btnShare = document.getElementById('btn-share') as HTMLButtonElement;
const toastEl = document.getElementById('toast')!;

// ============================================================
// State
// ============================================================
let speedTestInstance: any = null;
let currentPhase: 'idle' | 'latency' | 'download' | 'upload' | 'finished' = 'idle';
let finalDownMbps = 0;
let finalUpMbps = 0;
let finalPing = 0;
let finalLoadedPing = 0;
let detailsExpanded = false;

// ============================================================
// Telemetry (Client IP, ISP, Server)
// ============================================================
async function fetchTelemetry() {
  try {
    const res = await fetch('/api/meta');
    if (res.ok) {
      const data = await res.json();
      const parts: string[] = [];
      if (data.city) parts.push(data.city);
      if (data.country) parts.push(data.country);
      if (data.clientIp) parts.push(data.clientIp);
      if (data.asOrganization) parts.push(data.asOrganization);
      infoClient.textContent = parts.join('  ') || 'Detected';
      if (data.colo) {
        infoServer.textContent = `Cloudflare (${data.colo}${data.city ? ` - ${data.city}` : ''})`;
      }
      return;
    }
  } catch (_) {
    // fallback
  }

  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const { ip } = await res.json();
      infoClient.textContent = `${ip}  •  Local/ISP`;
    }
  } catch (_) {
    infoClient.textContent = 'Active Connection';
  }
}

// ============================================================
// UI Helpers
// ============================================================
function setProgress(percent: number) {
  progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
}

function showToast(message: string) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3000);
}

function toggleDetails() {
  detailsExpanded = !detailsExpanded;
  if (detailsExpanded) {
    detailsPanel.classList.remove('collapsed');
    detailsPanel.classList.add('expanded');
    btnDetails.classList.add('expanded');
    btnDetailsText.textContent = 'Hide details';
  } else {
    detailsPanel.classList.remove('expanded');
    detailsPanel.classList.add('collapsed');
    btnDetails.classList.remove('expanded');
    btnDetailsText.textContent = 'Show more info';
  }
}

// ============================================================
// Reset UI
// ============================================================
function resetUI() {
  finalDownMbps = 0;
  finalUpMbps = 0;
  finalPing = 0;
  finalLoadedPing = 0;

  speedValue.textContent = '0';
  speedValue.classList.remove('done', 'pulsing');
  speedValue.classList.add('testing', 'pulsing');

  statusLabel.textContent = 'Measuring your speed...';
  statusLabel.classList.add('testing');

  btnRestart.classList.remove('visible');
  btnDetails.classList.add('hidden');
  detailsPanel.classList.remove('expanded');
  detailsPanel.classList.add('collapsed');
  detailsExpanded = false;
  btnDetails.classList.remove('expanded');
  btnDetailsText.textContent = 'Show more info';

  progressRing.classList.remove('hidden');
  setProgress(0);
  progressPhase.textContent = 'Connecting...';

  detailPing.textContent = '—';
  detailLoaded.textContent = '—';
  detailUpload.textContent = '—';

  document.title = 'Internet Speed Test - Fast & Accurate Broadband Speed Checker | SolversPro SpeedCheck';
}

// ============================================================
// Speed Test Execution
// ============================================================
function runSpeedTest() {
  resetUI();

  speedTestInstance = new SpeedTest({
    autoStart: true,
    measureDownloadLoadedLatency: true,
    measureUploadLoadedLatency: true,
  });

  // Phase changes
  speedTestInstance.onPhaseChange = (payload: { measurement: { type: string } }) => {
    const type = payload?.measurement?.type;

    if (type === 'latency') {
      currentPhase = 'latency';
      progressPhase.textContent = 'Measuring latency...';
      setProgress(10);
    } else if (type === 'download') {
      currentPhase = 'download';
      progressPhase.textContent = 'Testing download...';
      setProgress(20);
    } else if (type === 'upload') {
      currentPhase = 'upload';
      progressPhase.textContent = 'Testing upload...';
      setProgress(70);
    }
  };

  // Real-time results
  speedTestInstance.onResultsChange = () => {
    const results = speedTestInstance.results;

    // Latency
    const ping = results.getUnloadedLatency();
    if (ping !== undefined) {
      finalPing = Math.round(ping);
      detailPing.textContent = finalPing.toString();
    }

    // Loaded Latency
    const downLoaded = results.getDownLoadedLatency();
    const upLoaded = results.getUpLoadedLatency();
    const maxLoaded = Math.max(downLoaded || 0, upLoaded || 0);
    if (maxLoaded > 0) {
      finalLoadedPing = Math.round(maxLoaded);
      detailLoaded.textContent = finalLoadedPing.toString();
    }

    // Download
    const downBps = results.getDownloadBandwidth();
    if (downBps !== undefined) {
      const mbps = downBps / 1e6;
      finalDownMbps = mbps;

      if (currentPhase === 'download') {
        // Show rounded integer like fast.com
        speedValue.textContent = Math.round(mbps).toString();
        // Progress bar: 20% to 70% during download
        const downloadProgress = 20 + Math.min(50, (mbps / 500) * 50);
        setProgress(downloadProgress);
      }
    }

    // Upload
    const upBps = results.getUploadBandwidth();
    if (upBps !== undefined) {
      const mbps = upBps / 1e6;
      finalUpMbps = mbps;
      detailUpload.textContent = Math.round(mbps).toString();

      if (currentPhase === 'upload') {
        // During upload, keep showing download speed on the hero
        const uploadProgress = 70 + Math.min(25, (mbps / 200) * 25);
        setProgress(uploadProgress);
      }
    }
  };

  // Finished
  speedTestInstance.onFinish = (results: any) => {
    currentPhase = 'finished';

    const summary = results.getSummary();
    if (summary.download) finalDownMbps = summary.download / 1e6;
    if (summary.upload) finalUpMbps = summary.upload / 1e6;

    // Final hero display
    speedValue.textContent = Math.round(finalDownMbps).toString();
    speedValue.classList.remove('testing', 'pulsing');
    speedValue.classList.add('done');

    statusLabel.textContent = 'Your Internet speed is';
    statusLabel.classList.remove('testing');

    // Update details
    detailUpload.textContent = Math.round(finalUpMbps).toString();

    // Show controls
    setProgress(100);
    setTimeout(() => {
      progressRing.classList.add('hidden');
    }, 600);

    btnRestart.classList.add('visible');
    btnDetails.classList.remove('hidden');

    // Dynamic title like fast.com
    document.title = `${Math.round(finalDownMbps)} Mbps - Internet Speed Test | SolversPro SpeedCheck`;
  };

  // Error
  speedTestInstance.onError = (err: string) => {
    console.error('Speed test error:', err);
    speedValue.textContent = '—';
    speedValue.classList.remove('testing', 'pulsing');
    statusLabel.textContent = 'Test interrupted. Tap restart to try again.';
    statusLabel.classList.remove('testing');
    progressPhase.textContent = 'Error';
    btnRestart.classList.add('visible');
  };
}

// ============================================================
// Copy & Share
// ============================================================
function copySummary() {
  const text = [
    `⚡ SpeedCheck by SolversPro (speedcheck.solverspro.com)`,
    `⬇️ Download: ${Math.round(finalDownMbps)} Mbps`,
    `⬆️ Upload: ${Math.round(finalUpMbps)} Mbps`,
    `📶 Latency: ${finalPing} ms (Loaded: ${finalLoadedPing} ms)`,
    `Tested via Cloudflare Global Edge`
  ].join('\n');

  navigator.clipboard.writeText(text).then(() => {
    showToast('Results copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy');
  });
}

function shareTest() {
  if (navigator.share) {
    navigator.share({
      title: 'SpeedCheck Results',
      text: `My internet speed: ${Math.round(finalDownMbps)} Mbps download / ${Math.round(finalUpMbps)} Mbps upload — tested on SpeedCheck by SolversPro`,
      url: window.location.href
    }).catch(() => {});
  } else {
    copySummary();
  }
}

// ============================================================
// Event Listeners
// ============================================================
btnRestart.addEventListener('click', runSpeedTest);
btnDetails.addEventListener('click', toggleDetails);
btnCopy.addEventListener('click', copySummary);
btnShare.addEventListener('click', shareTest);

// ============================================================
// Auto-Start on Page Load (like fast.com)
// ============================================================
fetchTelemetry();

// Small delay so the page renders the initial animation first
setTimeout(() => {
  runSpeedTest();
}, 800);
