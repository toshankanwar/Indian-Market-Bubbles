import { useState } from "react";

const Footer = ({ stockCount, marketOpen, lastUpdated }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const formatTime = (date) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <>
      <footer className="w-full bg-gradient-to-b from-[#080818] via-[#060614] to-[#030308]">
        {/* ===== TOP DIVIDER LINE ===== */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* ===== MAIN FOOTER CONTENT ===== */}
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
          {/* Row 1: Brand + Stats + Links */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {/* Left – Branding */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                {/* Logo */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-green-500/70"></div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-1 w-3.5 h-3.5 rounded-full bg-red-500/50"></div>
                  <div className="absolute -top-0.5 -right-2 w-2.5 h-2.5 rounded-full bg-blue-500/40"></div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Indian Market Bubbles
                  </h2>
                  <p className="text-xs text-gray-500">
                    Real-time stock market visualization
                  </p>
                </div>
              </div>
            </div>

            {/* Center – Live Stats Cards */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Market Status */}
              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                  marketOpen
                    ? "bg-green-500/[0.08] border-green-500/20 text-green-400"
                    : "bg-red-500/[0.08] border-red-500/20 text-red-400"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    marketOpen ? "bg-green-500 pulse-live" : "bg-red-500"
                  }`}
                ></span>
                <span>{marketOpen ? "Market Live" : "Market Closed"}</span>
              </div>

              {/* Stock Count */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
                  />
                </svg>
                <span className="font-medium text-gray-300">{stockCount}</span>
                <span>Stocks Tracking</span>
              </div>

              {/* Last Updated */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Updated{" "}
                  <span className="text-gray-300 font-medium">
                    {formatTime(lastUpdated)}
                  </span>
                </span>
              </div>

              {/* Refresh Rate */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400">
                <svg
                  className="w-4 h-4 text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                  />
                </svg>
                <span>Auto-refresh every 1 min</span>
              </div>
            </div>

            {/* Right – Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/toshankanwar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                           bg-white/[0.03] border border-white/[0.06]
                           text-sm text-gray-400 hover:text-white hover:border-white/15
                           hover:bg-white/[0.06] transition-all duration-300"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Row 2: Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Data Source */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-300">
                  Data Source
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Live market data powered by{" "}
                <span className="text-blue-400 font-medium">
                  National Stock Exchange of India
                </span>{" "}
                (NSE) public endpoints.
              </p>
            </div>

            {/* Market Hours */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-300">
                  Market Hours
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="text-gray-300">Monday – Friday</span>
                <br />
                <span className="text-green-400 font-medium text-sm">
                  9:15 AM – 3:30 PM
                </span>{" "}
                IST
              </p>
            </div>

            {/* Time Periods */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-300">
                  Time Periods
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                View changes across{" "}
                <span className="text-gray-300">
                  1 Hour, 1 Day, 1 Week, 1 Month,
                </span>{" "}
                and <span className="text-gray-300">1 Year</span> periods.
              </p>
            </div>

            {/* Sectors */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-orange-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-300">
                  25+ Sectors
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Filter by Banking, IT, Pharma, Auto, Defence, Railways,
                Agriculture, and many more.
              </p>
            </div>
          </div>

          {/* Row 3: Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 px-4 py-3 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
            <span className="text-xs text-gray-500 font-medium mr-2">
              Bubble Colors:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#00e676]"></div>
              <span className="text-xs text-gray-400">+5% &amp; above</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#00c853]"></div>
              <span className="text-xs text-gray-400">+3% to +5%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#2e7d32]"></div>
              <span className="text-xs text-gray-400">+1% to +3%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#1b5e20]"></div>
              <span className="text-xs text-gray-400">0% to +1%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#37474f]"></div>
              <span className="text-xs text-gray-400">No change</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#b71c1c]"></div>
              <span className="text-xs text-gray-400">0% to -1%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#c62828]"></div>
              <span className="text-xs text-gray-400">-1% to -3%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#d50000]"></div>
              <span className="text-xs text-gray-400">-3% to -5%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff1744]"></div>
              <span className="text-xs text-gray-400">-5% &amp; below</span>
            </div>
          </div>

          {/* Row 4: How It Works */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 text-center">
              How It Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="text-xs font-semibold text-gray-300 mb-1">
                  Live Data
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Stock prices are fetched from NSE India every minute during
                  market hours and displayed as interactive bubbles.
                </p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
                <div className="text-2xl mb-2">🫧</div>
                <h4 className="text-xs font-semibold text-gray-300 mb-1">
                  Bubble Size = Change
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Bigger bubbles mean bigger price change. Green means price is
                  up, red means price is down. Size is relative across all
                  visible stocks.
                </p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/[0.015] border border-white/[0.04]">
                <div className="text-2xl mb-2">👆</div>
                <h4 className="text-xs font-semibold text-gray-300 mb-1">
                  Click to Explore
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Click any bubble to see full details – price, OHLC, volume,
                  52-week range, and performance across all time periods.
                </p>
              </div>
            </div>
          </div>

          {/* Row 5: Disclaimer + Legal */}
          <div className="p-4 rounded-2xl bg-yellow-500/[0.03] border border-yellow-500/10 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <div>
                <h4 className="text-xs font-semibold text-yellow-400 mb-1">
                  Disclaimer
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  This is an independent visualization tool and is{" "}
                  <span className="text-yellow-400/80">not affiliated with</span> NSE,
                  BSE, SEBI, or any financial institution. Data may have delays.
                  This is{" "}
                  <span className="text-gray-400 font-medium">
                    not financial advice
                  </span>
                  . Stock market investments are subject to market risks.
                  Always consult a qualified financial advisor before investing.{" "}
                  <button
                    onClick={() => setShowDisclaimer(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                  >
                    Read full disclaimer
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM BAR ===== */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            © {new Date().getFullYear()}{" "}
            <span className="text-gray-500">Indian Market Bubbles</span> · Built
            with ❤️ by{" "}
            <a
              href="https://toshankanwar.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors font-medium"
            >
              Toshan Kanwar
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>{formatDate(new Date())}</span>
            <span className="w-px h-3 bg-white/[0.06]"></span>
            <span>React + D3.js + Tailwind CSS</span>
            <span className="w-px h-3 bg-white/[0.06]"></span>
            <a
              href="https://github.com/toshankanwar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>toshankanwar</span>
            </a>
          </div>
        </div>
      </footer>

      {/* ===== FULL DISCLAIMER MODAL ===== */}
      {showDisclaimer && (
        <>
          <div
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDisclaimer(false)}
          />
          <div className="fixed z-[310] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl tooltip-enter">
            <div className="bg-[#0d0d24] border border-white/10 rounded-2xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  Disclaimer & Legal
                </h3>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                <div className="p-3 rounded-xl bg-yellow-500/[0.05] border border-yellow-500/10">
                  <p>
                    <span className="text-yellow-400 font-semibold">
                      ⚠️ Not Financial Advice
                    </span>
                    <br />
                    <span className="text-xs">
                      Do not make investment decisions based solely on this
                      visualization. Always consult a SEBI-registered financial
                      advisor.
                    </span>
                  </p>
                </div>

                <p>
                  <span className="text-gray-300 font-medium">
                    Indian Market Bubbles
                  </span>{" "}
                  is an independent, open-source visualization tool. It is{" "}
                  <span className="text-yellow-400">not affiliated with</span>{" "}
                  the National Stock Exchange of India (NSE), Bombay Stock
                  Exchange (BSE), Securities and Exchange Board of India (SEBI),
                  or any broker, financial institution, or advisory service.
                </p>

                <p>
                  The market data displayed is sourced from publicly available
                  NSE endpoints and{" "}
                  <span className="text-gray-300">
                    may be delayed by up to 1 minute
                  </span>
                  . We do not guarantee the accuracy, completeness, or timeliness
                  of any data shown.
                </p>

                <p>
                  Stock market investments are{" "}
                  <span className="text-red-400 font-medium">
                    subject to market risks
                  </span>
                  . Past performance is not indicative of future results. Please
                  read all scheme-related documents carefully before investing.
                </p>

                <p className="text-xs text-gray-500">
                  By using this website, you agree that the creators are not
                  liable for any financial losses incurred based on the
                  information displayed here.
                </p>
              </div>

              <button
                onClick={() => setShowDisclaimer(false)}
                className="w-full mt-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08]
                           text-sm text-gray-300 font-semibold
                           border border-white/[0.06] hover:border-white/10
                           transition-all duration-200"
              >
                I Understand
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Footer;