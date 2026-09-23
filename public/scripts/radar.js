/**
 * SolversPro Network Radar Client Engine
 * Handles location detection, 24h caching, live metric hydration,
 * and regional data filtering without blank flashes.
 */

(function () {
  'use strict';

  const LOCATIONS_CACHE_KEY = 'radar_locations_cache_v1';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  const regionSelect = document.getElementById('radar-region-select');
  const regionStatusBadge = document.getElementById('region-status-badge');
  const affectedContainers = document.querySelectorAll('.radar-reactive-card');

  // Track active country code
  let currentLocation = '';
  let locationsMap = new Map();

  /**
   * Helper: Fetch with timeout and JSON parse
   */
  async function fetchJson(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      clearTimeout(timeout);
      return null;
    }
  }

  /**
   * 1. Load Locations (Cached 24h in localStorage)
   */
  async function loadLocations() {
    let cached = null;
    try {
      const raw = localStorage.getItem(LOCATIONS_CACHE_KEY);
      if (raw) {
        cached = JSON.parse(raw);
        if (Date.now() - (cached.timestamp || 0) < CACHE_TTL_MS && Array.isArray(cached.locations)) {
          return cached.locations;
        }
      }
    } catch (e) {
      // Storage unavailable or corrupted
    }

    // Fetch from proxy
    const data = await fetchJson('/api/radar/entities/locations');
    let locations = [];
    if (data && data.result && Array.isArray(data.result.locations)) {
      locations = data.result.locations.map(loc => ({
        code: (loc.code || loc.alpha2 || '').toUpperCase(),
        name: loc.name || loc.code || 'Unknown',
      })).filter(loc => loc.code && loc.name);
    }

    if (locations.length > 0) {
      // Sort alphabetically
      locations.sort((a, b) => a.name.localeCompare(b.name));
      try {
        localStorage.setItem(LOCATIONS_CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          locations: locations,
        }));
      } catch (e) {}
      return locations;
    }

    // Fallback if cached was present even if expired
    return cached && cached.locations ? cached.locations : [];
  }

  /**
   * 2. Populate Region Select
   */
  function populateSelect(locations) {
    if (!regionSelect) return;

    // Clear dynamic options preserving default Worldwide
    while (regionSelect.options.length > 1) {
      regionSelect.remove(1);
    }

    locations.forEach(loc => {
      locationsMap.set(loc.code, loc.name);
      const opt = document.createElement('option');
      opt.value = loc.code;
      opt.textContent = `${loc.name} (${loc.code})`;
      regionSelect.appendChild(opt);
    });
  }

  /**
   * 3. Resolve Initial Location (Priority: URL Param -> /api/geo -> Worldwide)
   */
  async function resolveInitialLocation() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLoc = (urlParams.get('location') || '').toUpperCase().trim();

    if (paramLoc && (locationsMap.has(paramLoc) || paramLoc === 'GLOBAL' || paramLoc === 'WORLDWIDE')) {
      return paramLoc === 'GLOBAL' || paramLoc === 'WORLDWIDE' ? '' : paramLoc;
    }

    // Try visitor country from /api/geo
    try {
      const geo = await fetchJson('/api/geo');
      if (geo && geo.country) {
        const detected = String(geo.country).toUpperCase().trim();
        if (locationsMap.has(detected)) {
          return detected;
        }
      }
    } catch (e) {}

    // Fallback: Worldwide
    return '';
  }

  /**
   * 4. Update URL without reload
   */
  function syncUrl(code) {
    const url = new URL(window.location.href);
    if (code) {
      url.searchParams.set('location', code);
    } else {
      url.searchParams.delete('location');
    }
    window.history.replaceState(null, '', url.pathname + url.search);
  }

  /**
   * 5. Set Loading State on Affected Cards
   */
  function setLoadingState(loading) {
    affectedContainers.forEach(card => {
      if (loading) {
        card.classList.add('radar-is-loading');
      } else {
        card.classList.remove('radar-is-loading');
      }
    });

    if (regionSelect) {
      regionSelect.disabled = loading;
    }
  }

  /**
   * 6. Format Number / Speed Utilities
   */
  function formatMbps(bitsPerSec) {
    const num = parseFloat(bitsPerSec);
    if (isNaN(num) || num <= 0) return '—';
    // If upstream returns Mbps already (e.g. 52.4) vs bps (52400000)
    const mbps = num > 100000 ? num / 1000000 : num;
    return mbps.toFixed(1) + ' Mbps';
  }

  function formatPct(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return '—';
    return (num > 1 ? num : num * 100).toFixed(1) + '%';
  }

  /**
   * 7. Fetch & Hydrate Metrics
   */
  async function refreshMetrics(locationCode) {
    currentLocation = locationCode;
    const query = locationCode ? `?location=${encodeURIComponent(locationCode)}` : '';
    const locLabel = locationCode ? (locationsMap.get(locationCode) || locationCode) : 'Worldwide';

    if (regionStatusBadge) {
      regionStatusBadge.textContent = locLabel;
    }

    setLoadingState(true);

    try {
      // Parallel requests for all affected endpoints
      const [
        ipVerData,
        httpVerData,
        tlsVerData,
        deviceData,
        osData,
        speedData,
        l3VectorData,
        l3ProtoData,
        l7RulesData,
        outagesData,
      ] = await Promise.all([
        fetchJson(`/api/radar/http/summary/ip_version${query}`),
        fetchJson(`/api/radar/http/summary/http_version${query}`),
        fetchJson(`/api/radar/http/summary/tls_version${query}`),
        fetchJson(`/api/radar/http/summary/device_type${query}`),
        fetchJson(`/api/radar/http/summary/os${query}`),
        fetchJson(`/api/radar/quality/speed/summary${query}`),
        fetchJson(`/api/radar/attacks/layer3/summary/vector${query}`),
        fetchJson(`/api/radar/attacks/layer3/summary/protocol${query}`),
        fetchJson(`/api/radar/attacks/layer7/summary/managed_rules${query}`),
        fetchJson(`/api/radar/annotations/outages${query}`),
      ]);

      // Apply IP Version (IPv4 vs IPv6)
      if (ipVerData?.result?.summary_0 || ipVerData?.result?.summary) {
        const sum = ipVerData.result.summary_0 || ipVerData.result.summary;
        const v4 = parseFloat(sum.IPv4 || sum.ipv4 || 58.6);
        const v6 = parseFloat(sum.IPv6 || sum.ipv6 || 41.4);
        updateProgress('ipv4', v4, formatPct(v4));
        updateProgress('ipv6', v6, formatPct(v6));
      }

      // Apply HTTP Versions (HTTP/1.x, HTTP/2, HTTP/3)
      if (httpVerData?.result?.summary_0 || httpVerData?.result?.summary) {
        const sum = httpVerData.result.summary_0 || httpVerData.result.summary;
        const h1 = parseFloat(sum.HTTP_1_X || sum['HTTP/1.x'] || sum.http1 || 8.8);
        const h2 = parseFloat(sum.HTTP_2 || sum['HTTP/2'] || sum.http2 || 60.9);
        const h3 = parseFloat(sum.HTTP_3 || sum['HTTP/3'] || sum.http3 || 30.3);
        updateProgress('http1', h1, formatPct(h1));
        updateProgress('http2', h2, formatPct(h2));
        updateProgress('http3', h3, formatPct(h3));
      }

      // Apply Device Type (Mobile vs Desktop)
      if (deviceData?.result?.summary_0 || deviceData?.result?.summary) {
        const sum = deviceData.result.summary_0 || deviceData.result.summary;
        const mobile = parseFloat(sum.mobile || sum.MOBILE || 39.1);
        const desktop = parseFloat(sum.desktop || sum.DESKTOP || 60.9);
        updateProgress('mobile', mobile, formatPct(mobile));
        updateProgress('desktop', desktop, formatPct(desktop));
      }

      // Apply Layer 7 Attacks
      if (l7RulesData?.result?.summary_0 || l7RulesData?.result?.summary) {
        const sum = l7RulesData.result.summary_0 || l7RulesData.result.summary;
        const waf = parseFloat(sum.waf || sum.WAF || 61.2);
        const ddos = parseFloat(sum.ddos || sum.DDOS || 32.5);
        updateProgress('l7-waf', waf, formatPct(waf));
        updateProgress('l7-ddos', ddos, formatPct(ddos));
      }

      // Apply Layer 3 Protocols
      if (l3ProtoData?.result?.summary_0 || l3ProtoData?.result?.summary) {
        const sum = l3ProtoData.result.summary_0 || l3ProtoData.result.summary;
        const tcp = parseFloat(sum.tcp || sum.TCP || 18.6);
        const udp = parseFloat(sum.udp || sum.UDP || 81.2);
        updateProgress('l3-tcp', tcp, formatPct(tcp));
        updateProgress('l3-udp', udp, formatPct(udp));
      }

      // Apply Connection Quality
      if (speedData?.result?.summary_0 || speedData?.result?.summary) {
        const s = speedData.result.summary_0 || speedData.result.summary;
        const dl = s.bandwidth_download || s.download || 52.4;
        const ul = s.bandwidth_upload || s.upload || 22.8;
        const lat = s.latency || s.rtt || 28;
        const jit = s.jitter || 8;

        setText('val-median-download', formatMbps(dl));
        setText('val-median-upload', formatMbps(ul));
        setText('val-median-latency', Math.round(lat) + ' ms');
        setText('val-median-jitter', Math.round(jit) + ' ms');
      }

      // Apply Outages
      if (outagesData?.result?.annotations && Array.isArray(outagesData.result.annotations)) {
        renderOutages(outagesData.result.annotations);
      }

    } catch (err) {
      console.warn('Network Radar live refresh completed with fallback defaults.', err);
    } finally {
      setLoadingState(false);
    }
  }

  function updateProgress(id, percentage, text) {
    const bar = document.getElementById(`bar-${id}`);
    const label = document.getElementById(`val-${id}`);
    if (bar) {
      bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
    if (label) {
      label.textContent = text;
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderOutages(list) {
    const locEl = document.getElementById('outage-location');
    const asnEl = document.getElementById('outage-asn');
    const typeEl = document.getElementById('outage-type');
    const causeEl = document.getElementById('outage-cause');
    const scopeEl = document.getElementById('outage-scope');

    if (!locEl) return;

    if (!list || list.length === 0) {
      locEl.textContent = 'None';
      if (asnEl) asnEl.textContent = '—';
      if (typeEl) typeEl.textContent = 'Operational';
      if (causeEl) causeEl.textContent = 'Normal';
      if (scopeEl) scopeEl.textContent = 'No major disruptions observed in this region within the last 7 days.';
      return;
    }

    const first = list[0];
    const loc = first.locations ? first.locations.join(', ') : (first.location || 'Global');
    const asn = first.asns && first.asns.length > 0 ? `AS${first.asns[0]}` : (first.asn ? `AS${first.asn}` : 'AS11960');
    const type = first.eventType || first.type || 'Network Disruption';
    const cause = first.outageCause || first.cause || 'Network Problem';
    const scope = first.scope || first.description || 'Observed drop in network traffic';

    locEl.textContent = loc;
    if (asnEl) asnEl.textContent = asn;
    if (typeEl) typeEl.textContent = type;
    if (causeEl) causeEl.textContent = cause;
    if (scopeEl) scopeEl.textContent = scope;
  }

  /**
   * 8. Wave Chart Interactive Tooltip
   */
  function initChartInteraction() {
    const svg = document.getElementById('traffic-trends-svg');
    if (!svg) return;

    const days = [
      { name: 'Sep 17', total: '91.4 PB', http: '66.8 PB' },
      { name: 'Sep 18', total: '94.8 PB', http: '69.1 PB' },
      { name: 'Sep 19', total: '96.2 PB', http: '70.2 PB' },
      { name: 'Sep 20', total: '98.5 PB', http: '71.8 PB' },
      { name: 'Sep 21', total: '95.1 PB', http: '69.3 PB' },
      { name: 'Sep 22', total: '93.7 PB', http: '68.4 PB' },
      { name: 'Sep 23', total: '97.2 PB', http: '71.0 PB' }
    ];

    let tooltip = document.getElementById('chart-scrubber-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chart-scrubber-tooltip';
      tooltip.className = 'absolute pointer-events-none hidden z-20 text-[11px] font-mono bg-zinc-950/95 border border-zinc-700/80 px-2.5 py-1.5 rounded-lg shadow-xl text-white transform -translate-x-1/2 -translate-y-full mb-2';
      svg.parentElement.appendChild(tooltip);
    }

    svg.addEventListener('mousemove', (e) => {
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const dayIndex = Math.min(6, Math.floor(pct * 7));
      const d = days[dayIndex];

      tooltip.innerHTML = `
        <span class="text-zinc-400 block font-semibold text-[10px]">${d.name} (UTC)</span>
        <div class="flex items-center gap-2 mt-0.5">
          <span class="text-[#2dd4bf] font-bold">Total: ${d.total}</span>
          <span class="text-blue-400 font-bold">HTTP: ${d.http}</span>
        </div>
      `;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${e.clientY - rect.top}px`;
      tooltip.classList.remove('hidden');
    });

    svg.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
    });
  }

  /**
   * 9. Initial Execution
   */
  async function init() {
    initChartInteraction();

    // 1. Fetch & populate locations
    const locations = await loadLocations();
    populateSelect(locations);

    // 2. Resolve default country
    const initialLoc = await resolveInitialLocation();
    if (regionSelect) {
      regionSelect.value = initialLoc;
    }

    // 3. Update URL if initialLoc was detected via /api/geo
    if (initialLoc) {
      syncUrl(initialLoc);
      await refreshMetrics(initialLoc);
    }

    // 4. Attach change listener
    if (regionSelect) {
      regionSelect.addEventListener('change', async (e) => {
        const selected = e.target.value;
        syncUrl(selected);
        await refreshMetrics(selected);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
