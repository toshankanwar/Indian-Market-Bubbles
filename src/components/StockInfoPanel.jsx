const StockInfoPanel = ({ stock, onClose }) => {
    if (!stock) return null;
  
    const changeColor = (val) => {
      const v = parseFloat(val);
      if (v > 0) return "text-green-400";
      if (v < 0) return "text-red-400";
      return "text-gray-400";
    };
  
    const changeBg = (val) => {
      const v = parseFloat(val);
      if (v > 0) return "bg-green-500/10";
      if (v < 0) return "bg-red-500/10";
      return "bg-gray-500/10";
    };
  
    const formatChange = (val) => {
      const v = parseFloat(val) || 0;
      return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
    };
  
    const formatVolume = (vol) => {
      if (!vol) return "—";
      if (vol >= 10000000) return `${(vol / 10000000).toFixed(2)} Cr`;
      if (vol >= 100000) return `${(vol / 100000).toFixed(2)} L`;
      if (vol >= 1000) return `${(vol / 1000).toFixed(1)} K`;
      return vol.toLocaleString("en-IN");
    };
  
    return (
      <>
        {/* Backdrop – click to close */}
        <div
          className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
  
        {/* Panel */}
        <div className="fixed z-[200] bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md sm:rounded-2xl tooltip-enter">
          <div className="bg-[#0d0d24] border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
  
            {/* Stock Header */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white pr-8">{stock.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400 font-medium">
                  {stock.symbol}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {stock.sector}
                </span>
                {stock.industry && stock.industry !== stock.sector && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {stock.industry}
                  </span>
                )}
              </div>
            </div>
  
            {/* Current Price */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-white">
                ₹{stock.ltp?.toLocaleString("en-IN")}
              </div>
              <div
                className={`text-base font-semibold mt-1 ${changeColor(
                  stock.changes?.["1d"]
                )}`}
              >
                {stock.changes?.["1d"] >= 0 ? "▲" : "▼"}{" "}
                ₹{Math.abs(stock.ltp - stock.prevClose).toFixed(2)} (
                {formatChange(stock.changes?.["1d"])})
                <span className="text-gray-500 text-xs ml-1">today</span>
              </div>
            </div>
  
            {/* All Time Period Changes */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                Performance
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { key: "1h", label: "1 Hour" },
                  { key: "1d", label: "1 Day" },
                  { key: "1w", label: "1 Week" },
                  { key: "1m", label: "1 Month" },
                  { key: "1y", label: "1 Year" },
                ].map((period) => {
                  const val = stock.changes?.[period.key];
                  return (
                    <div
                      key={period.key}
                      className={`text-center p-2.5 rounded-xl ${changeBg(val)} border border-white/5`}
                    >
                      <div className="text-[10px] text-gray-500 mb-1">
                        {period.key.toUpperCase()}
                      </div>
                      <div
                        className={`text-sm font-bold ${changeColor(val)}`}
                      >
                        {formatChange(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
  
            {/* OHLC Data */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                Today's Range
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-gray-500">Open</span>
                  <span className="text-xs text-gray-200 font-medium">
                    ₹{stock.open?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-gray-500">Prev Close</span>
                  <span className="text-xs text-gray-200 font-medium">
                    ₹{stock.prevClose?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-gray-500">Day High</span>
                  <span className="text-xs text-green-400 font-medium">
                    ₹{stock.high?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs text-gray-500">Day Low</span>
                  <span className="text-xs text-red-400 font-medium">
                    ₹{stock.low?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
  
            {/* Volume & 52 Week */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                Market Info
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-gray-500 mb-1">Volume</div>
                  <div className="text-sm text-gray-200 font-medium">
                    {formatVolume(stock.volume)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-gray-500 mb-1">
                    52 Week Range
                  </div>
                  <div className="text-sm">
                    <span className="text-red-400">₹{stock.yearLow}</span>
                    <span className="text-gray-600"> — </span>
                    <span className="text-green-400">₹{stock.yearHigh}</span>
                  </div>
                </div>
              </div>
  
              {/* 52 Week Position Bar */}
              {stock.yearLow && stock.yearHigh && stock.ltp && (
                <div className="mt-3 px-1">
                  <div className="w-full h-1.5 bg-gray-800 rounded-full relative">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-blue-300"
                      style={{
                        left: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((stock.ltp - stock.yearLow) /
                              (stock.yearHigh - stock.yearLow)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-green-500/30 rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-gray-600">
                    <span>52W Low</span>
                    <span>Current Position</span>
                    <span>52W High</span>
                  </div>
                </div>
              )}
            </div>
  
            {/* Quick Labels */}
            <div className="flex flex-wrap gap-1.5">
              {stock.isNifty50 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  Nifty 50
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/5">
                NSE
              </span>
              {stock.changes?.["1d"] > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  🔥 Hot Today
                </span>
              )}
              {stock.changes?.["1d"] < -3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  📉 Big Drop
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };
  
  export default StockInfoPanel;