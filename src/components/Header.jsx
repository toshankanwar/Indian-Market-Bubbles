import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = ({ lastUpdated, marketOpen, stockCount, hourlyDataAge }) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const location = useLocation();

  // Listen for the PWA install prompt
  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone
    ) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const formatTime = (date) => {
    if (!date) return "--:--:--";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-white/5 z-50">
      {/* Logo + Nav Links */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl">🫧</span>
          <h1 className="text-sm sm:text-base font-bold">
            <span className="text-green-400">Indian</span>{" "}
            <span className="text-white">Market</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <div className="hidden sm:flex items-center gap-2 ml-6 border-l border-white/10 pl-6">
          {/* Market Bubbles Link */}
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive("/")
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            📊 Bubbles
          </Link>

          {/* FII/DII Link */}
          <Link
            to="/fii-dii"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive("/fii-dii")
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            💱 FII/DII
          </Link>
        </div>
      </div>

      {/* Status + Install */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Stock Count - Only show on bubble page */}
        {isActive("/") && (
          <span className="hidden sm:inline text-xs text-gray-400">
            {stockCount} stocks
          </span>
        )}

        {/* Hourly Data - Only show on bubble page */}
        {isActive("/") && hourlyDataAge !== undefined && hourlyDataAge > 0 && (
          <span className="hidden lg:inline text-xs text-gray-500">
            ⏱️{" "}
            {hourlyDataAge >= 60
              ? `${Math.round(hourlyDataAge / 60)}h data`
              : `${hourlyDataAge}m data`}
          </span>
        )}

        {/* Market Status - Only show on bubble page */}
        {isActive("/") && (
          <span className="text-xs">
            {marketOpen ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-400 font-medium">Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-red-400">Closed</span>
              </span>
            )}
          </span>
        )}

        {/* Last Updated - Only show on bubble page */}
        {isActive("/") && (
          <span className="hidden sm:inline text-xs text-gray-500">
            {formatTime(lastUpdated)}
          </span>
        )}

        {/* ===== INSTALL APP BUTTON ===== */}
        {!isInstalled && installPrompt && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-gradient-to-r from-blue-600 to-purple-600
                       hover:from-blue-500 hover:to-purple-500
                       text-white transition-all duration-300
                       shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
                       border border-blue-400/20"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden sm:inline">Install App</span>
            <span className="sm:hidden">Install</span>
          </button>
        )}

        {isInstalled && (
          <span className="flex items-center gap-1 text-xs text-green-400/60">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="hidden sm:inline">Installed</span>
          </span>
        )}

        {/* Mobile Nav Menu - Show on small screens */}
        <div className="sm:hidden flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
          <Link
            to="/"
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
              isActive("/")
                ? "bg-blue-600/20 text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            📊
          </Link>
          <Link
            to="/fii-dii"
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
              isActive("/fii-dii")
                ? "bg-blue-600/20 text-blue-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            💱
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;