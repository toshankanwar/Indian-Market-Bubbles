const TIME_OPTIONS = [
    { key: "1h", label: "1H", description: "1 Hour" },
    { key: "1d", label: "1D", description: "1 Day" },
    { key: "1w", label: "1W", description: "1 Week" },
    { key: "1m", label: "1M", description: "1 Month" },
    { key: "1y", label: "1Y", description: "1 Year" },
  ];
  
  const TimeFilter = ({ activeTime, onTimeChange }) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-500 mr-1.5 uppercase tracking-wider">
          Change:
        </span>
        {TIME_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onTimeChange(opt.key)}
            title={opt.description}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border
              ${
                activeTime === opt.key
                  ? "bg-orange-500 border-orange-500 text-black shadow-lg shadow-orange-500/20"
                  : "bg-transparent border-white/10 text-gray-500 hover:border-orange-500/40 hover:text-orange-400"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };
  
  export default TimeFilter;