# SolversPro

**Live Site:** [https://solverspro.com](https://solverspro.com) · **Speed Test:** [https://speed.solverspro.com](https://speed.solverspro.com) · **Weather & Radar:** [https://solverspro.com/weather/](https://solverspro.com/weather/)

**SolversPro** is a fast, privacy-first suite of **90+ free browser-based calculators, developer utilities, PDF tools, live weather radar, and network diagnostics**. Designed with a dark-mode technical UI, every tool runs client-side with zero sign-ups and zero server storage of user inputs.

Built with **Astro 6**, **React 19**, **Tailwind CSS v4**, and deployed on **Cloudflare**.

---

## Core Tool Hubs & Features

### 1. Network Diagnostics & Speed Suite
- **[Internet Speed Test](https://speed.solverspro.com/):** Real-time download, upload, ping, jitter, and loaded bufferbloat testing powered by Cloudflare's global edge network.
- **[Network Jitter Test](https://solverspro.com/network/jitter-test/):** Dedicated browser latency stability test measuring RFC 3550 inter-arrival jitter, min/avg/max RTT, standard deviation, and packet loss.
- **[Bufferbloat Test](https://solverspro.com/network/bufferbloat-test/):** 3-phase diagnostic comparing idle latency against active download and upload saturation, assigning an `A+` to `F` grade.
- **[IP Subnet Calculator](https://solverspro.com/network/ip-subnet-calculator/)**, **[My IP Checker](https://solverspro.com/network/my-ip/)**, **[IP Lookup](https://solverspro.com/network/ip-lookup/)**, and **[Internet Radar](https://solverspro.com/radar/)**.

### 2. Live Weather Forecast & Animated Radar
- **[SolversPro Weather](https://solverspro.com/weather/):** Zero-prompt IP geolocation + optional precise GPS, multi-word/ZIP city search, 24-hour and 7-day outlooks, US Air Quality Index (AQI), UV index, and animated RainViewer precipitation radar over Leaflet.
- Includes a site-wide header clock/weather pill and footer telemetry bar with synced `°C ⇄ °F` switching.

### 3. Universal AI Solver (Multimodal)
- **[Free AI Solver](https://solverspro.com/free-ai-solver/):** Powered by Google Gemini, solving math, science, finance, and engineering problems step-by-step with LaTeX/KaTeX rendering and image upload support.

### 4. Developer, PDF, Finance, Math, Health & Trades Tools
- **[Developer Tools (30+)](https://solverspro.com/developer/):** JSON/XML formatters & validators, JSON-to-TypeScript/Python/Java/Go/C# generators, Base64, JWT decoder, Web Crypto hash generator, regex tester, diff checkers, and string escapers.
- **[PDF Tools](https://solverspro.com/pdf/):** Client-side merge, split, flatten, password protect/unlock, preflight audit, images-to-PDF, and PDF-to-text/HTML/images.
- **[Finance](https://solverspro.com/finance/), [Health](https://solverspro.com/health/), [Math](https://solverspro.com/math/), [Trades](https://solverspro.com/trades/), [Text](https://solverspro.com/text/), [QR](https://solverspro.com/qr/), and [Security](https://solverspro.com/security/):** Mortgage, Compound Interest, Live Currency Converter, Adult/Child BMI, TDEE, Scientific/Matrix Calculators, Concrete Slab, Wire Size, Solar Panel, and Password Generator.

---

## Architecture & Standards
- **Framework:** Astro 6 (`@astrojs/cloudflare` adapter, static prerendering + edge endpoints) + React 19 islands.
- **Styling:** Tailwind CSS v4 with a dark-mode palette (`#08080f`, `#0d0d14`, `#2dd4bf`, `#ff6b35`) using `Inter` and `JetBrains Mono`.
- **SEO & AI Discovery (GEO):** Dynamic `WebApplication`, `FAQPage`, `CollectionPage`, and `BlogPosting` JSON-LD schemas, XML/image sitemaps, `llms.txt`, and `/.well-known/` agent/catalog manifests.

---

## Developer Commands

Run all commands from the repository root:

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |

## Environment Variables
To enable the AI Universal Solver locally, create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_google_ai_studio_key_here
```
