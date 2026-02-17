import { PROXY_URL, CACHE_TTL } from "../config/proxyConfig";
import { SECTOR_MAP } from "../config/sectorMapping";

// List of Nifty 50 symbols (for "Nifty 50" filter)
const NIFTY50_SYMBOLS = new Set([
  "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR",
  "ITC", "SBIN", "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK",
  "WIPRO", "HCLTECH", "SUNPHARMA", "MARUTI", "TATAMOTORS", "NTPC",
  "POWERGRID", "ONGC", "TATASTEEL", "JSWSTEEL", "DRREDDY", "CIPLA",
  "BAJFINANCE", "BAJAJ-AUTO", "TECHM", "NESTLEIND", "ADANIENT",
  "ADANIPORTS", "ULTRACEMCO", "TITAN", "INDUSINDBK", "COALINDIA",
  "GRASIM", "DIVISLAB", "EICHERMOT", "APOLLOHOSP", "HEROMOTOCO",
  "BAJAJFINSV", "TATACONSUM", "SBILIFE", "HDFCLIFE", "BRITANNIA",
  "M&M", "HINDALCO", "BPCL", "LTIM", "TRENT",
]);

/**
 * Fetch all stocks from a specific NSE index
 */
async function fetchIndex(indexName) {
  try {
    const res = await fetch(
      `${PROXY_URL}?endpoint=/api/equity-stockIndices?index=${encodeURIComponent(indexName)}`
    );

    if (!res.ok) {
      console.error(`NSE API returned ${res.status} for ${indexName}`);
      return [];
    }

    const data = await res.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.error(`Invalid data for ${indexName}`);
      return [];
    }

    return data.data
      .filter((s) => s.symbol && s.lastPrice > 0 && s.symbol !== indexName.replace(/%20/g, " "))
      .map((stock) => {
        const mapping = SECTOR_MAP[stock.symbol] || { sector: "Other", industry: "General" };

        return {
          symbol: stock.symbol,
          name: stock.meta?.companyName || stock.symbol,
          ltp: stock.lastPrice,
          open: stock.open,
          high: stock.dayHigh,
          low: stock.dayLow,
          prevClose: stock.previousClose,
          volume: stock.totalTradedVolume || 0,
          yearHigh: stock.yearHigh,
          yearLow: stock.yearLow,
          sector: mapping.sector,
          industry: mapping.industry,
          isNifty50: NIFTY50_SYMBOLS.has(stock.symbol),
          changes: {
            "1h": 0, // Tracked in browser
            "1d": parseFloat(stock.pChange?.toFixed(2) || 0),
            "1w": 0, // Calculated from historical
            "1m": parseFloat(stock.perChange30d?.toFixed(2) || 0),
            "1y": parseFloat(stock.perChange365d?.toFixed(2) || 0),
          },
        };
      });
  } catch (err) {
    console.error(`Failed to fetch ${indexName}:`, err);
    return [];
  }
}

/**
 * Fetch ALL stocks from multiple indices
 * Deduplicates by symbol and assigns sectors
 */
export async function fetchAllStocks() {
  // Check sessionStorage cache
  const cached = sessionStorage.getItem("nse_allStocks");
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_TTL) {
      return parsed.data;
    }
  }

  // Fetch from multiple indices for better sector coverage
  const indexList = [
    "NIFTY 500",        // 500 stocks – main source
    "NIFTY BANK",       // Banking stocks
    "NIFTY IT",         // IT stocks
    "NIFTY PHARMA",     // Pharma stocks
    "NIFTY AUTO",       // Auto stocks
    "NIFTY METAL",      // Metal stocks
    "NIFTY ENERGY",     // Energy stocks
    "NIFTY FMCG",       // FMCG stocks
    "NIFTY REALTY",     // Realty stocks
    "NIFTY MEDIA",      // Media stocks
    "NIFTY INFRA",      // Infrastructure
    "NIFTY COMMODITIES",// Commodities
    "NIFTY PSU BANK",   // PSU Banks
    "NIFTY HEALTHCARE", // Healthcare
    "NIFTY CONSR DURBL",// Consumer Durables
    "NIFTY OIL AND GAS",// Oil & Gas
    "NIFTY MIDCAP 50",  // Midcap
    "NIFTY SMLCAP 50",  // Smallcap
  ];

  // Fetch all indices in parallel
  const results = await Promise.allSettled(
    indexList.map((idx) => fetchIndex(idx))
  );

  // Merge & deduplicate
  const stockMap = {};
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.forEach((stock) => {
        if (!stockMap[stock.symbol]) {
          stockMap[stock.symbol] = stock;
        } else {
          // Keep the one with a valid sector (not "Other")
          if (stock.sector !== "Other" && stockMap[stock.symbol].sector === "Other") {
            stockMap[stock.symbol].sector = stock.sector;
            stockMap[stock.symbol].industry = stock.industry;
          }
        }
      });
    }
  });

  const allStocks = Object.values(stockMap);
  console.log(`📊 Loaded ${allStocks.length} unique stocks`);

  // Cache
  sessionStorage.setItem(
    "nse_allStocks",
    JSON.stringify({ data: allStocks, timestamp: Date.now() })
  );

  return allStocks;
}

/**
 * Check if Indian market is currently open
 */
export function isMarketOpen() {
  const now = new Date();
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = ist.getDay();
  const time = ist.getHours() * 60 + ist.getMinutes();

  // Market: Mon-Fri, 9:15 AM (555 min) to 3:30 PM (930 min) IST
  if (day === 0 || day === 6) return false;
  return time >= 555 && time <= 930;
}