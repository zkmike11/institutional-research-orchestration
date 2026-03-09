"use client";

import { useState, useEffect, useMemo } from "react";

interface HistoricalEntry {
  date: string;
  close: number;
}

interface PerformanceHistorical {
  /** Last ~252 daily closes (1Y of data for sparkline) */
  sparklineData: number[];
  /** Period returns computed from 3Y historical */
  periodReturns: {
    w1: number;
    m1: number;
    y1: number;
    y3: number;
  };
}

export interface PerformanceDataMap {
  [symbol: string]: PerformanceHistorical;
}

function computePeriodReturn(
  data: HistoricalEntry[],
  currentPrice: number,
  tradingDaysAgo: number
): number {
  if (data.length === 0 || currentPrice === 0) return 0;
  const idx = Math.max(0, data.length - tradingDaysAgo);
  const pastPrice = data[idx]?.close;
  if (!pastPrice || pastPrice === 0) return 0;
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

export function usePerformanceData(
  symbols: string[],
  currentPrices: Map<string, number>
) {
  const [rawData, setRawData] = useState<Record<string, HistoricalEntry[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbolsKey = [...symbols].sort().join(",");

  // Fetch raw historical data when symbols change
  useEffect(() => {
    if (!symbols.length) {
      setRawData({});
      return;
    }

    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.allSettled(
          symbols.map(async (symbol) => {
            const res = await fetch(
              `/api/historical?symbol=${encodeURIComponent(symbol)}&range=3y`
            );
            if (!res.ok)
              throw new Error(`Failed to fetch historical for ${symbol}`);
            const json: HistoricalEntry[] = await res.json();
            return { symbol, entries: json };
          })
        );

        if (cancelled) return;

        const newRaw: Record<string, HistoricalEntry[]> = {};
        for (const result of results) {
          if (result.status === "fulfilled") {
            newRaw[result.value.symbol] = result.value.entries;
          }
        }

        setRawData(newRaw);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  // Compute sparklines and period returns reactively when rawData or prices change
  const data = useMemo<PerformanceDataMap>(() => {
    const result: PerformanceDataMap = {};

    for (const [symbol, entries] of Object.entries(rawData)) {
      const price = currentPrices.get(symbol) ?? 0;

      const sparklineSlice = entries.slice(-252);
      const sparklineData = sparklineSlice.map((e) => e.close);

      const periodReturns = {
        w1: computePeriodReturn(entries, price, 5),
        m1: computePeriodReturn(entries, price, 22),
        y1: computePeriodReturn(entries, price, 252),
        y3: computePeriodReturn(entries, price, 756),
      };

      result[symbol] = { sparklineData, periodReturns };
    }

    return result;
  }, [rawData, currentPrices]);

  return { data, loading, error };
}
