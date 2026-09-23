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
        const v4 = parseFloat(sum.IPv4 || sum.ipv4 || 65.5);
        const v6 = parseFloat(sum.IPv6 || sum.ipv6 || 34.5);
        updateProgress('ipv4', v4, formatPct(v4));
        updateProgress('ipv6', v6, formatPct(v6));
      }

      // Apply HTTP Versions (HTTP/1.x, HTTP/2, HTTP/3)
      if (httpVerData?.result?.summary_0 || httpVerData?.result?.summary) {
        const sum = httpVerData.result.summary_0 || httpVerData.result.summary;
        const h1 = parseFloat(sum.HTTP_1_X || sum['HTTP/1.x'] || sum.http1 || 18.2);
        const h2 = parseFloat(sum.HTTP_2 || sum['HTTP/2'] || sum.http2 || 51.4);
        const h3 = parseFloat(sum.HTTP_3 || sum['HTTP/3'] || sum.http3 || 30.4);
        updateProgress('http1', h1, formatPct(h1));
        updateProgress('http2', h2, formatPct(h2));
        updateProgress('http3', h3, formatPct(h3));
      }

      // Apply TLS Versions
      if (tlsVerData?.result?.summary_0 || tlsVerData?.result?.summary) {
        const sum = tlsVerData.result.summary_0 || tlsVerData.result.summary;
        const tls13 = parseFloat(sum.TLS_1_3 || sum['TLS 1.3'] || 74.8);
        const tls12 = parseFloat(sum.TLS_1_2 || sum['TLS 1.2'] || 24.6);
        updateProgress('tls13', tls13, formatPct(tls13));
        updateProgress('tls12', tls12, formatPct(tls12));
      }

      // Apply Device Type (Mobile vs Desktop)
      if (deviceData?.result?.summary_0 || deviceData?.result?.summary) {
        const sum = deviceData.result.summary_0 || deviceData.result.summary;
        const mobile = parseFloat(sum.mobile || sum.MOBILE || 58.2);
        const desktop = parseFloat(sum.desktop || sum.DESKTOP || 41.8);
        updateProgress('device-mobile', mobile, formatPct(mobile));
        updateProgress('device-desktop', desktop, formatPct(desktop));
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

        // Update comparison card label if country is selected
        const compareLabel = document.getElementById('compare-region-label');
        if (compareLabel) {
          compareLabel.textContent = locationCode ? `${locLabel} Median` : 'Global Median';
        }
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
    const tbody = document.getElementById('outages-tbody');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="py-4 px-4 text-center text-zinc-500 italic">No major disruptions observed in this region within the last 7 days.</td></tr>`;
      return;
    }

    const rows = list.slice(0, 5).map(item => {
      const date = item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Recent';
      const loc = item.locations ? item.locations.join(', ') : (item.location || 'Global');
      const type = item.eventType || item.type || 'Disruption';
      const scope = item.scope || item.description || 'Observed traffic drop';
      return `
        <tr class="border-b border-zinc-800/60 hover:bg-white/[0.02] transition-colors">
          <td class="py-3 px-4 font-mono text-xs text-[#ff6b35] font-semibold">${date}</td>
          <td class="py-3 px-4 text-sm text-white font-medium">${loc}</td>
          <td class="py-3 px-4 text-xs font-mono text-zinc-300"><span class="px-2 py-0.5 rounded bg-zinc-800/80">${type}</span></td>
          <td class="py-3 px-4 text-xs text-zinc-400 truncate max-w-xs">${scope}</td>
        </tr>
      `;
    }).join('');

    tbody.innerHTML = rows;
  }

  /**
   * 8. Initial Execution
   */
  async function init() {
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
