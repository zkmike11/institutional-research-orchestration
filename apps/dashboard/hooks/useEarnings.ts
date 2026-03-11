"use client";

import { useState, useEffect } from "react";

export interface EarningsEntry {
  symbol: string;
  name: string;
  earningsDate: string | null;
  epsEstimate: number | null;
  revenueEstimate: number | null;
  marketCap: number;
}

export function useEarnings() {
  const [data, setData] = useState<EarningsEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/earnings");
        if (!res.ok) throw new Error(`Failed to fetch earnings: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
