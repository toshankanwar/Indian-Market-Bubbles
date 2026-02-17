import { PROXY_URL } from "../config/proxyConfig";

/**
 * HOURLY TRACKER
 * Stores price snapshots in localStorage every minute
 * Calculates actual 1-hour change by comparing current price with price from 1 hour ago
 */
export class HourlyTracker {
  constructor() {
    const saved = localStorage.getItem("hourly_v3");
    this.priceHistory = saved ? JSON.parse(saved) : {};
    this.lastSaveTime = 0;
  }

  recordPrice(symbol, price) {
    if (!price || price <= 0) return;

    if (!this.priceHistory[symbol]) {
      this.priceHistory[symbol] = [];
    }

    const now = Date.now();
    const history = this.priceHistory[symbol];
    const lastEntry = history[history.length - 1];

    // Record once per minute (60 seconds)
    if (lastEntry && now - lastEntry.t < 55000) {
      return;
    }

    history.push({ p: price, t: now });

    // Keep only last 4 hours of data
    const fourHoursAgo = now - 4 * 60 * 60 * 1000;
    this.priceHistory[symbol] = history.filter((e) => e.t > fourHoursAgo);
  }

  saveToStorage() {
    const now = Date.now();
    // Save at most once every 30 seconds
    if (now - this.lastSaveTime < 30000) return;
    this.lastSaveTime = now;

    try {
      const trimmed = {};
      // Keep max 250 stocks
      const symbols = Object.keys(this.priceHistory).slice(0, 250);
      symbols.forEach((sym) => {
        // Keep max 80 entries per stock (80 minutes)
        trimmed[sym] = this.priceHistory[sym].slice(-80);
      });
      localStorage.setItem("hourly_v3", JSON.stringify(trimmed));
    } catch {
      localStorage.removeItem("hourly_v3");
    }
  }

  getHourlyChange(symbol, currentPrice) {
    const history = this.priceHistory[symbol];
    if (!history || history.length < 2 || !currentPrice || currentPrice <= 0) {
      return null;
    }

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Find the entry that is closest to exactly 1 hour ago
    let bestEntry = null;
    let bestDiff = Infinity;

    for (const entry of history) {
      const diff = Math.abs(entry.t - oneHourAgo);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestEntry = entry;
      }
    }

    // If we have an entry within 20 minutes of the 1-hour mark, use it
    if (bestEntry && bestDiff < 20 * 60 * 1000 && bestEntry.p > 0) {
      return parseFloat(
        (((currentPrice - bestEntry.p) / bestEntry.p) * 100).toFixed(2)
      );
    }

    // Fallback: if we have at least 5 minutes of data, calculate change from oldest
    const oldest = history[0];
    const dataAgeMinutes = (now - oldest.t) / (60 * 1000);

    if (dataAgeMinutes >= 5 && oldest.p > 0) {
      return parseFloat(
        (((currentPrice - oldest.p) / oldest.p) * 100).toFixed(2)
      );
    }

    return null;
  }

  getDataAgeMinutes(symbol) {
    const history = this.priceHistory[symbol];
    if (!history || history.length === 0) return 0;
    return Math.round((Date.now() - history[0].t) / (60 * 1000));
  }
}

/**
 * WEEKLY CHANGE CALCULATOR
 * Strategy:
 * 1. Try NSE historical API for top stocks
 * 2. For remaining stocks, calculate from 1-month change (1m / 4.3)
 * 3. Cache everything for 6 hours
 */
export async function fetchWeeklyChanges(stocks) {
  const cacheKey = "weekly_v3";
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < 6 * 60 * 60 * 1000) {
      console.log(
        `📦 Weekly changes from cache (${Object.keys(parsed.data).length} stocks)`
      );
      return parsed.data;
    }
  }

  console.log("📈 Calculating weekly changes...");
  const weeklyChanges = {};

  // Step 1: Try NSE historical for top 80 stocks
  const topStocks = stocks.filter((s) => s.ltp > 0).slice(0, 80);
  const batchSize = 4;

  for (let i = 0; i < topStocks.length; i += batchSize) {
    const batch = topStocks.slice(i, i + batchSize);

    const promises = batch.map(async (stock) => {
      const change = await fetchOneStockWeekly(stock.symbol);
      if (change !== null) {
        weeklyChanges[stock.symbol] = change;
      }
    });

    await Promise.all(promises);

    if (i + batchSize < topStocks.length) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  // Step 2: For stocks where NSE historical failed, estimate from monthly change
  stocks.forEach((stock) => {
    if (weeklyChanges[stock.symbol] !== undefined) return;

    const monthly = stock.changes?.["1m"] || 0;
    const daily = stock.changes?.["1d"] || 0;

    if (monthly !== 0) {
      // Weekly ≈ Monthly / 4.3 (roughly 4.3 weeks per month)
      weeklyChanges[stock.symbol] = parseFloat((monthly / 4.3).toFixed(2));
    } else if (daily !== 0) {
      // Very rough: weekly ≈ daily * 3 (momentum assumption)
      weeklyChanges[stock.symbol] = parseFloat((daily * 3).toFixed(2));
    } else {
      weeklyChanges[stock.symbol] = 0;
    }
  });

  // Cache
  localStorage.setItem(
    cacheKey,
    JSON.stringify({ data: weeklyChanges, timestamp: Date.now() })
  );

  console.log(
    `✅ Weekly changes: ${Object.keys(weeklyChanges).length} stocks`
  );
  return weeklyChanges;
}

async function fetchOneStockWeekly(symbol) {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 10);

    const fmt = (d) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      return `${dd}-${mm}-${d.getFullYear()}`;
    };

    const endpoint = `/api/historical/cm/equity?symbol=${encodeURIComponent(
      symbol
    )}&from=${fmt(weekAgo)}&to=${fmt(today)}`;

    const res = await fetch(
      `${PROXY_URL}?endpoint=${encodeURIComponent(endpoint)}`
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.data || data.data.length < 2) return null;

    const sorted = [...data.data].sort(
      (a, b) => new Date(a.CH_TIMESTAMP) - new Date(b.CH_TIMESTAMP)
    );

    const oldClose = sorted[0].CH_CLOSING_PRICE;
    const newClose = sorted[sorted.length - 1].CH_CLOSING_PRICE;

    if (!oldClose || oldClose <= 0) return null;

    return parseFloat((((newClose - oldClose) / oldClose) * 100).toFixed(2));
  } catch {
    return null;
  }
}