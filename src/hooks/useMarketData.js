import { useState, useEffect, useRef, useCallback } from "react";
import { fetchAllStocks, isMarketOpen } from "../services/nseService";
import { HourlyTracker, fetchWeeklyChanges } from "../services/changeTracker";
import { POLL_INTERVAL } from "../config/proxyConfig";

export function useMarketData() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [marketOpen, setMarketOpen] = useState(false);
  const [hourlyDataAge, setHourlyDataAge] = useState(0);

  const hourlyTrackerRef = useRef(new HourlyTracker());
  const intervalRef = useRef(null);
  const weeklyChangesRef = useRef({});

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📊 Fetching stocks...");
      const allStocks = await fetchAllStocks();

      if (!allStocks || allStocks.length === 0) {
        throw new Error("No stock data received. Check your proxy URL.");
      }

      // Record prices for hourly tracking
      allStocks.forEach((s) =>
        hourlyTrackerRef.current.recordPrice(s.symbol, s.ltp)
      );
      hourlyTrackerRef.current.saveToStorage();

      // Fetch weekly changes
      console.log("📈 Loading weekly data...");
      const weeklyChanges = await fetchWeeklyChanges(allStocks);
      weeklyChangesRef.current = weeklyChanges;

      // Build final stock objects with all time periods
      const enriched = allStocks.map((stock) => {
        const hourly = hourlyTrackerRef.current.getHourlyChange(
          stock.symbol,
          stock.ltp
        );

        return {
          ...stock,
          changes: {
            "1h": hourly !== null ? hourly : 0,
            "1d": stock.changes?.["1d"] || 0,
            "1w": weeklyChanges[stock.symbol] || 0,
            "1m": stock.changes?.["1m"] || 0,
            "1y": stock.changes?.["1y"] || 0,
          },
        };
      });

      setStocks(enriched);
      setLastUpdated(new Date());
      setMarketOpen(isMarketOpen());
      setLoading(false);

      const age = hourlyTrackerRef.current.getDataAgeMinutes(
        allStocks[0]?.symbol || ""
      );
      setHourlyDataAge(age);

      console.log(`✅ ${enriched.length} stocks loaded | Hourly data: ${age}m`);
    } catch (err) {
      console.error("Load failed:", err);
      setError(err.message || "Failed to load data");
      setLoading(false);
    }
  }, []);

  // Poll every 60 seconds
  const pollUpdate = useCallback(async () => {
    const open = isMarketOpen();
    setMarketOpen(open);

    try {
      const freshStocks = await fetchAllStocks();
      if (!freshStocks || freshStocks.length === 0) return;

      setStocks((prev) => {
        const map = new Map(prev.map((s) => [s.symbol, s]));

        freshStocks.forEach((fresh) => {
          const existing = map.get(fresh.symbol);
          if (!existing) return;

          hourlyTrackerRef.current.recordPrice(fresh.symbol, fresh.ltp);

          const hourly = hourlyTrackerRef.current.getHourlyChange(
            fresh.symbol,
            fresh.ltp
          );

          map.set(fresh.symbol, {
            ...existing,
            ltp: fresh.ltp,
            open: fresh.open,
            high: fresh.high,
            low: fresh.low,
            volume: fresh.volume,
            changes: {
              "1h": hourly !== null ? hourly : existing.changes["1h"],
              "1d": fresh.changes["1d"],
              "1w":
                weeklyChangesRef.current[fresh.symbol] ??
                existing.changes["1w"],
              "1m": fresh.changes["1m"],
              "1y": fresh.changes["1y"],
            },
          });
        });

        return Array.from(map.values());
      });

      hourlyTrackerRef.current.saveToStorage();
      setLastUpdated(new Date());

      const age = hourlyTrackerRef.current.getDataAgeMinutes(
        freshStocks[0]?.symbol || ""
      );
      setHourlyDataAge(age);
    } catch (err) {
      console.error("Poll failed:", err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();

    // Poll every 60 seconds
    intervalRef.current = setInterval(pollUpdate, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      hourlyTrackerRef.current.saveToStorage();
    };
  }, [loadInitialData, pollUpdate]);

  return { stocks, loading, error, lastUpdated, marketOpen, hourlyDataAge };
}