/**
 * SolversPro Network Radar Client Engine v2
 * Rich searchable country dropdown (continents + countries),
 * date range picker with dual-month calendar and presets,
 * live metric hydration, and regional data filtering.
 */

(function () {
  'use strict';

  const LOCATIONS_CACHE_KEY = 'radar_locations_cache_v1';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Region Dropdown Elements
  const regionContainer = document.getElementById('region-dropdown-container');
  const regionTrigger = document.getElementById('region-dropdown-trigger');
  const regionPanel = document.getElementById('region-dropdown-panel');
  const regionLabel = document.getElementById('region-dropdown-label');
  const regionChevron = document.getElementById('region-dropdown-chevron');
  const regionSearchInput = document.getElementById('region-search-input');
  const regionGroupsContainer = document.getElementById('region-groups-container');
  const regionNoResults = document.getElementById('region-no-results');
  const regionStatusBadge = document.getElementById('region-status-badge');

  // Date Picker Elements
  const dateContainer = document.getElementById('date-picker-container');
  const dateTrigger = document.getElementById('date-picker-trigger');
  const datePanel = document.getElementById('date-picker-panel');
  const dateLabel = document.getElementById('date-picker-label');
  const calPrevBtn = document.getElementById('cal-prev-btn');
  const calNextBtn = document.getElementById('cal-next-btn');
  const calMonthLeftTitle = document.getElementById('cal-month-left-title');
  const calMonthRightTitle = document.getElementById('cal-month-right-title');
  const calGridLeft = document.getElementById('cal-grid-left');
  const calGridRight = document.getElementById('cal-grid-right');
  const datePresetButtons = document.querySelectorAll('.radar-date-preset');

  const affectedContainers = document.querySelectorAll('.radar-reactive-card');

  // State
  let currentLocation = '';
  let locationsMap = new Map();
  let currentDateStart = null;
  let currentDateEnd = null;
  let activePresetHours = 168; // default: 7 days
  let calViewYear = 0;
  let calViewMonth = 0;

  // Continent mappings
  const CONTINENTS = {
    'Africa': ['AO','BF','BI','BJ','BW','CD','CF','CG','CI','CM','CV','DJ','DZ','EG','EH','ER','ET','GA','GH','GM','GN','GQ','GW','KE','KM','LR','LS','LY','MA','MG','ML','MR','MU','MW','MZ','NA','NE','NG','RE','RW','SC','SD','SL','SN','SO','SS','ST','SZ','TD','TG','TN','TZ','UG','YT','ZA','ZM','ZW'],
    'Asia': ['AE','AF','AM','AZ','BD','BH','BN','BT','CN','CY','GE','HK','ID','IL','IN','IQ','IR','JO','JP','KG','KH','KP','KR','KW','KZ','LA','LB','LK','MM','MN','MO','MV','MY','NP','OM','PH','PK','PS','QA','SA','SG','SY','TH','TJ','TL','TM','TR','TW','UZ','VN','YE'],
    'Europe': ['AD','AL','AT','BA','BE','BG','BY','CH','CZ','DE','DK','EE','ES','FI','FO','FR','GB','GI','GR','HR','HU','IE','IS','IT','LI','LT','LU','LV','MC','MD','ME','MK','MT','NL','NO','PL','PT','RO','RS','RU','SE','SI','SK','SM','UA','VA','XK'],
    'North America': ['AG','AI','AW','BB','BL','BM','BS','BZ','CA','CR','CU','CW','DM','DO','GD','GL','GP','GT','HN','HT','JM','KN','KY','LC','MF','MQ','MS','MX','NI','PA','PM','PR','SV','SX','TC','TT','US','VC','VG','VI'],
    'Oceania': ['AS','AU','CK','FJ','FM','GU','KI','MH','MP','NC','NF','NR','NU','NZ','PF','PG','PN','PW','SB','TK','TO','TV','VU','WF','WS'],
    'South America': ['AR','BO','BR','CL','CO','EC','FK','GF','GY','PE','PY','SR','UY','VE']
  };

  // ─── UTILITIES ──────────────────────────────────────────────

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

  function formatMbps(bitsPerSec) {
    const num = parseFloat(bitsPerSec);
    if (isNaN(num) || num <= 0) return '—';
    const mbps = num > 100000 ? num / 1000000 : num;
    return mbps.toFixed(1) + ' Mbps';
  }

  function formatPct(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return '—';
    return (num > 1 ? num : num * 100).toFixed(1) + '%';
  }

  function updateProgress(id, percentage, text) {
    const bar = document.getElementById(`bar-${id}`);
    const label = document.getElementById(`val-${id}`);
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    if (label) label.textContent = text;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ─── LOCATIONS LOADING ──────────────────────────────────────

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
    } catch (e) {}

    const data = await fetchJson('/api/radar/entities/locations');
    let locations = [];
    if (data && data.result && Array.isArray(data.result.locations)) {
      locations = data.result.locations.map(loc => ({
        code: (loc.code || loc.alpha2 || '').toUpperCase(),
        name: loc.name || loc.code || 'Unknown',
      })).filter(loc => loc.code && loc.name);
    }

    if (locations.length > 0) {
      locations.sort((a, b) => a.name.localeCompare(b.name));
      try {
        localStorage.setItem(LOCATIONS_CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          locations: locations,
        }));
      } catch (e) {}
      return locations;
    }

    return cached && cached.locations ? cached.locations : [];
  }

  // ─── REGION DROPDOWN ────────────────────────────────────────

  function buildRegionGroups(locations) {
    if (!regionGroupsContainer) return;

    // Build code-to-name map
    locations.forEach(loc => locationsMap.set(loc.code, loc.name));

    const html = [];

    // Group by continent
    for (const [continent, codes] of Object.entries(CONTINENTS)) {
      const countriesInContinent = codes
        .filter(code => locationsMap.has(code))
        .map(code => ({ code, name: locationsMap.get(code) }))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (countriesInContinent.length === 0) continue;

      html.push(`
        <div class="radar-continent-group" data-continent="${continent}">
          <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/50 border-y border-zinc-800/50 flex items-center justify-between select-none">
            <span>${continent}</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">${countriesInContinent.length}</span>
          </div>
          ${countriesInContinent.map(c => `
            <div
              class="radar-region-option flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800/70 hover:text-white transition-colors"
              data-value="${c.code}"
              data-name="${c.name}"
              role="option"
            >
              <span class="text-[11px] font-mono text-zinc-500 w-6 shrink-0">${c.code}</span>
              <span class="truncate">${c.name}</span>
            </div>
          `).join('')}
        </div>
      `);
    }

    // Add any remaining countries not assigned to a continent
    const allContinentCodes = new Set(Object.values(CONTINENTS).flat());
    const unassigned = locations.filter(loc => !allContinentCodes.has(loc.code));
    if (unassigned.length > 0) {
      html.push(`
        <div class="radar-continent-group" data-continent="Other">
          <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/50 border-y border-zinc-800/50 flex items-center justify-between select-none">
            <span>Other</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">${unassigned.length}</span>
          </div>
          ${unassigned.map(c => `
            <div
              class="radar-region-option flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800/70 hover:text-white transition-colors"
              data-value="${c.code}"
              data-name="${c.name}"
              role="option"
            >
              <span class="text-[11px] font-mono text-zinc-500 w-6 shrink-0">${c.code}</span>
              <span class="truncate">${c.name}</span>
            </div>
          `).join('')}
        </div>
      `);
    }

    regionGroupsContainer.innerHTML = html.join('');

    // Attach click handlers to all options
    regionGroupsContainer.querySelectorAll('.radar-region-option').forEach(opt => {
      opt.addEventListener('click', () => selectRegion(opt.dataset.value, opt.dataset.name));
    });
  }

  function selectRegion(code, name) {
    currentLocation = code;
    if (regionLabel) regionLabel.textContent = code ? `${name} (${code})` : 'Worldwide';
    if (regionStatusBadge) regionStatusBadge.textContent = code ? name : 'Worldwide';
    closeRegionDropdown();
    syncUrl(code);
    refreshMetrics(code);

    // Highlight selected option
    const allOptions = document.querySelectorAll('.radar-region-option');
    allOptions.forEach(opt => {
      opt.classList.remove('bg-[#2dd4bf]/10', 'text-[#2dd4bf]', 'border-l-2', 'border-[#2dd4bf]');
      if (opt.dataset.value === code) {
        opt.classList.add('bg-[#2dd4bf]/10', 'text-[#2dd4bf]');
      }
    });
  }

  function filterRegions(query) {
    const q = query.toLowerCase().trim();
    const groups = regionGroupsContainer.querySelectorAll('.radar-continent-group');
    let anyVisible = false;

    // Also handle the Worldwide option
    const worldwideOpt = document.querySelector('.radar-region-option[data-value=""]');
    if (worldwideOpt) {
      worldwideOpt.style.display = (!q || 'worldwide'.includes(q)) ? '' : 'none';
      if (!q || 'worldwide'.includes(q)) anyVisible = true;
    }

    groups.forEach(group => {
      const options = group.querySelectorAll('.radar-region-option');
      let groupVisible = false;

      options.forEach(opt => {
        const name = (opt.dataset.name || '').toLowerCase();
        const code = (opt.dataset.value || '').toLowerCase();
        const match = !q || name.includes(q) || code.includes(q);
        opt.style.display = match ? '' : 'none';
        if (match) {
          groupVisible = true;
          anyVisible = true;
        }
      });

      // Also check continent name
      const continent = (group.dataset.continent || '').toLowerCase();
      if (q && continent.includes(q)) {
        // Show all items in this continent
        options.forEach(opt => {
          opt.style.display = '';
          groupVisible = true;
          anyVisible = true;
        });
      }

      group.style.display = groupVisible ? '' : 'none';
    });

    if (regionNoResults) {
      regionNoResults.classList.toggle('hidden', anyVisible);
    }
  }

  function openRegionDropdown() {
    if (!regionPanel) return;
    regionPanel.classList.remove('hidden');
    if (regionChevron) regionChevron.style.transform = 'rotate(180deg)';
    if (regionTrigger) regionTrigger.setAttribute('aria-expanded', 'true');
    if (regionSearchInput) {
      regionSearchInput.value = '';
      filterRegions('');
      setTimeout(() => regionSearchInput.focus(), 50);
    }
  }

  function closeRegionDropdown() {
    if (!regionPanel) return;
    regionPanel.classList.add('hidden');
    if (regionChevron) regionChevron.style.transform = '';
    if (regionTrigger) regionTrigger.setAttribute('aria-expanded', 'false');
  }

  function toggleRegionDropdown() {
    if (regionPanel && regionPanel.classList.contains('hidden')) {
      openRegionDropdown();
    } else {
      closeRegionDropdown();
    }
  }

  // ─── DATE RANGE PICKER ──────────────────────────────────────

  const PRESET_LABELS = {
    24: 'Last 24 hours',
    48: 'Last 48 hours',
    168: 'Last 7 days',
    336: 'Last 2 weeks',
    672: 'Last 4 weeks',
    2160: 'Last 3 months',
    4320: 'Last 6 months',
    8760: 'Last 12 months',
  };

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function computeDateRange(hours) {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
    return { start, end };
  }

  function formatISODate(d) {
    return d.toISOString().split('T')[0];
  }

  function setActivePreset(hours) {
    activePresetHours = hours;
    const range = computeDateRange(hours);
    currentDateStart = range.start;
    currentDateEnd = range.end;

    if (dateLabel) dateLabel.textContent = PRESET_LABELS[hours] || `Last ${hours}h`;

    // Update preset button styles
    datePresetButtons.forEach(btn => {
      const btnHours = parseInt(btn.dataset.hours, 10);
      if (btnHours === hours) {
        btn.className = 'radar-date-preset text-left px-3 py-1.5 text-xs font-mono rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold';
      } else {
        btn.className = 'radar-date-preset text-left px-3 py-1.5 text-xs font-mono rounded-lg hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors';
      }
    });

    // Update calendar to show the date range
    calViewYear = currentDateEnd.getFullYear();
    calViewMonth = currentDateEnd.getMonth();
    // Show previous month on left, current month on right
    if (calViewMonth === 0) {
      renderCalendar(calViewYear - 1, 11, calViewYear, 0);
    } else {
      renderCalendar(calViewYear, calViewMonth - 1, calViewYear, calViewMonth);
    }
  }

  function renderCalendar(leftYear, leftMonth, rightYear, rightMonth) {
    if (calMonthLeftTitle) calMonthLeftTitle.textContent = `${MONTH_NAMES[leftMonth]} ${leftYear}`;
    if (calMonthRightTitle) calMonthRightTitle.textContent = `${MONTH_NAMES[rightMonth]} ${rightYear}`;

    if (calGridLeft) calGridLeft.innerHTML = buildMonthGrid(leftYear, leftMonth);
    if (calGridRight) calGridRight.innerHTML = buildMonthGrid(rightYear, rightMonth);

    // Store for nav
    calViewYear = rightYear;
    calViewMonth = rightMonth;
  }

  function buildMonthGrid(year, month) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    let cells = '';

    // Leading empty cells
    for (let i = 0; i < startDow; i++) {
      cells += `<div class="w-7 h-7"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const isFuture = date > today;
      const isToday = date.getTime() === today.getTime();

      // Check if date is in current selection range
      let inRange = false;
      let isStart = false;
      let isEnd = false;
      if (currentDateStart && currentDateEnd) {
        const ds = new Date(currentDateStart); ds.setHours(0, 0, 0, 0);
        const de = new Date(currentDateEnd); de.setHours(0, 0, 0, 0);
        inRange = date >= ds && date <= de;
        isStart = date.getTime() === ds.getTime();
        isEnd = date.getTime() === de.getTime();
      }

      let classes = 'w-7 h-7 text-[11px] font-mono rounded flex items-center justify-center cursor-default ';
      if (isFuture) {
        classes += 'text-zinc-700';
      } else if (isStart || isEnd) {
        classes += 'bg-blue-600 text-white font-bold';
      } else if (inRange) {
        classes += 'bg-blue-600/20 text-blue-300';
      } else if (isToday) {
        classes += 'text-[#2dd4bf] font-bold ring-1 ring-[#2dd4bf]/40';
      } else {
        classes += 'text-zinc-300 hover:bg-zinc-800/60';
      }

      cells += `<div class="${classes}">${d}</div>`;
    }

    return cells;
  }

  function openDatePicker() {
    if (!datePanel) return;
    datePanel.classList.remove('hidden');
    if (dateTrigger) dateTrigger.setAttribute('aria-expanded', 'true');
  }

  function closeDatePicker() {
    if (!datePanel) return;
    datePanel.classList.add('hidden');
    if (dateTrigger) dateTrigger.setAttribute('aria-expanded', 'false');
  }

  function toggleDatePicker() {
    if (datePanel && datePanel.classList.contains('hidden')) {
      openDatePicker();
    } else {
      closeDatePicker();
    }
  }

  // ─── URL SYNC ───────────────────────────────────────────────

  function syncUrl(code) {
    const url = new URL(window.location.href);
    if (code) {
      url.searchParams.set('location', code);
    } else {
      url.searchParams.delete('location');
    }
    window.history.replaceState(null, '', url.pathname + url.search);
  }

  // ─── LOADING STATE ──────────────────────────────────────────

  function setLoadingState(loading) {
    affectedContainers.forEach(card => {
      if (loading) {
        card.classList.add('radar-is-loading');
      } else {
        card.classList.remove('radar-is-loading');
      }
    });
  }

  // ─── METRICS REFRESH ───────────────────────────────────────

  async function refreshMetrics(locationCode) {
    currentLocation = locationCode;
    const params = new URLSearchParams();
    if (locationCode) params.set('location', locationCode);
    if (currentDateStart) params.set('dateStart', currentDateStart.toISOString());
    if (currentDateEnd) params.set('dateEnd', currentDateEnd.toISOString());
    const query = params.toString() ? `?${params.toString()}` : '';
    const locLabel = locationCode ? (locationsMap.get(locationCode) || locationCode) : 'Worldwide';

    if (regionStatusBadge) regionStatusBadge.textContent = locLabel;

    setLoadingState(true);

    try {
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
      if (scopeEl) scopeEl.textContent = 'No major disruptions observed in this region within the selected period.';
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

  // ─── CHART INTERACTION ──────────────────────────────────────

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

  // ─── LOCATION RESOLVER ─────────────────────────────────────

  async function resolveInitialLocation() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramLoc = (urlParams.get('location') || '').toUpperCase().trim();

    if (paramLoc && (locationsMap.has(paramLoc) || paramLoc === 'GLOBAL' || paramLoc === 'WORLDWIDE')) {
      return paramLoc === 'GLOBAL' || paramLoc === 'WORLDWIDE' ? '' : paramLoc;
    }

    try {
      const geo = await fetchJson('/api/geo');
      if (geo && geo.country) {
        const detected = String(geo.country).toUpperCase().trim();
        if (locationsMap.has(detected)) {
          return detected;
        }
      }
    } catch (e) {}

    return '';
  }

  // ─── EVENT BINDINGS ─────────────────────────────────────────

  function bindEvents() {
    // Region dropdown
    if (regionTrigger) {
      regionTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDatePicker();
        toggleRegionDropdown();
      });
    }

    // Worldwide option
    const worldwideOpt = document.querySelector('.radar-region-option[data-value=""]');
    if (worldwideOpt) {
      worldwideOpt.addEventListener('click', () => selectRegion('', 'Worldwide'));
    }

    // Search input
    if (regionSearchInput) {
      regionSearchInput.addEventListener('input', (e) => {
        filterRegions(e.target.value);
      });
      regionSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeRegionDropdown();
      });
    }

    // Date picker
    if (dateTrigger) {
      dateTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeRegionDropdown();
        toggleDatePicker();
      });
    }

    // Preset buttons
    datePresetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const hours = parseInt(btn.dataset.hours, 10);
        setActivePreset(hours);
        closeDatePicker();
        refreshMetrics(currentLocation);
      });
    });

    // Calendar nav
    if (calPrevBtn) {
      calPrevBtn.addEventListener('click', () => {
        let leftMonth = calViewMonth - 2;
        let leftYear = calViewYear;
        if (leftMonth < 0) { leftMonth += 12; leftYear--; }
        let rightMonth = calViewMonth - 1;
        let rightYear = calViewYear;
        if (rightMonth < 0) { rightMonth += 12; rightYear--; }
        renderCalendar(leftYear, leftMonth, rightYear, rightMonth);
      });
    }

    if (calNextBtn) {
      calNextBtn.addEventListener('click', () => {
        let leftMonth = calViewMonth;
        let leftYear = calViewYear;
        let rightMonth = calViewMonth + 1;
        let rightYear = calViewYear;
        if (rightMonth > 11) { rightMonth -= 12; rightYear++; }
        renderCalendar(leftYear, leftMonth, rightYear, rightMonth);
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (regionContainer && !regionContainer.contains(e.target)) {
        closeRegionDropdown();
      }
      if (dateContainer && !dateContainer.contains(e.target)) {
        closeDatePicker();
      }
    });

    // Escape key closes everything
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeRegionDropdown();
        closeDatePicker();
      }
    });

    // Prevent clicks inside panels from closing them
    if (regionPanel) {
      regionPanel.addEventListener('click', (e) => e.stopPropagation());
    }
    if (datePanel) {
      datePanel.addEventListener('click', (e) => e.stopPropagation());
    }
  }

  // ─── INITIALIZATION ─────────────────────────────────────────

  async function init() {
    initChartInteraction();
    bindEvents();

    // Set default date range (7 days)
    setActivePreset(168);

    // Load & populate locations
    const locations = await loadLocations();
    buildRegionGroups(locations);

    // Resolve initial location
    const initialLoc = await resolveInitialLocation();
    if (initialLoc) {
      const name = locationsMap.get(initialLoc) || initialLoc;
      selectRegion(initialLoc, name);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
