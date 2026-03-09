"use client";

import { useState, useEffect } from "react";

export function useHistorical(symbol: string, range: string = "1y") {
  const [data, setData] = useState<{ date: string; close: number }[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/historical?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}`
        );
        if (!res.ok) throw new Error(`Failed to fetch historical: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  return { data, loading, error };
}
