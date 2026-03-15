import { useState, useMemo } from "react";
import axios from "axios";

const FiiDiiManualEntry = () => {
  const today = new Date();
  
  const [activeTab, setActiveTab] = useState("single");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ===== SINGLE ENTRY STATE =====
  const [singleForm, setSingleForm] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    dateString: today.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).replace(/\s/g, "-"),
    fiiBuyValue: "",
    fiiSellValue: "",
    diiBuyValue: "",
    diiSellValue: ""
  });

  // ===== BULK ENTRY STATE =====
  const [bulkData, setBulkData] = useState("");

  // ===== Auto-calculate net values =====
  const fiiNet = useMemo(() => {
    const buy = parseFloat(singleForm.fiiBuyValue) || 0;
    const sell = parseFloat(singleForm.fiiSellValue) || 0;
    return buy - sell;
  }, [singleForm.fiiBuyValue, singleForm.fiiSellValue]);

  const diiNet = useMemo(() => {
    const buy = parseFloat(singleForm.diiBuyValue) || 0;
    const sell = parseFloat(singleForm.diiSellValue) || 0;
    return buy - sell;
  }, [singleForm.diiBuyValue, singleForm.diiSellValue]);

  // ===== Auto-generate date string =====
  const generateDateString = (year, month, day) => {
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).replace(/\s/g, "-");
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newValue = parseInt(value);
    
    const updatedForm = {
      ...singleForm,
      [name]: newValue
    };

    const dateString = generateDateString(
      updatedForm.year,
      updatedForm.month,
      updatedForm.day
    );

    setSingleForm({
      ...updatedForm,
      dateString
    });
  };

  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/fiidii/add-single",
        singleForm
      );

      setMessage(`✅ ${response.data.message}`);
      
      // Reset form
      const newToday = new Date();
      setSingleForm({
        year: newToday.getFullYear(),
        month: newToday.getMonth() + 1,
        day: newToday.getDate(),
        dateString: generateDateString(
          newToday.getFullYear(),
          newToday.getMonth() + 1,
          newToday.getDate()
        ),
        fiiBuyValue: "",
        fiiSellValue: "",
        diiBuyValue: "",
        diiSellValue: ""
      });

      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      setError(`❌ ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const records = JSON.parse(bulkData);

      if (!Array.isArray(records)) {
        setError("❌ Invalid JSON format. Must be an array.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/fiidii/add-bulk",
        { records }
      );

      setMessage(`✅ ${response.data.message}`);
      setBulkData("");

      setTimeout(() => setMessage(""), 3000);

    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("❌ Invalid JSON format");
      } else {
        setError(`❌ ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(today.getFullYear() - i);
    }
    return years;
  }, [today]);

  const getSentimentColor = (value) => {
    if (value > 0) return "text-green-400";
    if (value < 0) return "text-red-400";
    return "text-gray-400";
  };

  return (
    <div className="w-screen min-h-screen bg-[#0a0a1a] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📝 Manual FII/DII Data Entry
          </h1>
          <p className="text-gray-500 text-sm">
            Add Foreign and Domestic Institutional Investor cash flow data to MongoDB
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-4 bg-white/[0.02] p-4 rounded-lg border border-white/[0.05]">
          <button
            onClick={() => setActiveTab("single")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === "single"
                ? "bg-blue-500 text-white"
                : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]"
            }`}
          >
            📌 Single Entry
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === "bulk"
                ? "bg-blue-500 text-white"
                : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]"
            }`}
          >
            📋 Bulk Entry (JSON)
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-green-400 flex items-center gap-3">
            <span className="text-xl">✅</span>
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400 flex items-center gap-3">
            <span className="text-xl">❌</span>
            {error}
          </div>
        )}

        {/* Single Entry Form */}
        {activeTab === "single" && (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-8 space-y-8">
            
            {/* Date Section */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">📅 Date Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">Year</label>
                  <select
                    name="year"
                    value={singleForm.year}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white cursor-pointer hover:border-white/[0.2] focus:border-blue-500 transition-colors"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">Month</label>
                  <select
                    name="month"
                    value={singleForm.month}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white cursor-pointer hover:border-white/[0.2] focus:border-blue-500 transition-colors"
                  >
                    {monthNames.map((name, idx) => (
                      <option key={idx} value={idx + 1}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">Day</label>
                  <input
                    type="number"
                    name="day"
                    value={singleForm.day}
                    onChange={handleDateChange}
                    min="1"
                    max="31"
                    className="w-full px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">Generated Date</label>
                  <input
                    type="text"
                    value={singleForm.dateString}
                    disabled
                    className="w-full px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-blue-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* FII/FPI Data */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">💰 FII/FPI Data (₹ Crores)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">FII Buy (₹Cr)</label>
                  <input
                    type="number"
                    name="fiiBuyValue"
                    placeholder="Enter buy value"
                    value={singleForm.fiiBuyValue}
                    onChange={handleSingleChange}
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white placeholder-gray-600 focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">FII Sell (₹Cr)</label>
                  <input
                    type="number"
                    name="fiiSellValue"
                    placeholder="Enter sell value"
                    value={singleForm.fiiSellValue}
                    onChange={handleSingleChange}
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white placeholder-gray-600 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* FII Net Display */}
              <div className="bg-white/[0.05] p-4 rounded-lg border border-white/[0.1]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold">FII Net Value:</span>
                  <span className={`text-xl font-bold ${getSentimentColor(fiiNet)}`}>
                    {fiiNet > 0 ? "+" : ""}{fiiNet.toFixed(2)} ₹Cr
                  </span>
                </div>
              </div>
            </div>

            {/* DII Data */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">📊 DII Data (₹ Crores)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">DII Buy (₹Cr)</label>
                  <input
                    type="number"
                    name="diiBuyValue"
                    placeholder="Enter buy value"
                    value={singleForm.diiBuyValue}
                    onChange={handleSingleChange}
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white placeholder-gray-600 focus:border-green-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">DII Sell (₹Cr)</label>
                  <input
                    type="number"
                    name="diiSellValue"
                    placeholder="Enter sell value"
                    value={singleForm.diiSellValue}
                    onChange={handleSingleChange}
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white placeholder-gray-600 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* DII Net Display */}
              <div className="bg-white/[0.05] p-4 rounded-lg border border-white/[0.1]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold">DII Net Value:</span>
                  <span className={`text-xl font-bold ${getSentimentColor(diiNet)}`}>
                    {diiNet > 0 ? "+" : ""}{diiNet.toFixed(2)} ₹Cr
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSingleSubmit}
              disabled={loading || !singleForm.fiiBuyValue || !singleForm.fiiSellValue || !singleForm.diiBuyValue || !singleForm.diiSellValue}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? "⏳ Adding Record..." : "✅ Add Single Record"}
            </button>
          </div>
        )}

        {/* Bulk Entry */}
        {activeTab === "bulk" && (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-8 space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">📋 Bulk JSON Entry</h3>
              <label className="text-xs text-gray-500 uppercase mb-2 block font-bold">Paste JSON Array Below</label>
              <textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                placeholder={`[
  {
    "dateString": "13-Mar-2026",
    "year": 2026,
    "month": 3,
    "day": 13,
    "fiiBuyValue": 11923.16,
    "fiiSellValue": 22639.80,
    "diiBuyValue": 22707.84,
    "diiSellValue": 12730.42
  },
  {
    "dateString": "12-Mar-2026",
    "year": 2026,
    "month": 3,
    "day": 12,
    "fiiBuyValue": 15000.00,
    "fiiSellValue": 20000.00,
    "diiBuyValue": 18000.00,
    "diiSellValue": 15000.00
  }
]`}
                className="w-full h-80 px-4 py-3 rounded-lg bg-[#0a0a1a] border border-white/[0.1] text-white font-mono text-sm placeholder-gray-600 focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleBulkSubmit}
              disabled={loading || !bulkData.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? "⏳ Importing Records..." : "✅ Import Bulk Records"}
            </button>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                💡 <strong>Tip:</strong> Paste a valid JSON array above. Each object should have: dateString, year, month, day, fiiBuyValue, fiiSellValue, diiBuyValue, diiSellValue
              </p>
            </div>
          </div>
        )}

        {/* Example Data Box */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-8">
          <h3 className="text-white font-bold text-lg mb-4">📝 JSON Format Example</h3>
          <pre className="bg-[#0a0a1a] p-6 rounded-lg text-gray-300 text-xs overflow-x-auto border border-white/[0.1]">
{`[
  {
    "dateString": "13-Mar-2026",
    "year": 2026,
    "month": 3,
    "day": 13,
    "fiiBuyValue": 11923.16,
    "fiiSellValue": 22639.80,
    "diiBuyValue": 22707.84,
    "diiSellValue": 12730.42
  },
  {
    "dateString": "12-Mar-2026",
    "year": 2026,
    "month": 3,
    "day": 12,
    "fiiBuyValue": 15000.00,
    "fiiSellValue": 20000.00,
    "diiBuyValue": 18000.00,
    "diiSellValue": 15000.00
  },
  {
    "dateString": "11-Mar-2026",
    "year": 2026,
    "month": 3,
    "day": 11,
    "fiiBuyValue": 18500.50,
    "fiiSellValue": 21500.75,
    "diiBuyValue": 20000.00,
    "diiSellValue": 16500.00
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FiiDiiManualEntry;