import { useState, useRef, useEffect } from "react";

const RANGES = [
  { label: "All Stocks", start: 0, end: Infinity },
  { label: "Top 1 – 50", start: 0, end: 50 },
  { label: "Top 51 – 100", start: 50, end: 100 },
  { label: "Top 101 – 150", start: 100, end: 150 },
  { label: "Top 151 – 200", start: 150, end: 200 },
  { label: "Top 201 – 300", start: 200, end: 300 },
  { label: "Top 301 – 400", start: 300, end: 400 },
  { label: "Top 401 – 500", start: 400, end: 500 },
];

const RangeSelector = ({ activeRange, onRangeChange, totalStocks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentRange = RANGES.find(
    (r) => r.start === activeRange.start && r.end === activeRange.end
  ) || RANGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                   bg-[#1a1a2e] border border-white/10 text-gray-300
                   hover:border-purple-500/50 hover:text-white transition-all duration-200"
      >
        <span>📊</span>
        <span>{currentRange.label}</span>
        <span className="text-gray-500">({totalStocks})</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-[100] min-w-[180px]
                        bg-[#12122a] border border-white/10 rounded-xl shadow-2xl
                        overflow-hidden tooltip-enter">
          {RANGES.map((range) => {
            const isActive =
              activeRange.start === range.start &&
              activeRange.end === range.end;

            return (
              <button
                key={range.label}
                onClick={() => {
                  onRangeChange(range);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-all duration-150
                  ${
                    isActive
                      ? "bg-purple-600/20 text-purple-300 border-l-2 border-purple-500"
                      : "text-gray-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                  }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RangeSelector;