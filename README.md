# SolversPro

**SolversPro** is a modern, fast, and 100% free collection of problem-solving tools and calculators. Designed with a clean, sci-fi inspired dark-theme layout, it offers instantly usable utilities for finance, health, math, trades, and developers without requiring signups or displaying intrusive ads.

Built using **Astro 4**, **React**, and **Tailwind CSS v4**.

---

## 🚀 Features & Capabilities

### 1. 🧠 Universal AI Solver (Multimodal)
A flagship feature powered by the Google Gemini API (`gemini-flash-latest`). 
- Solves complex math, engineering, or logical problems step-by-step.
- Supports **image uploads** for visual problem solving (e.g., take a picture of a math equation).
- Uses standard LaTeX formatting for crisp rendering of mathematical formulas.
- Streams responses instantly using React and `generateContentStream`.

### 2. 💻 Developer Tools Category
A dedicated hub for software engineers handling common formatting and encoding tasks locally in the browser:
- **JSON Formatter & Validator**: Interactive JSON editor to beautify, minify, and parse nested JSON objects.
- **XML Formatter & Validator**: Formats XML and renders node lists into interactive data tables.
- **Base64 Encoder & Decoder**: Encode text to Base64 or decode securely.
- **JWT Token Decoder**: Safely inspect the header, payload, and signature of JSON Web Tokens.
- **Hash Generator**: Cryptographically hash text using native Web Crypto APIs (SHA-1, SHA-256, SHA-384, SHA-512).
- **Color Converter**: Real-time conversion and picker between HEX, RGB, and HSL formats.

### 3. 📈 Functional Tools & Calculators
We currently host a robust suite of calculators spanning various domains:
- **Finance**: Compound Interest, Cash-on-Cash Return, Simple Interest, ROI Calculator, Mortgage Calculator (with D3/Chart.js graphs).
- **Health**: TDEE Calculator, BMI Calculator.
- **Math**: Scientific Calculator, Quadratic Equation Solver, Geometry Calculator, Statistics Calculator.
- **Trades**: Concrete Slab Calculator, Solar Panel Requirement Calculator, Wire Size Calculator, Board Feet Calculator, Paint Calculator.

### 4. 🎨 Architecture & Design System
- **Framework:** Astro (Static Site Generation for maximum speed) + React for complex client-side interactions.
- **Styling:** Tailwind CSS with a highly-polished, premium dark-mode design system.
- **Colors:** Deep void backgrounds (`#0d0d14`, `#1a1a24`), bright neon orange accents (`#ff6b35`), and stark white typography for high contrast.
- **Typography:** Modern technical feel using `Inter` for body copy and `JetBrains Mono` for numbers/code.
- **Responsive Layout:** fully responsive standard grids (up to 4 columns on desktop) and a fluid mobile layout.

---

## 🚧 What Is Remaining (To-Do List)

### 1. Search Functionality
- Hook up the client-side logic for the `SearchOverlay.astro` component to instantly filter and route users to specific tools.

### 2. SEO & Analytics Integration
- Adding `<meta>` OpenGraph tags dynamically to all tools.
- Generating a `sitemap.xml` and `robots.txt` dynamically using Astro integrations.
- Implementing structured schema data for rich snippets on Google Search.

---

## 🧞 Developer Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally                       |

## 🔐 Environment Variables
To run this project locally, you must create a `.env` file in the root directory and provide a Gemini API Key to enable the Universal Solver functionality:
```env
GEMINI_API_KEY=your_google_ai_studio_key_here
```
