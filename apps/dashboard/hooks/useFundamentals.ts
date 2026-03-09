"use client";

import { useState, useEffect } from "react";

export interface FundamentalData {
  symbol: string;
  shortName: string;
  sector: string;
  pe: number | null;
  forwardPe: number | null;
  ps: number | null;
  eps: number | null;
  revenue: number | null;
  grossMargin: number | null;
  netMargin: number | null;
  dividendYield: number | null;
}

export function useFundamentals(symbols: string[]) {
  const [data, setData] = useState<FundamentalData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joined = symbols.join(",");

  useEffect(() => {
    if (!joined) {
      setData(null);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/fundamentals?symbols=${encodeURIComponent(joined)}`
        );
        if (!res.ok)
          throw new Error(`Failed to fetch fundamentals: ${res.status}`);
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
  }, [joined]);

  return { data, loading, error };
}
