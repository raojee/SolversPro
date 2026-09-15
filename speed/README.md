# SolversPro Internet Speed Test (`speed.solverspro.com`)

High-performance, zero-latency internet speed test application powered by Cloudflare's official measurement engine ([`@cloudflare/speedtest`](https://github.com/cloudflare/speedtest)).

---

## Features

- **Live Speedometer Gauge**: Smooth SVG dial with real-time gradient needle animations.
- **Accurate Throughput Testing**:
  - Download Speed (Mbps) with peak and percentile tracking.
  - Upload Speed (Mbps) to Cloudflare's global edge network.
  - Latency (unloaded ping in ms) and Jitter (ms).
  - Loaded Latency (Bufferbloat under load).
- **Application Quality Scores**:
  - 🎮 **Online Gaming**: Real-time jitter and ping classification.
  - 🎬 **4K Streaming**: Sustained bitrate suitability rating.
  - 📹 **Video Conferencing**: WebRTC stability and loaded jitter score.
- **Edge Intelligence**:
  - Real-time client public IP and ISP/ASN detection.
  - Nearest Cloudflare datacenter colocation code (e.g., `LHR`, `IAD`, `KHI`).
- **Share & Export**:
  - Copy formatted diagnostic summary to clipboard.
  - Native Web Share API integration.

---

## Local Development

```bash
cd speed
npm install
npm run dev
```

To build for production:

```bash
npm run build
npm run preview
```

---

## Cloudflare Pages Deployment Guide for `speed.solverspro.com`

Follow these steps to deploy this standalone speed test to your subdomain:

### Step 1: Create a New Cloudflare Pages Project

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository: `raojee/SolversPro`.
4. Configure the build settings:
   - **Project name**: `solverspro-speed` (or any name you prefer)
   - **Production branch**: `main`
   - **Framework preset**: `Vite` (or `None`)
   - **Root directory**: `speed`  *(Important!)*
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

### Step 2: Add Custom Subdomain (`speed.solverspro.com`)

1. Once the deployment finishes, go to the project's **Custom domains** tab.
2. Click **Set up a domain**.
3. Enter `speed.solverspro.com`.
4. Click **Continue**. Cloudflare will automatically:
   - Detect that `solverspro.com` is on Cloudflare DNS.
   - Add the CNAME DNS record for `speed`.
   - Provision an SSL/TLS certificate.
5. Your speed test will now be live at **https://speed.solverspro.com**!
