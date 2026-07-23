import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import AstroPWA from '@vite-pwa/astro';
import imageSitemapPlugin from './scripts/generate-image-sitemap.mjs';

// ---------------------------------------------------------------------------
// Per-URL lastmod date map.
// Rules:
//   - Homepage / all-tools: updated most frequently, track manually
//   - Tool pages: set to their approximate launch/last-update date
//   - Static pages (privacy, terms, faq, about, contact, docs): set once
//   - Blog posts: set to publish date
//   - /free-ai-solver/ and /dashboard/: excluded from sitemap (dynamic / auth-gated)
// ---------------------------------------------------------------------------
const LASTMOD_MAP = {
  // ── Static / Informational ──────────────────────────────────────────────
  'https://solverspro.com/':                              '2026-07-20',
  'https://solverspro.com/all-tools/':                   '2026-07-20',
  'https://solverspro.com/about/':                       '2026-06-01',
  'https://solverspro.com/docs/':                        '2026-07-15',
  'https://solverspro.com/faq/':                         '2026-06-15',
  'https://solverspro.com/privacy/':                     '2026-05-01',
  'https://solverspro.com/terms/':                       '2026-05-01',
  'https://solverspro.com/contact/':                     '2026-05-01',

  // ── Category Hubs ───────────────────────────────────────────────────────
  'https://solverspro.com/developer/':                   '2026-07-10',
  'https://solverspro.com/pdf/':                         '2026-07-10',
  'https://solverspro.com/math/':                        '2026-06-20',
  'https://solverspro.com/text/':                        '2026-06-20',
  'https://solverspro.com/finance/':                     '2026-06-10',
  'https://solverspro.com/trades/':                      '2026-06-10',
  'https://solverspro.com/network/':                     '2026-07-01',
  'https://solverspro.com/health/':                      '2026-06-01',
  'https://solverspro.com/qr/':                          '2026-06-01',
  'https://solverspro.com/security/':                    '2026-06-01',
  'https://solverspro.com/blog/':                        '2026-07-10',

  // ── Developer Tools ─────────────────────────────────────────────────────
  'https://solverspro.com/developer/json-tools/':        '2026-05-15',
  'https://solverspro.com/developer/json-csv/':          '2026-06-01',
  'https://solverspro.com/developer/json-yaml/':         '2026-06-01',
  'https://solverspro.com/developer/json-to-typescript/':'2026-06-15',
  'https://solverspro.com/developer/json-to-java/':      '2026-06-15',
  'https://solverspro.com/developer/json-to-python/':    '2026-06-15',
  'https://solverspro.com/developer/json-to-csharp/':    '2026-06-15',
  'https://solverspro.com/developer/json-to-go/':        '2026-06-15',
  'https://solverspro.com/developer/json-diff/':         '2026-07-01',
  'https://solverspro.com/developer/json-escape/':       '2026-07-01',
  'https://solverspro.com/developer/xml-tools/':         '2026-05-15',
  'https://solverspro.com/developer/xml-csv/':           '2026-06-01',
  'https://solverspro.com/developer/xml-yaml/':          '2026-06-01',
  'https://solverspro.com/developer/xml-diff/':          '2026-07-01',
  'https://solverspro.com/developer/xml-escape/':        '2026-07-01',
  'https://solverspro.com/developer/base64-converter/':  '2026-05-15',
  'https://solverspro.com/developer/code-minifier/':     '2026-05-15',
  'https://solverspro.com/developer/color-converter/':   '2026-05-15',
  'https://solverspro.com/developer/css-beautifier/':    '2026-07-01',
  'https://solverspro.com/developer/csv-escape/':        '2026-07-01',
  'https://solverspro.com/developer/hash-generator/':    '2026-05-15',
  'https://solverspro.com/developer/html-beautifier/':   '2026-07-01',
  'https://solverspro.com/developer/html-escape/':       '2026-07-01',
  'https://solverspro.com/developer/js-beautifier/':     '2026-07-01',
  'https://solverspro.com/developer/jwt-decoder/':       '2026-05-15',
  'https://solverspro.com/developer/markdown-to-html/':  '2026-05-15',
  'https://solverspro.com/developer/number-base/':       '2026-05-15',
  'https://solverspro.com/developer/regex-tester/':      '2026-06-01',
  'https://solverspro.com/developer/slug-generator/':    '2026-05-15',
  'https://solverspro.com/developer/sql-escape/':        '2026-07-01',
  'https://solverspro.com/developer/text-diff/':         '2026-07-01',
  'https://solverspro.com/developer/timestamp-converter/':'2026-05-15',
  'https://solverspro.com/developer/uuid-generator/':    '2026-05-15',

  // ── PDF Tools ───────────────────────────────────────────────────────────
  'https://solverspro.com/pdf/pdf-merger/':              '2026-06-10',
  'https://solverspro.com/pdf/pdf-split-range/':         '2026-06-10',
  'https://solverspro.com/pdf/pdf-split-pages/':         '2026-06-10',
  'https://solverspro.com/pdf/pdf-compose/':             '2026-06-10',
  'https://solverspro.com/pdf/pdf-protect/':             '2026-06-10',
  'https://solverspro.com/pdf/pdf-remove-password/':     '2026-06-10',
  'https://solverspro.com/pdf/pdf-flatten/':             '2026-06-10',
  'https://solverspro.com/pdf/pdf-preflight/':           '2026-06-10',
  'https://solverspro.com/pdf/pdf-to-text/':             '2026-06-10',
  'https://solverspro.com/pdf/pdf-to-images/':           '2026-06-10',
  'https://solverspro.com/pdf/pdf-to-html/':             '2026-06-10',
  'https://solverspro.com/pdf/images-to-pdf/':           '2026-06-10',

  // ── Math Tools ──────────────────────────────────────────────────────────
  'https://solverspro.com/math/random-number-generator/':'2026-05-20',
  'https://solverspro.com/math/scientific-calculator/':  '2026-05-20',
  'https://solverspro.com/math/quadratic-solver/':       '2026-05-20',
  'https://solverspro.com/math/matrix-calculator/':      '2026-05-20',
  'https://solverspro.com/math/percentage-calculator/':  '2026-05-20',
  'https://solverspro.com/math/unit-converter/':         '2026-05-20',
  'https://solverspro.com/math/geometry-calculator/':    '2026-05-20',
  'https://solverspro.com/math/statistics-calculator/':  '2026-05-20',

  // ── Text Tools ──────────────────────────────────────────────────────────
  'https://solverspro.com/text/number-to-words/':        '2026-05-20',
  'https://solverspro.com/text/word-counter/':           '2026-05-20',
  'https://solverspro.com/text/morse-code/':             '2026-05-20',
  'https://solverspro.com/text/url-encoder/':            '2026-05-20',
  'https://solverspro.com/text/case-converter/':         '2026-05-20',
  'https://solverspro.com/text/lorem-ipsum/':            '2026-05-20',

  // ── Finance Tools ───────────────────────────────────────────────────────
  'https://solverspro.com/finance/currency-converter/':  '2026-07-22',
  'https://solverspro.com/finance/compound-interest/':   '2026-05-10',
  'https://solverspro.com/finance/cash-on-cash-return/': '2026-05-10',
  'https://solverspro.com/finance/simple-interest/':     '2026-05-10',
  'https://solverspro.com/finance/mortgage-calculator/': '2026-05-10',
  'https://solverspro.com/finance/roi-calculator/':      '2026-05-10',

  // ── Trades Tools ────────────────────────────────────────────────────────
  'https://solverspro.com/trades/concrete-slab/':        '2026-05-10',
  'https://solverspro.com/trades/wire-size/':            '2026-05-10',
  'https://solverspro.com/trades/solar-panel/':          '2026-06-01',
  'https://solverspro.com/trades/board-feet/':           '2026-06-01',
  'https://solverspro.com/trades/paint-calculator/':     '2026-06-01',

  // ── Network Tools ───────────────────────────────────────────────────────
  'https://solverspro.com/network/ip-subnet-calculator/':'2026-07-01',
  'https://solverspro.com/network/my-ip/':               '2026-07-01',
  'https://solverspro.com/network/ip-lookup/':           '2026-07-01',

  // ── Health Tools ────────────────────────────────────────────────────────
  'https://solverspro.com/health/tdee-calculator/':      '2026-06-01',
  'https://solverspro.com/health/bmi-calculator/':       '2026-06-01',

  // ── QR Tools ────────────────────────────────────────────────────────────
  'https://solverspro.com/qr/qr-generator/':             '2026-06-01',

  // ── Security Tools ──────────────────────────────────────────────────────
  'https://solverspro.com/security/password-generator/': '2026-06-01',

  // ── Blog Posts ──────────────────────────────────────────────────────────
  'https://solverspro.com/blog/70-free-online-tools-in-one-place/':                          '2026-07-10',
  'https://solverspro.com/blog/developer-and-math-solver-tools-guide/':                       '2026-07-05',
  'https://solverspro.com/blog/essential-network-tools-ip-subnet-calculator/':                '2026-07-08',
  'https://solverspro.com/blog/how-to-calculate-roi-and-cash-on-cash-return/':                '2026-07-03',
  'https://solverspro.com/blog/top-5-free-online-pdf-tools/':                                 '2026-07-01',
  'https://solverspro.com/blog/how-to-convert-json-to-python-java-go-csharp/':                '2026-07-22',
  'https://solverspro.com/blog/ip-subnet-calculator-beginners-guide/':                       '2026-07-22',
  'https://solverspro.com/blog/mortgage-vs-simple-vs-compound-interest-calculators/':         '2026-07-22',
  'https://solverspro.com/blog/how-to-merge-split-and-protect-pdfs-online/':                  '2026-07-22',
  'https://solverspro.com/blog/bmi-vs-tdee-understanding-your-health-metrics/':               '2026-07-22',
  'https://solverspro.com/blog/10-developer-tools-every-frontend-engineer-should-bookmark/': '2026-07-22',
  'https://solverspro.com/blog/how-to-convert-currency-accurately/':                           '2026-07-22',
};

// ---------------------------------------------------------------------------
// Priority + changefreq mapping by URL pattern
// ---------------------------------------------------------------------------
function getPriorityAndChangefreq(url) {
  const path = url.replace('https://solverspro.com', '');

  // Homepage
  if (path === '/' || path === '') {
    return { priority: 1.0, changefreq: 'weekly' };
  }
  // All-tools + category hubs
  if (path === '/all-tools/' || /^\/(developer|pdf|math|text|finance|trades|network|health|qr|security|blog)\/$/.test(path)) {
    return { priority: 0.8, changefreq: 'monthly' };
  }
  // Blog posts
  if (path.startsWith('/blog/') && path !== '/blog/') {
    return { priority: 0.6, changefreq: 'weekly' };
  }
  // Static / legal / info pages
  if (['/about/', '/docs/', '/faq/', '/privacy/', '/terms/', '/contact/'].includes(path)) {
    return { priority: 0.3, changefreq: 'yearly' };
  }
  // Individual tool pages (everything else)
  return { priority: 0.6, changefreq: 'monthly' };
}

export default defineConfig({
  site: 'https://solverspro.com',
  output: 'static',
  integrations: [
    sitemap({
      // Exclude auth-gated, dynamic, and noindexed thin category hubs from sitemap
      filter: (page) =>
        !page.includes('/dashboard') &&
        !page.includes('/free-ai-solver') &&
        !page.endsWith('/qr/') &&
        !page.endsWith('/security/'),

      serialize(item) {
        // Use the per-URL date if available; otherwise omit lastmod rather
        // than faking it with the current build timestamp.
        const mapped = LASTMOD_MAP[item.url] ?? LASTMOD_MAP[item.url.replace(/\/$/, '') + '/'];
        if (mapped) {
          item.lastmod = mapped;
        } else {
          // Do NOT set item.lastmod — a missing tag is better than a fake one.
          delete item.lastmod;
        }

        const { priority, changefreq } = getPriorityAndChangefreq(item.url);
        item.priority = priority;
        item.changefreq = changefreq;

        return item;
      }
    }),
    imageSitemapPlugin(),
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}']
      },
      manifest: {
        name: 'SolversPro',
        short_name: 'SolversPro',
        description: 'Free problem solvers for finance, health, math, and trades.',
        theme_color: '#1a1a2e',
        background_color: '#0a0a0f',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});