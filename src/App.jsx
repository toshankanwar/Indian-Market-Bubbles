import { useState, useCallback, useMemo } from "react";
import { useMarketData } from "./hooks/useMarketData";
import Header from "./components/Header";
import CategoryFilter from "./components/CategoryFilter";
import TimeFilter from "./components/TimeFilter";
import RangeSelector from "./components/RangeSelector";
import BubbleChart from "./components/BubbleChart";
import StockInfoPanel from "./components/StockInfoPanel";
import LoadingScreen from "./components/LoadingScreen";
import Footer from "./components/Footer";

function App() {
  const { stocks, loading, error, lastUpdated, marketOpen, hourlyDataAge } =
    useMarketData();

  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTime, setActiveTime] = useState("1d");
  const [activeRange, setActiveRange] = useState({
    label: "Top 1 – 50",
    start: 0,
    end: 50,
  });
  const [selectedStock, setSelectedStock] = useState(null);

  const filteredStocks = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];

    let filtered;
    if (activeFilter === "all") {
      filtered = stocks;
    } else if (activeFilter === "nifty50") {
      filtered = stocks.filter((s) => s.isNifty50);
    } else {
      filtered = stocks.filter((s) => s.sector === activeFilter);
    }

    filtered = filtered.filter((s) => s.ltp > 0);

    filtered.sort(
      (a, b) =>
        Math.abs(b.changes?.[activeTime] || 0) -
        Math.abs(a.changes?.[activeTime] || 0)
    );

    const start = activeRange.start || 0;
    const end =
      activeRange.end === Infinity ? filtered.length : activeRange.end;
    filtered = filtered.slice(start, end);

    return filtered;
  }, [stocks, activeFilter, activeTime, activeRange]);

  const totalInCategory = useMemo(() => {
    if (!stocks || stocks.length === 0) return 0;
    if (activeFilter === "all") return stocks.filter((s) => s.ltp > 0).length;
    if (activeFilter === "nifty50")
      return stocks.filter((s) => s.isNifty50 && s.ltp > 0).length;
    return stocks.filter((s) => s.sector === activeFilter && s.ltp > 0).length;
  }, [stocks, activeFilter]);

  const handleStockClick = useCallback(
    (stock) => {
      if (!stock) {
        setSelectedStock(null);
        return;
      }
      const latest = stocks.find((s) => s.symbol === stock.symbol) || stock;
      setSelectedStock(latest);
    },
    [stocks]
  );

  return (
    <div className="w-screen min-h-screen flex flex-col bg-[#0a0a1a]">
      <LoadingScreen loading={loading} error={error} />

      {/* ===== STICKY TOP BAR (Header + Filters stay on top) ===== */}
      <div className="sticky top-0 z-50 flex flex-col">
        {/* Header with Install Button */}
        <Header
          lastUpdated={lastUpdated}
          marketOpen={marketOpen}
          stockCount={filteredStocks.length}
          hourlyDataAge={hourlyDataAge}
        />

        {/* Category Filters */}
        <CategoryFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Time + Range Row */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a1a]/95 backdrop-blur-md border-b border-white/5">
          <TimeFilter activeTime={activeTime} onTimeChange={setActiveTime} />
          <RangeSelector
            activeRange={activeRange}
            onRangeChange={setActiveRange}
            totalStocks={totalInCategory}
          />
        </div>
      </div>

      {/* ===== BUBBLE CHART (Full Viewport Height) ===== */}
      <div className="w-full" style={{ height: "calc(100vh - 130px)" }}>
        {filteredStocks.length > 0 ? (
          <BubbleChart
            stocks={filteredStocks}
            timePeriod={activeTime}
            onStockClick={handleStockClick}
          />
        ) : (
          !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl mb-4">🫧</div>
                <p className="text-gray-400 text-base font-medium mb-1">
                  No stocks found
                </p>
                <p className="text-gray-600 text-xs">
                  Try a different category or range
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* ===== SCROLL INDICATOR (tells user they can scroll for more) ===== */}
      <div className="w-full flex justify-center py-4 bg-gradient-to-b from-[#0a0a1a] to-[#080818]">
        <div className="flex flex-col items-center gap-1 text-gray-600 animate-bounce">
          <span className="text-xs">Scroll down for more info</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* ===== FOOTER (appears after scrolling below bubbles) ===== */}
      <Footer
        stockCount={filteredStocks.length}
        marketOpen={marketOpen}
        lastUpdated={lastUpdated}
      />

      {/* Stock Info Panel (on click – modal overlay) */}
      {selectedStock && (
        <StockInfoPanel
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
}

export default App;