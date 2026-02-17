# 🫧 Indian Market Bubbles

Real-time interactive visualization of **500+ NSE stocks** as dynamic bubbles. Bigger bubble = bigger price change. Green = up, Red = down. Click any bubble to explore.

**[🔴 Live Demo →](#)** · **[📸 Screenshots →](#screenshots)**

---

## ✨ What It Does

- **500+ NSE stocks** visualized as interactive floating bubbles
- **Bubble size** = magnitude of price change (relative across visible stocks)
- **Bubble color** = green (price up) / red (price down)
- **Click any bubble** to see full stock details — price, OHLC, volume, 52-week range
- **25+ sector filters** — Banking, IT, Pharma, Defence, Railways, Agriculture & more
- **5 time periods** — 1 Hour, 1 Day, 1 Week, 1 Month, 1 Year
- **Range selector** — view stocks in batches (1–50, 51–100, etc.)
- **Auto-refreshes** every 60 seconds during market hours
- **Installable as PWA** — works like a native app on phone/desktop

---

## 📸 Screenshots

| Nifty 50 — 1 Day View | Sector Filter — Banking |
|---|---|
| ![Bubbles View](#) | ![Banking Filter](#) |

| Stock Detail (on click) | Mobile View |
|---|---|
| ![Stock Detail](#) | ![Mobile](#) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS 4 |
| Visualization | D3.js v7 (force simulation) |
| Data Source | NSE India (public endpoints) |
| CORS Proxy | Cloudflare Worker (free) |
| Hosting | Vercel / GitHub Pages / Netlify |
| PWA | Service Worker + Web App Manifest |

**Zero backend. Zero database. Zero auth. 100% client-side.**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A free [Cloudflare](https://dash.cloudflare.com) account (for CORS proxy)

### 1. Clone & Install

```bash
git clone https://github.com/toshankanwar/ndian-Market-Bubbles.git
cd indian-market-bubbles
npm install
```

### 2. Deploy the CORS Proxy

NSE India blocks direct browser requests (CORS). You need a free Cloudflare Worker as proxy.

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create Worker**
2. Paste the code from `proxy/cloudflare-worker.js`
3. Click **Deploy**
4. Copy your worker URL (e.g., `https://nse-proxy.yourname.workers.dev`)

### 3. Configure

Open `src/config/proxyConfig.js` and replace the proxy URL:

```javascript
export const PROXY_URL = "https://nse-proxy.yourname.workers.dev";
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see bubbles! 🫧

### 5. Deploy (Free)

```bash
# Vercel (recommended)
npm i -g vercel && vercel

# OR GitHub Pages
npm run build
# Upload the dist/ folder

# OR Netlify
npm run build
# Drag & drop dist/ folder on netlify.com/drop
```

---

## 📁 Project Structure

```
indian-market-bubbles/
├── proxy/
│   └── cloudflare-worker.js       # CORS proxy for NSE India
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   └── icons/                     # App icons
├── src/
│   ├── config/
│   │   ├── proxyConfig.js         # Proxy URL & polling settings
│   │   └── sectorMapping.js       # 300+ stock → sector mappings
│   ├── services/
│   │   ├── nseService.js          # NSE API data fetcher
│   │   └── changeTracker.js       # Hourly & weekly change calculator
│   ├── hooks/
│   │   └── useMarketData.js       # Custom hook for live data polling
│   ├── components/
│   │   ├── BubbleChart.jsx        # D3.js bubble visualization
│   │   ├── Header.jsx             # Top bar with install button
│   │   ├── Footer.jsx             # Info, legend, disclaimer
│   │   ├── CategoryFilter.jsx     # Sector filter buttons
│   │   ├── TimeFilter.jsx         # 1H/1D/1W/1M/1Y toggle
│   │   ├── RangeSelector.jsx      # Stock range dropdown
│   │   ├── StockInfoPanel.jsx     # Click-to-view stock details
│   │   └── LoadingScreen.jsx      # Initial loading state
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                  # Tailwind + custom animations
├── index.html
├── vite.config.js
└── package.json
```

---

## 📊 How Data Works

| Time Period | Source | Method |
|-------------|--------|--------|
| **1 Hour** | Browser localStorage | Tracks price every 60s, compares with 1hr ago |
| **1 Day** | NSE API `pChange` field | Provided directly by NSE ✅ |
| **1 Week** | NSE Historical API | Fetched once, cached 6 hours |
| **1 Month** | NSE API `perChange30d` field | Provided directly by NSE ✅ |
| **1 Year** | NSE API `perChange365d` field | Provided directly by NSE ✅ |

**Polling:** Every 60 seconds during market hours (Mon–Fri, 9:15 AM – 3:30 PM IST).

---

## 🏷️ Available Sector Filters

| From NSE Indices | Custom Mapped |
|-----------------|---------------|
| Banking, IT, Pharma | 🏥 Healthcare, 🌾 Agriculture |
| Auto, Energy, Metal | 🛡️ Defence, 🚂 Railways |
| FMCG, Realty, Finance | ✈️ Aviation, 🧪 Chemicals |
| Infrastructure, Telecom | 🏗️ Cement, ☀️ Green Energy |
| | 📦 Logistics, 🏫 Education, 👗 Textiles |

---

## 🫧 How Bubble Sizing Works

Bubbles are sized **relative to each other** within the visible set:

```
|% Change|  →  Percentile Rank  →  Power Curve (2.2)  →  Radius

Example (50 stocks visible):
  RELIANCE  +4.8%  → rank 0.96 → curve 0.91 → ████████████ BIG
  TCS       +2.1%  → rank 0.70 → curve 0.45 → ██████ medium
  INFY      +0.3%  → rank 0.20 → curve 0.03 → ██ small
```

This ensures the **biggest movers are instantly visible** regardless of the range selected.

---

## ⚙️ Configuration

| Setting | File | Default |
|---------|------|---------|
| Proxy URL | `src/config/proxyConfig.js` | — (required) |
| Poll interval | `src/config/proxyConfig.js` | 60 seconds |
| Cache duration | `src/config/proxyConfig.js` | 55 seconds |
| Stock sectors | `src/config/sectorMapping.js` | 300+ mappings |

---

## 🤝 Contributing

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Ideas for contribution:**
- Add more stocks to sector mapping
- Add BSE stocks support
- Add stock search functionality
- Add portfolio watchlist feature
- Add candlestick chart on stock click

---

## ⚠️ Disclaimer

This is an independent visualization tool. **Not affiliated** with NSE, BSE, SEBI, or any financial institution. Data may be delayed. **This is not financial advice.** Always consult a qualified financial advisor before investing. Stock market investments are subject to market risks.

---

## 📄 License

MIT © [Toshan Kanwar](https://github.com/toshankanwar)

---

<div align="center">

Built with ❤️ using React + D3.js + Tailwind CSS

**[⬆ Back to Top](#-indian-market-bubbles)**

</div>