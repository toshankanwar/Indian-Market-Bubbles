import { useState, useEffect } from "react";
import axios from "axios";

const StockInfoPanel = ({ stock, onClose }) => {
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (stock?.symbol) {
      fetchCompanyDetails(stock.symbol);
    }
  }, [stock?.symbol]);

  const fetchCompanyDetails = async (symbol) => {
    try {
      setLoading(true);
      setError("");

      let cleanSymbol = symbol.replace(".NS", "");

      console.log("📍 Fetching company details for:", cleanSymbol);

      const response = await axios.get(
        `https://api.fiidii.toshankanwar.in/api/company/details/${cleanSymbol}`,
        { timeout: 20000 }
      );

      console.log("✅ Company details:", response.data);

      if (response.data?.error) {
        setError(response.data.error);
        setCompanyDetails(null);
      } else {
        setCompanyDetails(response.data);
        setError("");
      }
    } catch (err) {
      console.error("❌ Error fetching:", err);
      setError("Could not fetch company details");
      setCompanyDetails(null);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed z-[200] bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:rounded-2xl">
        <div className="bg-gradient-to-b from-[#0d0d24] to-[#0a0a1a] border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header - Fixed */}
          <div className="flex-shrink-0 relative border-b border-white/5 p-5 bg-[#0d0d24]/80 backdrop-blur">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
            >
              ✕
            </button>

            {/* Stock Header */}
            <div>
              <h2 className="text-xl font-bold text-white pr-8">{stock.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-400 font-medium">
                  {stock.symbol}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {stock.sector || "N/A"}
                </span>
                {stock.industry && stock.industry !== stock.sector && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {stock.industry}
                  </span>
                )}
              </div>
            </div>

            {/* Current Price */}
            <div className="mt-4">
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
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-shrink-0 flex gap-1 px-5 pt-4 border-b border-white/5 bg-[#0d0d24]/50">
            {[
              { id: "overview", label: "📊 Overview", icon: "📊" },
              { id: "company", label: "🏢 Company", icon: "🏢" },
              { id: "metrics", label: "📈 Metrics", icon: "📈" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-500/20 text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab.icon} {tab.label.split(" ")[1]}
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-4">
              
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Performance */}
                  <div>
                    <h3 className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
                      Performance
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { key: "1h", label: "1H" },
                        { key: "1d", label: "1D" },
                        { key: "1w", label: "1W" },
                        { key: "1m", label: "1M" },
                        { key: "1y", label: "1Y" },
                      ].map((period) => {
                        const val = stock.changes?.[period.key];
                        return (
                          <div
                            key={period.key}
                            className={`text-center p-3 rounded-lg ${changeBg(
                              val
                            )} border border-white/5 hover:border-white/10 transition-colors`}
                          >
                            <div className="text-[9px] text-gray-500 mb-1">
                              {period.label}
                            </div>
                            <div
                              className={`text-sm font-bold ${changeColor(
                                val
                              )}`}
                            >
                              {formatChange(val)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Today's Range */}
                  <div>
                    <h3 className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
                      Today's Range
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-xs text-gray-500">Open</span>
                        <div className="text-lg text-white font-bold mt-1">
                          ₹{stock.open?.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                        <span className="text-xs text-gray-500">Prev Close</span>
                        <div className="text-lg text-white font-bold mt-1">
                          ₹{stock.prevClose?.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 hover:border-green-500/30 transition-colors">
                        <span className="text-xs text-green-400">Day High</span>
                        <div className="text-lg text-green-400 font-bold mt-1">
                          ₹{stock.high?.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:border-red-500/30 transition-colors">
                        <span className="text-xs text-red-400">Day Low</span>
                        <div className="text-lg text-red-400 font-bold mt-1">
                          ₹{stock.low?.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Info */}
                  <div>
                    <h3 className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">
                      Market Info
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-xs text-gray-500">Volume</span>
                        <div className="text-lg text-white font-bold mt-1">
                          {formatVolume(stock.volume)}
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-xs text-gray-500">52W Range</span>
                        <div className="text-xs mt-1">
                          <span className="text-red-400">₹{stock.yearLow}</span>
                          <span className="text-gray-600"> - </span>
                          <span className="text-green-400">₹{stock.yearHigh}</span>
                        </div>
                      </div>
                    </div>

                    {/* 52W Position Bar */}
                    {stock.yearLow && stock.yearHigh && stock.ltp && (
                      <div className="mt-4 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-gray-500">52W Position</span>
                          <span className="text-xs text-blue-400 font-bold">
                            {(
                              ((stock.ltp - stock.yearLow) /
                                (stock.yearHigh - stock.yearLow)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full relative overflow-hidden">
                          <div
                            className="absolute top-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                            style={{
                              width: `${Math.max(
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
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                          <span>Low</span>
                          <span>Current</span>
                          <span>High</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* COMPANY TAB */}
              {activeTab === "company" && (
                <div className="space-y-4">
                  {loading && (
                    <div className="text-center py-8">
                      <div className="w-10 h-10 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-gray-400 text-sm mt-3">Fetching company info...</p>
                    </div>
                  )}

                  {error && !loading && (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                      ⚠️ {error}
                    </div>
                  )}

                  {companyDetails && !loading && (
                    <>
                      {companyDetails.name && (
                        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                          <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Company Name</div>
                          <div className="text-lg text-white font-bold">
                            {companyDetails.name}
                          </div>
                        </div>
                      )}

                      {companyDetails.ceo && companyDetails.ceo !== "N/A" && (
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                          <div className="text-xs text-gray-500 mb-2 uppercase font-bold">CEO</div>
                          <div className="text-sm text-white font-medium">
                            {companyDetails.ceo}
                          </div>
                        </div>
                      )}

                      {companyDetails.founded && companyDetails.founded !== "N/A" && (
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                          <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Founded</div>
                          <div className="text-sm text-white font-medium">
                            {companyDetails.founded}
                          </div>
                        </div>
                      )}

                      {companyDetails.headquarters && companyDetails.headquarters !== "N/A" && (
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                          <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Headquarters</div>
                          <div className="text-sm text-white font-medium">
                            {companyDetails.headquarters}
                          </div>
                        </div>
                      )}

                      {companyDetails.website && companyDetails.website !== "N/A" && (
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                          <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Website</div>
                          <a
                            href={companyDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 break-all"
                          >
                            Visit Website ↗
                          </a>
                        </div>
                      )}

                      {companyDetails.description && companyDetails.description !== "N/A" && (
                        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="text-xs text-gray-500 mb-2 uppercase font-bold">About Company</div>
                          <div className="text-xs text-gray-300 leading-relaxed">
                            {companyDetails.description}
                          </div>
                        </div>
                      )}

                      {companyDetails.source && (
                        <div className="p-3 rounded-lg bg-white/[0.01] border border-white/5 text-center">
                          <div className="text-[10px] text-gray-600">
                            📊 Data from: <span className="text-gray-400">{companyDetails.source}</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* METRICS TAB */}
          {/* METRICS TAB */}
{activeTab === "metrics" && (
  <div className="space-y-4">
    {companyDetails?.nseData ? (
      <>
        {/* Sector */}
        {companyDetails.nseData.sector && companyDetails.nseData.sector !== "N/A" && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Sector</div>
            <div className="text-sm text-blue-400 font-medium">
              {companyDetails.nseData.sector}
            </div>
          </div>
        )}

        {/* Industry */}
        {companyDetails.nseData.industry && companyDetails.nseData.industry !== "N/A" && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Industry</div>
            <div className="text-sm text-purple-400 font-medium">
              {companyDetails.nseData.industry}
            </div>
          </div>
        )}

        {/* P/E Ratio */}
        <div className="grid grid-cols-2 gap-3">
          {companyDetails.nseData.pe > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
              <div className="text-xs text-gray-500 mb-2 uppercase font-bold">P/E Ratio</div>
              <div className="text-2xl text-green-400 font-bold">
                {companyDetails.nseData.pe.toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                Price to Earnings
              </div>
            </div>
          )}

          {companyDetails.nseData.pb > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
              <div className="text-xs text-gray-500 mb-2 uppercase font-bold">P/B Ratio</div>
              <div className="text-2xl text-cyan-400 font-bold">
                {companyDetails.nseData.pb.toFixed(2)}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                Price to Book
              </div>
            </div>
          )}
        </div>

        {/* Dividend */}
        {companyDetails.nseData.dividend > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
            <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Dividend Yield</div>
            <div className="text-2xl text-yellow-400 font-bold">
              {companyDetails.nseData.dividend.toFixed(2)}%
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Annual dividend yield
            </div>
          </div>
        )}

        {/* Market Cap */}
        {companyDetails.nseData.marketCap && companyDetails.nseData.marketCap !== "N/A" && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20">
            <div className="text-xs text-gray-500 mb-2 uppercase font-bold">Market Cap</div>
            <div className="text-lg text-orange-400 font-bold">
              {typeof companyDetails.nseData.marketCap === "string"
                ? companyDetails.nseData.marketCap
                : `₹${(companyDetails.nseData.marketCap / 1000000000).toFixed(2)}B`}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Market capitalization
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center">
          <div className="text-[10px] text-gray-600">
            ℹ️ Metrics from <span className="text-gray-400 font-medium">NSE India</span>
          </div>
        </div>
      </>
    ) : (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm">Metrics data not available</p>
        <p className="text-xs mt-2 text-gray-500">Try another stock</p>
      </div>
    )}
  </div>
)}
            </div>
          </div>

          {/* Footer - Quick Labels - Fixed */}
          <div className="flex-shrink-0 flex flex-wrap gap-2 p-4 border-t border-white/5 bg-[#0d0d24]/50">
            {stock.isNifty50 && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-medium">
                ⭐ Nifty 50
              </span>
            )}
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              📍 NSE
            </span>
            {stock.changes?.["1d"] > 3 && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                🔥 Hot Today
              </span>
            )}
            {stock.changes?.["1d"] < -3 && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
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