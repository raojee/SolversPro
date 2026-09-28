/**
 * SolversPro Network Radar Client Engine v2.2
 * Rich searchable country dropdown (continents + countries),
 * interactive date range picker with dual-month calendar and presets,
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
  const regionSearchClear = document.getElementById('region-search-clear');
  const regionGroupsContainer = document.getElementById('region-groups-container');
  const regionNoResults = document.getElementById('region-no-results');
  const regionStatusBadge = document.getElementById('region-status-badge');

  // Date Picker Elements
  const dateContainer = document.getElementById('date-picker-container');
  const dateTrigger = document.getElementById('date-picker-trigger');
  const dateChevron = document.getElementById('date-picker-chevron');
  const datePanel = document.getElementById('date-picker-panel');
  const dateLabel = document.getElementById('date-picker-label');
  const calPrevBtn = document.getElementById('cal-prev-btn');
  const calPrevBtnMobile = document.getElementById('cal-prev-btn-mobile');
  const calNextBtn = document.getElementById('cal-next-btn');
  const calMonthLeftTitle = document.getElementById('cal-month-left-title');
  const calMonthRightTitle = document.getElementById('cal-month-right-title');
  const calGridLeft = document.getElementById('cal-grid-left');
  const calGridRight = document.getElementById('cal-grid-right');
  const calRangeDisplay = document.getElementById('cal-range-display');
  const calCancelBtn = document.getElementById('cal-cancel-btn');
  const calApplyBtn = document.getElementById('cal-apply-btn');
  const datePresetButtons = document.querySelectorAll('.radar-date-preset');

  const affectedContainers = document.querySelectorAll('.radar-reactive-card');

  // State
  let currentLocation = '';
  let locationsMap = new Map();
  let currentDateStart = null;
  let currentDateEnd = null;
  let activePresetHours = 168; // default: 7 days
  let calViewYear = 0;
  let calViewMonth = 0; // right month (0-indexed)
  let pendingStart = null;
  let pendingEnd = null;

  // ─── HARDCODED FALLBACK COUNTRY LIST ────────────────────────
  // Used immediately on page load so dropdown is NEVER empty
  const FALLBACK_LOCATIONS = [
    {code:'AF',name:'Afghanistan'},{code:'AL',name:'Albania'},{code:'DZ',name:'Algeria'},{code:'AD',name:'Andorra'},
    {code:'AO',name:'Angola'},{code:'AG',name:'Antigua and Barbuda'},{code:'AR',name:'Argentina'},{code:'AM',name:'Armenia'},
    {code:'AU',name:'Australia'},{code:'AT',name:'Austria'},{code:'AZ',name:'Azerbaijan'},{code:'BS',name:'Bahamas'},
    {code:'BH',name:'Bahrain'},{code:'BD',name:'Bangladesh'},{code:'BB',name:'Barbados'},{code:'BY',name:'Belarus'},
    {code:'BE',name:'Belgium'},{code:'BZ',name:'Belize'},{code:'BJ',name:'Benin'},{code:'BT',name:'Bhutan'},
    {code:'BO',name:'Bolivia'},{code:'BA',name:'Bosnia and Herzegovina'},{code:'BW',name:'Botswana'},{code:'BR',name:'Brazil'},
    {code:'BN',name:'Brunei'},{code:'BG',name:'Bulgaria'},{code:'BF',name:'Burkina Faso'},{code:'BI',name:'Burundi'},
    {code:'KH',name:'Cambodia'},{code:'CM',name:'Cameroon'},{code:'CA',name:'Canada'},{code:'CV',name:'Cape Verde'},
    {code:'CF',name:'Central African Republic'},{code:'TD',name:'Chad'},{code:'CL',name:'Chile'},{code:'CN',name:'China'},
    {code:'CO',name:'Colombia'},{code:'KM',name:'Comoros'},{code:'CG',name:'Congo'},{code:'CD',name:'Congo (DRC)'},
    {code:'CR',name:'Costa Rica'},{code:'CI',name:"Côte d'Ivoire"},{code:'HR',name:'Croatia'},{code:'CU',name:'Cuba'},
    {code:'CY',name:'Cyprus'},{code:'CZ',name:'Czech Republic'},{code:'DK',name:'Denmark'},{code:'DJ',name:'Djibouti'},
    {code:'DM',name:'Dominica'},{code:'DO',name:'Dominican Republic'},{code:'EC',name:'Ecuador'},{code:'EG',name:'Egypt'},
    {code:'SV',name:'El Salvador'},{code:'GQ',name:'Equatorial Guinea'},{code:'ER',name:'Eritrea'},{code:'EE',name:'Estonia'},
    {code:'SZ',name:'Eswatini'},{code:'ET',name:'Ethiopia'},{code:'FJ',name:'Fiji'},{code:'FI',name:'Finland'},
    {code:'FR',name:'France'},{code:'GA',name:'Gabon'},{code:'GM',name:'Gambia'},{code:'GE',name:'Georgia'},
    {code:'DE',name:'Germany'},{code:'GH',name:'Ghana'},{code:'GR',name:'Greece'},{code:'GD',name:'Grenada'},
    {code:'GT',name:'Guatemala'},{code:'GN',name:'Guinea'},{code:'GW',name:'Guinea-Bissau'},{code:'GY',name:'Guyana'},
    {code:'HT',name:'Haiti'},{code:'HN',name:'Honduras'},{code:'HK',name:'Hong Kong'},{code:'HU',name:'Hungary'},
    {code:'IS',name:'Iceland'},{code:'IN',name:'India'},{code:'ID',name:'Indonesia'},{code:'IR',name:'Iran'},
    {code:'IQ',name:'Iraq'},{code:'IE',name:'Ireland'},{code:'IL',name:'Israel'},{code:'IT',name:'Italy'},
    {code:'JM',name:'Jamaica'},{code:'JP',name:'Japan'},{code:'JO',name:'Jordan'},{code:'KZ',name:'Kazakhstan'},
    {code:'KE',name:'Kenya'},{code:'KI',name:'Kiribati'},{code:'KP',name:'North Korea'},{code:'KR',name:'South Korea'},
    {code:'KW',name:'Kuwait'},{code:'KG',name:'Kyrgyzstan'},{code:'LA',name:'Laos'},{code:'LV',name:'Latvia'},
    {code:'LB',name:'Lebanon'},{code:'LS',name:'Lesotho'},{code:'LR',name:'Liberia'},{code:'LY',name:'Libya'},
    {code:'LI',name:'Liechtenstein'},{code:'LT',name:'Lithuania'},{code:'LU',name:'Luxembourg'},{code:'MO',name:'Macau'},
    {code:'MG',name:'Madagascar'},{code:'MW',name:'Malawi'},{code:'MY',name:'Malaysia'},{code:'MV',name:'Maldives'},
    {code:'ML',name:'Mali'},{code:'MT',name:'Malta'},{code:'MH',name:'Marshall Islands'},{code:'MR',name:'Mauritania'},
    {code:'MU',name:'Mauritius'},{code:'MX',name:'Mexico'},{code:'FM',name:'Micronesia'},{code:'MD',name:'Moldova'},
    {code:'MC',name:'Monaco'},{code:'MN',name:'Mongolia'},{code:'ME',name:'Montenegro'},{code:'MA',name:'Morocco'},
    {code:'MZ',name:'Mozambique'},{code:'MM',name:'Myanmar'},{code:'NA',name:'Namibia'},{code:'NR',name:'Nauru'},
    {code:'NP',name:'Nepal'},{code:'NL',name:'Netherlands'},{code:'NZ',name:'New Zealand'},{code:'NI',name:'Nicaragua'},
    {code:'NE',name:'Niger'},{code:'NG',name:'Nigeria'},{code:'MK',name:'North Macedonia'},{code:'NO',name:'Norway'},
    {code:'OM',name:'Oman'},{code:'PK',name:'Pakistan'},{code:'PW',name:'Palau'},{code:'PS',name:'Palestine'},
    {code:'PA',name:'Panama'},{code:'PG',name:'Papua New Guinea'},{code:'PY',name:'Paraguay'},{code:'PE',name:'Peru'},
    {code:'PH',name:'Philippines'},{code:'PL',name:'Poland'},{code:'PT',name:'Portugal'},{code:'PR',name:'Puerto Rico'},
    {code:'QA',name:'Qatar'},{code:'RO',name:'Romania'},{code:'RU',name:'Russia'},{code:'RW',name:'Rwanda'},
    {code:'KN',name:'Saint Kitts and Nevis'},{code:'LC',name:'Saint Lucia'},{code:'VC',name:'Saint Vincent'},
    {code:'WS',name:'Samoa'},{code:'SM',name:'San Marino'},{code:'ST',name:'São Tomé and Príncipe'},
    {code:'SA',name:'Saudi Arabia'},{code:'SN',name:'Senegal'},{code:'RS',name:'Serbia'},{code:'SC',name:'Seychelles'},
    {code:'SL',name:'Sierra Leone'},{code:'SG',name:'Singapore'},{code:'SK',name:'Slovakia'},{code:'SI',name:'Slovenia'},
    {code:'SB',name:'Solomon Islands'},{code:'SO',name:'Somalia'},{code:'ZA',name:'South Africa'},
    {code:'SS',name:'South Sudan'},{code:'ES',name:'Spain'},{code:'LK',name:'Sri Lanka'},{code:'SD',name:'Sudan'},
    {code:'SR',name:'Suriname'},{code:'SE',name:'Sweden'},{code:'CH',name:'Switzerland'},{code:'SY',name:'Syria'},
    {code:'TW',name:'Taiwan'},{code:'TJ',name:'Tajikistan'},{code:'TZ',name:'Tanzania'},{code:'TH',name:'Thailand'},
    {code:'TL',name:'Timor-Leste'},{code:'TG',name:'Togo'},{code:'TO',name:'Tonga'},
    {code:'TT',name:'Trinidad and Tobago'},{code:'TN',name:'Tunisia'},{code:'TR',name:'Turkey'},
    {code:'TM',name:'Turkmenistan'},{code:'TV',name:'Tuvalu'},{code:'UG',name:'Uganda'},{code:'UA',name:'Ukraine'},
    {code:'AE',name:'United Arab Emirates'},{code:'GB',name:'United Kingdom'},{code:'US',name:'United States'},
    {code:'UY',name:'Uruguay'},{code:'UZ',name:'Uzbekistan'},{code:'VU',name:'Vanuatu'},{code:'VE',name:'Venezuela'},
    {code:'VN',name:'Vietnam'},{code:'YE',name:'Yemen'},{code:'ZM',name:'Zambia'},{code:'ZW',name:'Zimbabwe'},
    // Territories
    {code:'AW',name:'Aruba'},{code:'BM',name:'Bermuda'},{code:'CW',name:'Curaçao'},{code:'FO',name:'Faroe Islands'},
    {code:'GI',name:'Gibraltar'},{code:'GL',name:'Greenland'},{code:'GP',name:'Guadeloupe'},{code:'GU',name:'Guam'},
    {code:'MQ',name:'Martinique'},{code:'NC',name:'New Caledonia'},{code:'PF',name:'French Polynesia'},
    {code:'RE',name:'Réunion'},{code:'VI',name:'U.S. Virgin Islands'},{code:'VG',name:'British Virgin Islands'},
    {code:'KY',name:'Cayman Islands'},{code:'TC',name:'Turks and Caicos'},{code:'AI',name:'Anguilla'},
    {code:'MS',name:'Montserrat'},{code:'SX',name:'Sint Maarten'},{code:'BL',name:'Saint Barthélemy'},
    {code:'MF',name:'Saint Martin'},{code:'PM',name:'Saint Pierre and Miquelon'},{code:'FK',name:'Falkland Islands'},
    {code:'GF',name:'French Guiana'},{code:'WF',name:'Wallis and Futuna'},{code:'EH',name:'Western Sahara'},
    {code:'YT',name:'Mayotte'},{code:'NF',name:'Norfolk Island'},{code:'MP',name:'Northern Mariana Islands'},
    {code:'AS',name:'American Samoa'},{code:'CK',name:'Cook Islands'},{code:'NU',name:'Niue'},
    {code:'TK',name:'Tokelau'},{code:'PN',name:'Pitcairn Islands'},{code:'XK',name:'Kosovo'},
    {code:'VA',name:'Vatican City'}
  ];

  // Continent mappings
  const CONTINENTS = {
    'Africa': ['AO','BF','BI','BJ','BW','CD','CF','CG','CI','CM','CV','DJ','DZ','EG','EH','ER','ET','GA','GH','GM','GN','GQ','GW','KE','KM','LR','LS','LY','MA','MG','ML','MR','MU','MW','MZ','NA','NE','NG','RE','RW','SC','SD','SL','SN','SO','SS','ST','SZ','TD','TG','TN','TZ','UG','YT','ZA','ZM','ZW'],
    'Asia': ['AE','AF','AM','AZ','BD','BH','BN','BT','CN','CY','GE','HK','ID','IL','IN','IQ','IR','JO','JP','KG','KH','KP','KR','KW','KZ','LA','LB','LK','MM','MN','MO','MV','MY','NP','OM','PH','PK','PS','QA','SA','SG','SY','TH','TJ','TL','TM','TR','TW','UZ','VN','YE'],
    'Europe': ['AD','AL','AT','BA','BE','BG','BY','CH','CZ','DE','DK','EE','ES','FI','FO','FR','GB','GI','GR','HR','HU','IE','IS','IT','LI','LT','LU','LV','MC','MD','ME','MK','MT','NL','NO','PL','PT','RO','RS','RU','SE','SI','SK','SM','UA','VA','XK'],
    'North America': ['AG','AI','AW','BB','BL','BM','BS','BZ','CA','CR','CU','CW','DM','DO','GD','GL','GP','GT','HN','HT','JM','KN','KY','LC','MF','MQ','MS','MX','NI','PA','PM','PR','SV','SX','TC','TT','US','VC','VG','VI'],
    'Oceania': ['AS','AU','CK','FJ','FM','GU','KI','MH','MP','NC','NF','NR','NU','NZ','PF','PG','PN','PW','SB','TK','TO','TV','VU','WF','WS'],
    'South America': ['AR','BO','BR','CL','CO','EC','FK','GF','GY','PE','PY','SR','UY','VE']
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const MONTH_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

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

  // ─── HELPERS ────────────────────────────────────────────────

  async function fetchJson(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('Radar: failed to fetch', url, e);
      return null;
    }
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
        if (Date.now() - (cached.timestamp || 0) < CACHE_TTL_MS && Array.isArray(cached.locations) && cached.locations.length > 10) {
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

    if (locations.length > 10) {
      locations.sort((a, b) => a.name.localeCompare(b.name));
      try {
        localStorage.setItem(LOCATIONS_CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          locations: locations,
        }));
      } catch (e) {}
      return locations;
    }

    // Use cached if available even if expired
    if (cached && cached.locations && cached.locations.length > 10) {
      return cached.locations;
    }

    // Use hardcoded fallback
    return FALLBACK_LOCATIONS.slice().sort((a, b) => a.name.localeCompare(b.name));
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
          <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/60 border-y border-zinc-800/60 flex items-center justify-between select-none">
            <span>${continent}</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">${countriesInContinent.length}</span>
          </div>
          ${countriesInContinent.map(c => `
            <div
              class="radar-region-option flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800/80 hover:text-white rounded-md mx-1 transition-colors group"
              data-value="${c.code}"
              data-name="${c.name}"
              role="option"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-[10px] font-mono text-zinc-400 bg-zinc-800/90 group-hover:bg-zinc-700/80 group-hover:text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-700/50 w-7 text-center shrink-0">${c.code}</span>
                <span class="truncate">${c.name}</span>
              </div>
              <svg class="radar-option-check ${currentLocation === c.code ? '' : 'hidden'} w-3.5 h-3.5 text-[#2dd4bf] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
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
          <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/60 border-y border-zinc-800/60 flex items-center justify-between select-none">
            <span>Other</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">${unassigned.length}</span>
          </div>
          ${unassigned.map(c => `
            <div
              class="radar-region-option flex items-center justify-between px-3 py-1.5 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800/80 hover:text-white rounded-md mx-1 transition-colors group"
              data-value="${c.code}"
              data-name="${c.name}"
              role="option"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-[10px] font-mono text-zinc-400 bg-zinc-800/90 group-hover:bg-zinc-700/80 group-hover:text-zinc-200 px-1.5 py-0.5 rounded border border-zinc-700/50 w-7 text-center shrink-0">${c.code}</span>
                <span class="truncate">${c.name}</span>
              </div>
              <svg class="radar-option-check ${currentLocation === c.code ? '' : 'hidden'} w-3.5 h-3.5 text-[#2dd4bf] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
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

    highlightSelectedRegion(currentLocation);
  }

  function highlightSelectedRegion(code) {
    const allOptions = document.querySelectorAll('.radar-region-option');
    allOptions.forEach(opt => {
      const isSelected = opt.dataset.value === code;
      opt.classList.toggle('bg-[#2dd4bf]/15', isSelected);
      opt.classList.toggle('text-[#2dd4bf]', isSelected);
      const check = opt.querySelector('.radar-option-check');
      if (check) check.classList.toggle('hidden', !isSelected);
    });
  }

  function selectRegion(code, name) {
    currentLocation = code;
    if (regionLabel) regionLabel.textContent = code ? `${name} (${code})` : 'Worldwide';
    if (regionStatusBadge) regionStatusBadge.textContent = code ? name : 'Worldwide';
    closeRegionDropdown();
    syncUrl(code);
    highlightSelectedRegion(code);
    refreshMetrics(code);
  }

  function filterRegions(query) {
    const q = query.toLowerCase().trim();
    const groups = regionGroupsContainer ? regionGroupsContainer.querySelectorAll('.radar-continent-group') : [];
    let anyVisible = false;

    if (regionSearchClear) {
      regionSearchClear.classList.toggle('hidden', !q);
    }

    // Handle Worldwide option
    const worldwideOpt = document.querySelector('.radar-region-option[data-value=""]');
    if (worldwideOpt) {
      const matchWorldwide = !q || 'worldwide'.includes(q) || 'global'.includes(q);
      worldwideOpt.style.display = matchWorldwide ? '' : 'none';
      if (matchWorldwide) anyVisible = true;
    }

    groups.forEach(group => {
      const options = group.querySelectorAll('.radar-region-option');
      let groupVisible = false;
      const continent = (group.dataset.continent || '').toLowerCase();

      options.forEach(opt => {
        const name = (opt.dataset.name || '').toLowerCase();
        const code = (opt.dataset.value || '').toLowerCase();
        const match = !q || name.includes(q) || code.includes(q) || continent.includes(q);
        opt.style.display = match ? '' : 'none';
        if (match) {
          groupVisible = true;
          anyVisible = true;
        }
      });

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
      setTimeout(() => regionSearchInput.focus(), 60);
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

  function computeDateRange(hours) {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    return { start, end };
  }

  function formatRangeText(start, end) {
    if (!start && !end) return '—';
    if (start && !end) {
      return `${MONTH_SHORT[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} (select end date)`;
    }
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end); e.setHours(0, 0, 0, 0);
    const diffDays = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    if (s.getFullYear() === e.getFullYear()) {
      return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()} (${diffDays}d)`;
    }
    return `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()} (${diffDays}d)`;
  }

  function updateDateTriggerLabel() {
    if (!dateLabel) return;
    if (activePresetHours && PRESET_LABELS[activePresetHours]) {
      dateLabel.textContent = PRESET_LABELS[activePresetHours];
    } else if (currentDateStart && currentDateEnd) {
      const s = currentDateStart;
      const e = currentDateEnd;
      if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        dateLabel.textContent = `${MONTH_SHORT[s.getMonth()]} ${s.getDate()}–${e.getDate()}`;
      } else {
        dateLabel.textContent = `${MONTH_SHORT[s.getMonth()]} ${s.getDate()} – ${MONTH_SHORT[e.getMonth()]} ${e.getDate()}`;
      }
    } else {
      dateLabel.textContent = 'Custom range';
    }
  }

  function highlightPresetButtons(hours) {
    datePresetButtons.forEach(btn => {
      const btnHours = parseInt(btn.dataset.hours, 10);
      if (hours && btnHours === hours) {
        btn.className = 'radar-date-preset whitespace-nowrap text-left px-3 py-1.5 text-xs font-mono rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-300 font-semibold shadow-sm cursor-pointer';
      } else {
        btn.className = 'radar-date-preset whitespace-nowrap text-left px-3 py-1.5 text-xs font-mono rounded-lg hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-colors cursor-pointer';
      }
    });
  }

  function setActivePreset(hours) {
    activePresetHours = hours;
    const range = computeDateRange(hours);
    currentDateStart = range.start;
    currentDateEnd = range.end;
    pendingStart = new Date(currentDateStart);
    pendingEnd = new Date(currentDateEnd);

    updateDateTriggerLabel();
    highlightPresetButtons(hours);

    // Update calendar view to encompass the end date
    calViewYear = currentDateEnd.getFullYear();
    calViewMonth = currentDateEnd.getMonth();
    renderCalendarView();
  }

  function renderCalendarView() {
    let leftMonth = calViewMonth - 1;
    let leftYear = calViewYear;
    if (leftMonth < 0) { leftMonth = 11; leftYear--; }

    const rightMonth = calViewMonth;
    const rightYear = calViewYear;

    if (calMonthLeftTitle) {
      calMonthLeftTitle.textContent = `${MONTH_NAMES[leftMonth]} ${leftYear}`;
    }
    if (calMonthRightTitle) {
      calMonthRightTitle.textContent = `${MONTH_NAMES[rightMonth]} ${rightYear}`;
    }

    if (calGridLeft) calGridLeft.innerHTML = buildMonthGrid(leftYear, leftMonth);
    if (calGridRight) calGridRight.innerHTML = buildMonthGrid(rightYear, rightMonth);

    if (calRangeDisplay) {
      calRangeDisplay.textContent = formatRangeText(pendingStart || currentDateStart, pendingEnd || currentDateEnd);
    }
  }

  function buildMonthGrid(year, month) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0 = Sun
    const daysInMonth = lastDay.getDate();

    const activeStart = pendingStart || currentDateStart;
    const activeEnd = pendingEnd || currentDateEnd;

    let sTime = activeStart ? new Date(activeStart).setHours(0, 0, 0, 0) : null;
    let eTime = activeEnd ? new Date(activeEnd).setHours(0, 0, 0, 0) : null;

    if (sTime && eTime && sTime > eTime) {
      const tmp = sTime; sTime = eTime; eTime = tmp;
    }

    let cells = '';

    // Leading empty cells
    for (let i = 0; i < startDow; i++) {
      cells += '<div class="radar-cal-cell radar-cal-cell--empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const dateTime = date.getTime();
      const isFuture = date > today;
      const isToday = dateTime === today.getTime();

      let isStart = sTime && dateTime === sTime;
      let isEnd = eTime && dateTime === eTime;
      let inRange = sTime && eTime && dateTime > sTime && dateTime < eTime;

      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const isoStr = `${year}-${mm}-${dd}`;

      let cellClass = 'radar-cal-cell ';
      if (isFuture) {
        cellClass += 'radar-cal-cell--future';
      } else if (isStart && isEnd) {
        cellClass += 'radar-cal-cell--single-day';
      } else if (isStart) {
        cellClass += 'radar-cal-cell--range-start';
      } else if (isEnd) {
        cellClass += 'radar-cal-cell--range-end';
      } else if (inRange) {
        cellClass += 'radar-cal-cell--in-range';
      } else if (isToday) {
        cellClass += 'radar-cal-cell--today';
      } else {
        cellClass += 'radar-cal-cell--default';
      }

      cells += `<div class="${cellClass}" data-date="${isoStr}">${d}</div>`;
    }

    return cells;
  }

  function handleCalendarClick(e) {
    const target = e.target.closest('.radar-cal-cell');
    if (!target || target.classList.contains('radar-cal-cell--empty') || target.classList.contains('radar-cal-cell--future')) {
      return;
    }
    const dateStr = target.dataset.date;
    if (!dateStr) return;

    const clicked = new Date(dateStr + 'T00:00:00');

    if (!pendingStart || (pendingStart && pendingEnd)) {
      // First click: reset end and set start
      pendingStart = clicked;
      pendingEnd = null;
      activePresetHours = null;
      highlightPresetButtons(null);
      if (calRangeDisplay) calRangeDisplay.textContent = `${MONTH_SHORT[clicked.getMonth()]} ${clicked.getDate()} (select end date)`;
      renderCalendarView();
    } else {
      // Second click: set end
      if (clicked < pendingStart) {
        pendingEnd = new Date(pendingStart);
        pendingEnd.setHours(23, 59, 59, 999);
        pendingStart = clicked;
      } else {
        pendingEnd = new Date(clicked);
        pendingEnd.setHours(23, 59, 59, 999);
      }
      activePresetHours = null;
      highlightPresetButtons(null);
      if (calRangeDisplay) calRangeDisplay.textContent = formatRangeText(pendingStart, pendingEnd);
      renderCalendarView();
    }
  }

  function openDatePicker() {
    if (!datePanel) return;
    datePanel.classList.remove('hidden');
    if (dateChevron) dateChevron.style.transform = 'rotate(180deg)';
    if (dateTrigger) dateTrigger.setAttribute('aria-expanded', 'true');

    // Sync pending with active
    pendingStart = currentDateStart ? new Date(currentDateStart) : null;
    pendingEnd = currentDateEnd ? new Date(currentDateEnd) : null;

    // View current end month
    const baseDate = currentDateEnd ? new Date(currentDateEnd) : new Date();
    calViewYear = baseDate.getFullYear();
    calViewMonth = baseDate.getMonth();

    renderCalendarView();
  }

  function closeDatePicker() {
    if (!datePanel) return;
    datePanel.classList.add('hidden');
    if (dateChevron) dateChevron.style.transform = '';
    if (dateTrigger) dateTrigger.setAttribute('aria-expanded', 'false');
  }

  function toggleDatePicker() {
    if (datePanel && datePanel.classList.contains('hidden')) {
      openDatePicker();
    } else {
      closeDatePicker();
    }
  }

  // ─── LOADING STATE ──────────────────────────────────────────

  function setLoadingState(isLoading) {
    affectedContainers.forEach(card => {
      if (isLoading) {
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
        ipVerData, httpVerData, tlsVerData, deviceData, osData,
        speedData, l3VectorData, l3ProtoData, l7RulesData, outagesData,
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

      if (ipVerData?.result?.summary_0 || ipVerData?.result?.summary) {
        const sum = ipVerData.result.summary_0 || ipVerData.result.summary;
        const v4 = parseFloat(sum.IPv4 || sum.ipv4 || 58.6);
        const v6 = parseFloat(sum.IPv6 || sum.ipv6 || 41.4);
        updateProgress('ipv4', v4, formatPct(v4));
        updateProgress('ipv6', v6, formatPct(v6));
      }

      if (httpVerData?.result?.summary_0 || httpVerData?.result?.summary) {
        const sum = httpVerData.result.summary_0 || httpVerData.result.summary;
        const h1 = parseFloat(sum.HTTP_1_X || sum['HTTP/1.x'] || sum.http1 || 8.8);
        const h2 = parseFloat(sum.HTTP_2 || sum['HTTP/2'] || sum.http2 || 58.2);
        const h3 = parseFloat(sum.HTTP_3 || sum['HTTP/3'] || sum.http3 || 33.0);
        updateProgress('http1', h1, formatPct(h1));
        updateProgress('http2', h2, formatPct(h2));
        updateProgress('http3', h3, formatPct(h3));
      }

      if (deviceData?.result?.summary_0 || deviceData?.result?.summary) {
        const sum = deviceData.result.summary_0 || deviceData.result.summary;
        const mobile = parseFloat(sum.mobile || sum.MOBILE || 39.1);
        const desktop = parseFloat(sum.desktop || sum.DESKTOP || 60.9);
        updateProgress('mobile', mobile, formatPct(mobile));
        updateProgress('desktop', desktop, formatPct(desktop));
      }

      if (tlsVerData?.result?.summary_0 || tlsVerData?.result?.summary) {
        const sum = tlsVerData.result.summary_0 || tlsVerData.result.summary;
        const t13 = parseFloat(sum.TLS_1_3 || sum['TLSv1.3'] || sum.tls13 || 78.5);
        const t12 = parseFloat(sum.TLS_1_2 || sum['TLSv1.2'] || sum.tls12 || 21.3);
        const t11 = parseFloat(sum.TLS_1_1 || sum['TLSv1.1'] || sum.tls11 || 0.2);
        updateProgress('tls13', t13, formatPct(t13));
        updateProgress('tls12', t12, formatPct(t12));
        updateProgress('tls11', t11, formatPct(t11));
      }

      if (osData?.result?.summary_0 || osData?.result?.summary) {
        const sum = osData.result.summary_0 || osData.result.summary;
        const win = parseFloat(sum.windows || sum.WINDOWS || 36.4);
        const and = parseFloat(sum.android || sum.ANDROID || 28.2);
        const ios = parseFloat(sum.ios || sum.IOS || 19.8);
        const mac = parseFloat(sum.macos || sum.MACOS || sum.mac || 11.2);
        const lnx = parseFloat(sum.linux || sum.LINUX || 4.4);
        updateProgress('win', win, formatPct(win));
        updateProgress('android', and, formatPct(and));
        updateProgress('ios', ios, formatPct(ios));
        updateProgress('mac', mac, formatPct(mac));
        updateProgress('linux', lnx, formatPct(lnx));
      }

      if (speedData?.result) {
        const res = speedData.result;
        const down = res.download?.mean || res.download_mbps || res.downloadSpeed || 82.4;
        const up = res.upload?.mean || res.upload_mbps || res.uploadSpeed || 28.1;
        const lat = res.latency?.mean || res.idle_latency_ms || res.latencyMs || 24;
        setText('val-download', `${Math.round(down)} Mbps`);
        setText('val-upload', `${Math.round(up)} Mbps`);
        setText('val-latency', `${Math.round(lat)} ms`);
      }

      if (l3VectorData?.result?.summary_0 || l3VectorData?.result?.summary) {
        const sum = l3VectorData.result.summary_0 || l3VectorData.result.summary;
        const syn = parseFloat(sum.SYN || sum.syn_flood || 48.2);
        const rst = parseFloat(sum.RST || sum.rst_flood || 18.6);
        const udp = parseFloat(sum.UDP || sum.udp_flood || 16.4);
        const ack = parseFloat(sum.ACK || sum.ack_flood || 9.8);
        const mir = parseFloat(sum.MIRAI || sum.mirai || 7.0);
        updateProgress('syn', syn, formatPct(syn));
        updateProgress('rst', rst, formatPct(rst));
        updateProgress('udp', udp, formatPct(udp));
        updateProgress('ack', ack, formatPct(ack));
        updateProgress('mirai', mir, formatPct(mir));
      }

      if (l3ProtoData?.result?.summary_0 || l3ProtoData?.result?.summary) {
        const sum = l3ProtoData.result.summary_0 || l3ProtoData.result.summary;
        const tcp = parseFloat(sum.TCP || sum.tcp || 62.4);
        const udpP = parseFloat(sum.UDP || sum.udp || 31.8);
        const icmp = parseFloat(sum.ICMP || sum.icmp || 4.2);
        const gre = parseFloat(sum.GRE || sum.gre || 1.6);
        updateProgress('tcp', tcp, formatPct(tcp));
        updateProgress('udp-proto', udpP, formatPct(udpP));
        updateProgress('icmp', icmp, formatPct(icmp));
        updateProgress('gre', gre, formatPct(gre));
      }

      if (l7RulesData?.result?.summary_0 || l7RulesData?.result?.summary) {
        const sum = l7RulesData.result.summary_0 || l7RulesData.result.summary;
        const anomaly = parseFloat(sum.HTTP_ANOMALY || sum.anomaly || 42.1);
        const auth = parseFloat(sum.BROKEN_AUTH || sum.auth || 24.3);
        const sqli = parseFloat(sum.SQLI || sum.sql_injection || 16.8);
        const xss = parseFloat(sum.XSS || sum.xss || 10.2);
        const cmd = parseFloat(sum.COMMAND_INJECTION || sum.rce || 6.6);
        updateProgress('anomaly', anomaly, formatPct(anomaly));
        updateProgress('auth', auth, formatPct(auth));
        updateProgress('sqli', sqli, formatPct(sqli));
        updateProgress('xss', xss, formatPct(xss));
        updateProgress('cmd', cmd, formatPct(cmd));
      }

      if (outagesData?.result?.annotations && Array.isArray(outagesData.result.annotations)) {
        renderOutages(outagesData.result.annotations);
      }
    } catch (err) {
      console.warn('Radar: Error updating metrics', err);
    } finally {
      setLoadingState(false);
    }
  }

  function renderOutages(outages) {
    const list = document.getElementById('outages-list');
    if (!list) return;

    if (outages.length === 0) {
      list.innerHTML = `
        <div class="p-6 text-center text-zinc-500 text-xs">
          No active or recent outages reported for this region.
        </div>
      `;
      return;
    }

    list.innerHTML = outages.slice(0, 5).map(o => {
      const type = (o.type || 'OUTAGE').toUpperCase();
      const scope = o.scope || o.asName || o.locations?.[0] || 'Regional Network';
      const desc = o.description || o.reason || 'Observed connectivity degradation';
      const time = o.startDate ? new Date(o.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
      const isOutage = type.includes('OUTAGE') || type.includes('OFFLINE');

      return `
        <div class="p-3.5 flex items-start gap-3 hover:bg-zinc-800/40 transition-colors">
          <div class="mt-0.5 shrink-0">
            <span class="w-2.5 h-2.5 rounded-full ${isOutage ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'} inline-block"></span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold text-white truncate">${scope}</span>
              <span class="text-[10px] font-mono text-zinc-500 shrink-0">${time}</span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-1">${desc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // ─── URL SYNC & INITIAL LOCATION ────────────────────────────

  function syncUrl(code) {
    const url = new URL(window.location);
    if (code) {
      url.searchParams.set('location', code);
    } else {
      url.searchParams.delete('location');
    }
    window.history.replaceState({}, '', url);
  }

  async function resolveInitialLocation() {
    const urlParams = new URLSearchParams(window.location.search);
    const locParam = urlParams.get('location');
    if (locParam) {
      const code = locParam.toUpperCase();
      if (locationsMap.has(code)) return code;
    }

    try {
      const geo = await fetchJson('https://speed.cloudflare.com/meta');
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
    if (regionTrigger) {
      regionTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDatePicker();
        toggleRegionDropdown();
      });
    }

    const worldwideOpt = document.querySelector('.radar-region-option[data-value=""]');
    if (worldwideOpt) {
      worldwideOpt.addEventListener('click', () => selectRegion('', 'Worldwide'));
    }

    if (regionSearchInput) {
      regionSearchInput.addEventListener('input', (e) => filterRegions(e.target.value));
      regionSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeRegionDropdown();
      });
    }

    if (regionSearchClear) {
      regionSearchClear.addEventListener('click', (e) => {
        e.stopPropagation();
        if (regionSearchInput) {
          regionSearchInput.value = '';
          filterRegions('');
          regionSearchInput.focus();
        }
      });
    }

    if (dateTrigger) {
      dateTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        closeRegionDropdown();
        toggleDatePicker();
      });
    }

    datePresetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const hours = parseInt(btn.dataset.hours, 10);
        setActivePreset(hours);
        closeDatePicker();
        refreshMetrics(currentLocation);
      });
    });

    if (calGridLeft) calGridLeft.addEventListener('click', handleCalendarClick);
    if (calGridRight) calGridRight.addEventListener('click', handleCalendarClick);

    if (calPrevBtn) {
      calPrevBtn.addEventListener('click', () => {
        calViewMonth--;
        if (calViewMonth < 0) {
          calViewMonth = 11;
          calViewYear--;
        }
        renderCalendarView();
      });
    }

    if (calPrevBtnMobile) {
      calPrevBtnMobile.addEventListener('click', () => {
        calViewMonth--;
        if (calViewMonth < 0) {
          calViewMonth = 11;
          calViewYear--;
        }
        renderCalendarView();
      });
    }

    if (calNextBtn) {
      calNextBtn.addEventListener('click', () => {
        calViewMonth++;
        if (calViewMonth > 11) {
          calViewMonth = 0;
          calViewYear++;
        }
        renderCalendarView();
      });
    }

    if (calApplyBtn) {
      calApplyBtn.addEventListener('click', () => {
        if (pendingStart) {
          currentDateStart = new Date(pendingStart);
          currentDateEnd = pendingEnd ? new Date(pendingEnd) : new Date(pendingStart);
          if (!pendingEnd) currentDateEnd.setHours(23, 59, 59, 999);
          updateDateTriggerLabel();
          closeDatePicker();
          refreshMetrics(currentLocation);
        }
      });
    }

    if (calCancelBtn) {
      calCancelBtn.addEventListener('click', () => {
        pendingStart = currentDateStart ? new Date(currentDateStart) : null;
        pendingEnd = currentDateEnd ? new Date(currentDateEnd) : null;
        closeDatePicker();
      });
    }

    document.addEventListener('click', (e) => {
      if (regionContainer && !regionContainer.contains(e.target)) closeRegionDropdown();
      if (dateContainer && !dateContainer.contains(e.target)) closeDatePicker();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeRegionDropdown();
        closeDatePicker();
      }
    });

    if (regionPanel) regionPanel.addEventListener('click', (e) => e.stopPropagation());
    if (datePanel) datePanel.addEventListener('click', (e) => e.stopPropagation());
  }

  // ─── CHART HOVER INTERACTION ────────────────────────────────

  function initChartInteraction() {
    const chart = document.getElementById('traffic-chart-svg');
    const tooltip = document.getElementById('chart-tooltip');
    const trackLine = document.getElementById('chart-track-line');
    const hoverDot = document.getElementById('chart-hover-dot');

    if (!chart || !tooltip || !trackLine || !hoverDot) return;

    chart.addEventListener('mousemove', (e) => {
      const rect = chart.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));

      const svgX = (pct * 960).toFixed(1);
      const points = [78, 62, 55, 48, 52, 68, 85, 96, 92, 88, 79, 84, 91, 95, 90, 82, 75, 70, 76, 85, 92, 98, 94, 88];
      const idx = Math.min(points.length - 1, Math.floor(pct * points.length));
      const val = points[idx];
      const svgY = (180 - (val / 100) * 140).toFixed(1);

      trackLine.setAttribute('x1', svgX);
      trackLine.setAttribute('x2', svgX);
      trackLine.classList.remove('opacity-0');

      hoverDot.setAttribute('cx', svgX);
      hoverDot.setAttribute('cy', svgY);
      hoverDot.classList.remove('opacity-0');

      tooltip.classList.remove('opacity-0', 'pointer-events-none');
      tooltip.style.left = `${Math.min(rect.width - 120, Math.max(10, x - 50))}px`;
      tooltip.style.top = `${Math.max(10, (parseFloat(svgY) / 200) * rect.height - 45)}px`;

      const timeLabel = tooltip.querySelector('.text-zinc-500');
      const valLabel = tooltip.querySelector('.font-bold');
      if (timeLabel) timeLabel.textContent = `T - ${(24 - idx)}h`;
      if (valLabel) valLabel.textContent = `${(val * 0.85).toFixed(1)} Tbps`;
    });

    chart.addEventListener('mouseleave', () => {
      trackLine.classList.add('opacity-0');
      hoverDot.classList.add('opacity-0');
      tooltip.classList.add('opacity-0', 'pointer-events-none');
    });
  }

  // ─── INITIALIZATION ─────────────────────────────────────────

  function init() {
    initChartInteraction();
    bindEvents();

    // 1. Immediately populate from fallback locations synchronously
    buildRegionGroups(FALLBACK_LOCATIONS);

    // 2. Set default 7 days preset
    setActivePreset(168);

    // 3. Background fetch fresh locations if possible
    loadLocations().then(locations => {
      if (locations && locations.length > 10) {
        buildRegionGroups(locations);
      }
    }).catch(err => {
      console.warn('Radar: loadLocations background fetch failed, using fallback', err);
    });

    // 4. Resolve initial location (e.g. from geo or IP)
    resolveInitialLocation().then(initialLoc => {
      if (initialLoc) {
        const name = locationsMap.get(initialLoc) || initialLoc;
        selectRegion(initialLoc, name);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
