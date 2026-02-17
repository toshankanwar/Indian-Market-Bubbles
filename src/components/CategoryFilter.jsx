import { ALL_CATEGORIES } from "../config/sectorMapping";

const CategoryFilter = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="flex gap-1.5 px-4 py-2 overflow-x-auto bg-[#0a0a1a]/80 border-b border-white/5">
      {ALL_CATEGORIES.map((cat) => (
        <button
          key={cat.filter}
          onClick={() => onFilterChange(cat.filter)}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
            whitespace-nowrap transition-all duration-200 border
            ${
              activeFilter === cat.filter
                ? "bg-blue-600 border-blue-500 text-white filter-active"
                : "bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
            }
          `}
        >
          <span>{cat.emoji}</span>
          <span>{cat.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;