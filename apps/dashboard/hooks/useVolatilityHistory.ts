"use client";

import { useState, useEffect } from "react";

interface HistoryPoint {
  time: string;
  value: number;
}

export function useVolatilityHistory(symbol: string | null, period: string) {
  const [data, setData] = useState<HistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ symbol, period });
        const res = await fetch(`/api/volatility/history?${params}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [symbol, period]);

  return { data, loading };
}
