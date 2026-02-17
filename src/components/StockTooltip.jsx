const StockTooltip = ({ stock, position }) => {
    if (!stock || !position) return null;
  
    const changeColor = (val) => {
      const v = parseFloat(val);
      if (v > 0) return "text-green-400";
      if (v < 0) return "text-red-400";
      return "text-gray-400";
    };
  
    const formatChange = (val) => {
      const v = parseFloat(val) || 0;
      return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
    };
  
    // Position tooltip so it doesn't go off screen
    const tooltipStyle = {
      left: Math.min(position.x + 15, window.innerWidth - 260),
      top: Math.min(position.y - 10, window.innerHeight - 320),
    };
  
    return (
      <div
        className="fixed z-[200] tooltip-enter pointer-events-none"
        style={tooltipStyle}
      >
        <div className="bg-[#0f0f28]/97 border border-white/10 rounded-xl p-4 min-w-[240px] shadow-2xl backdrop-blur-sm">
          {/* Stock Name & Symbol */}
          <div className="mb-1">
            <h3 className="text-sm font-bold text-white">{stock.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">{stock.symbol}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                {stock.sector}
              </span>
              {stock.industry && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                  {stock.industry}
                </span>
              )}
            </div>
          </div>
  
          {/* Current Price */}
          <div className="mt-3 mb-3">
            <div className="text-2xl font-bold text-white">
              ₹{stock.ltp?.toLocaleString("en-IN")}
            </div>
            <div className={`text-sm font-medium ${changeColor(stock.changes?.["1d"])}`}>
              {stock.changes?.["1d"] >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(stock.ltp - stock.prevClose).toFixed(2)} (
              {formatChange(stock.changes?.["1d"])})
            </div>
          </div>
  
          {/* OHLC */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Open</span>
              <span className="text-gray-300">₹{stock.open?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">High</span>
              <span className="text-green-400">₹{stock.high?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Low</span>
              <span className="text-red-400">₹{stock.low?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Prev Close</span>
              <span className="text-gray-300">₹{stock.prevClose?.toLocaleString("en-IN")}</span>
            </div>
          </div>
  
          {/* All Time Period Changes */}
          <div className="border-t border-white/5 pt-2">
            <div className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">
              Performance
            </div>
            <div className="grid grid-cols-5 gap-1">
              {["1h", "1d", "1w", "1m", "1y"].map((period) => (
                <div
                  key={period}
                  className="text-center p-1.5 rounded-lg bg-white/[0.03]"
                >
                  <div className="text-[9px] text-gray-500 uppercase mb-0.5">
                    {period}
                  </div>
                  <div
                    className={`text-[11px] font-bold ${changeColor(stock.changes?.[period])}`}
                  >
                    {formatChange(stock.changes?.[period])}
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Volume & 52W Range */}
          <div className="border-t border-white/5 mt-2 pt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Volume: </span>
              <span className="text-gray-300">
                {stock.volume
                  ? stock.volume >= 10000000
                    ? `${(stock.volume / 10000000).toFixed(2)} Cr`
                    : stock.volume >= 100000
                    ? `${(stock.volume / 100000).toFixed(2)} L`
                    : stock.volume.toLocaleString("en-IN")
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">52W: </span>
              <span className="text-red-400">₹{stock.yearLow}</span>
              <span className="text-gray-500"> – </span>
              <span className="text-green-400">₹{stock.yearHigh}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default StockTooltip;