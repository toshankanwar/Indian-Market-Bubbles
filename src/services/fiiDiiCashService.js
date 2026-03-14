/**
 * FII/DII Cash Flow Service
 * Fetches from your backend API at https://api.fiidii.toshankanwar.in/
 * Supports fetching data for specific months
 */

const API_BASE_URL = "https://api.fiidii.toshankanwar.in/api/fiidii";

/**
 * Fetch FII/DII cash flow history for specific month/year
 * Returns unique records by date (latest only if duplicates exist)
 */
export async function fetchFiiDiiCashHistory(year, month) {
  const cacheKey = `fii_dii_${year}_${month}`;
  const cached = localStorage.getItem(cacheKey);

  // Cache for 6 hours
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < 6 * 60 * 60 * 1000) {
      console.log(`📦 FII/DII ${month}/${year} data from cache`);
      return parsed.data;
    }
  }

  try {
    console.log(`📊 Fetching FII/DII data for ${month}/${year}...`);

    const url = `${API_BASE_URL}/month?year=${year}&month=${month}`;
    console.log(`🔗 Request URL: ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`❌ API returned ${res.status}`);
      return [];
    }

    let data = await res.json();
    console.log(`✅ API Response (${data.length} records):`, data);

    // Handle response
    if (!Array.isArray(data)) {
      console.warn("⚠️ Response is not an array");
      return [];
    }

    if (data.length === 0) {
      console.warn(`⚠️ No data for ${month}/${year}`);
      return [];
    }

    // Filter by month and year
    const filteredData = data.filter((record) => {
      return record.month === month && record.year === year;
    });

    if (filteredData.length === 0) {
      console.warn(`⚠️ No data matched for ${month}/${year} after filtering`);
      return [];
    }

    // Remove duplicates - keep latest by date for each unique date
    const uniqueByDate = {};
    filteredData.forEach((record) => {
      const dateKey = record.dateString;
      
      // If date doesn't exist or new record is newer, replace it
      if (!uniqueByDate[dateKey] || new Date(record.date) > new Date(uniqueByDate[dateKey].date)) {
        uniqueByDate[dateKey] = record;
      }
    });

    // Convert back to array and sort by date descending
    let uniqueData = Object.values(uniqueByDate);
    uniqueData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Format the data
    const formatted = uniqueData.map((record) => formatCashRecord(record));

    // Cache it
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: formatted,
        timestamp: Date.now(),
      })
    );

    console.log(`✅ Loaded ${formatted.length} unique records for ${month}/${year}`);
    return formatted;
  } catch (err) {
    console.error(`❌ Error fetching FII/DII data for ${month}/${year}:`, err);
    return [];
  }
}

/**
 * Format individual cash flow record
 */
function formatCashRecord(record) {
  return {
    _id: record._id,
    date: record.date,
    dateString: record.dateString,
    day: record.day,
    month: record.month,
    week: record.week,
    year: record.year,

    fiiNetValue: parseFloat(record.fiiNetValue) || 0,
    fiiBuyValue: parseFloat(record.fiiBuyValue) || 0,
    fiiSellValue: parseFloat(record.fiiSellValue) || 0,

    diiNetValue: parseFloat(record.diiNetValue) || 0,
    diiBuyValue: parseFloat(record.diiBuyValue) || 0,
    diiSellValue: parseFloat(record.diiSellValue) || 0,
  };
}