import fs from 'fs';
import path from 'path';

const CRITICAL_CSS = `
:root {
  --color-page-bg: #0a0a0f;
  --color-nav-bg: #0d0d14;
  --color-card-bg: rgba(255, 255, 255, 0.03);
  --color-text-heading: #ffffff;
  --color-text-body: #a1a1aa;
  --color-text-muted: #71717a;
  --color-link: #2dd4bf;
  --color-primary: #ff6b35;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
*, ::after, ::before { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { font-family: var(--font-sans); color: var(--color-text-body); background-color: var(--color-page-bg); margin: 0; min-height: 100vh; display: flex; flex-direction: column; padding-top: 4rem; }
.scifi-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; background-color: rgba(255, 107, 53, 0.12); border: 1px solid rgba(255, 107, 53, 0.3); border-radius: 0.25rem; color: #ff6b35; font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
header#main-header { position: fixed; top: 0; left: 0; right: 0; z-index: 50; width: 100%; background-color: rgba(13, 13, 20, 0.9); border-bottom: 1px solid rgba(255, 255, 255, 0.06); backdrop-filter: blur(12px); }
h1, h2, h3, h4 { color: #ffffff; font-weight: 700; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; height: auto; }
`.replace(/\s+/g, ' ').trim();

export function optimizeHtmlFilesInDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      optimizeHtmlFilesInDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      let html = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // 1. Convert blocking stylesheet link tags to async rel="preload" with fallback
      if (html.includes('rel="stylesheet"') && !html.includes('id="critical-css"')) {
        // Inject inline critical CSS into head
        html = html.replace(
          '</head>',
          `<style id="critical-css">${CRITICAL_CSS}</style></head>`
        );

        // Convert stylesheet link tags to async preload
        html = html.replace(
          /<link\s+rel="stylesheet"\s+href="(\/_astro\/[^"]+\.css)">/g,
          (match, cssUrl) => {
            return `<link rel="preload" as="style" href="${cssUrl}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${cssUrl}"></noscript>`;
          }
        );
        modified = true;
      }

      // 2. Add decoding="async" to images without decoding attribute
      html = html.replace(/<img\s+(?![^>]*decoding=)([^>]+)>/g, (match, attrs) => {
        return `<img decoding="async" ${attrs}>`;
      });

      if (modified) {
        fs.writeFileSync(fullPath, html, 'utf8');
      }
    }
  }
}
