import { useState, useEffect, useMemo } from "react";
import { fetchFiiDiiCashHistory } from "../services/fiiDiiCashService";

const FiiDiiCashPage = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(today.getFullYear() - i);
    }
    return years;
  }, [today]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const historyData = await fetchFiiDiiCashHistory(selectedYear, selectedMonth);
        setData(historyData || []);
      } catch (err) {
        console.error("❌ Error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedYear, selectedMonth]);

  const formatCrores = (num) => {
    if (num === null || num === undefined) return "0.00";
    return parseFloat(num).toFixed(2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const getSentimentColor = (value) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <div className="w-screen min-h-screen flex flex-col bg-[#0a0a1a]">
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 FII/DII Cash Flow
            </h1>
            <p className="text-gray-500 text-sm">
              Historical Foreign and Domestic Institutional Investor flows
            </p>
          </div>

          {/* Month/Year Selector */}
          <div className="flex gap-4 items-end bg-white/[0.02] p-4 rounded-lg border border-white/[0.05]">
            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white cursor-pointer hover:border-white/[0.2] focus:border-blue-500 transition-colors"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white cursor-pointer hover:border-white/[0.2] focus:border-blue-500 transition-colors"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto">
              <p className="text-sm font-bold text-blue-400">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-3"></div>
                <p className="text-gray-400">Loading...</p>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!loading && data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No data available</p>
            </div>
          )}

          {/* Data Table */}
          {!loading && data.length > 0 && (
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">
                        Date
                      </th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">
                        FII Buy (₹Cr)
                      </th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">
                        FII Sell (₹Cr)
                      </th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">
                        FII Net (₹Cr)
                      </th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">
                        DII Buy (₹Cr)
                      </th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">
                        DII Sell (₹Cr)
                      </th>
                      <th className="text-right px-4 py-3 text-gray-500 font-medium">
                        DII Net (₹Cr)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-400">
                          {formatDate(row.date)}
                        </td>
                        <td className="text-right px-4 py-3 text-green-400">
                          {formatCrores(row.fiiBuyValue)}
                        </td>
                        <td className="text-right px-4 py-3 text-red-400">
                          {formatCrores(row.fiiSellValue)}
                        </td>
                        <td className={`text-right px-4 py-3 font-medium ${getSentimentColor(row.fiiNetValue)}`}>
                          {row.fiiNetValue > 0 ? "+" : ""}
                          {formatCrores(row.fiiNetValue)}
                        </td>
                        <td className="text-right px-4 py-3 text-green-400">
                          {formatCrores(row.diiBuyValue)}
                        </td>
                        <td className="text-right px-4 py-3 text-red-400">
                          {formatCrores(row.diiSellValue)}
                        </td>
                        <td className={`text-right px-4 py-3 font-medium ${getSentimentColor(row.diiNetValue)}`}>
                          {row.diiNetValue > 0 ? "+" : ""}
                          {formatCrores(row.diiNetValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiiDiiCashPage;