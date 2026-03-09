"use client";

import { useState, useEffect } from "react";
import type { RatioChartData } from "@/lib/types/market";

export function useDeepDive(period: string) {
  const [data, setData] = useState<RatioChartData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/deep-dive?period=${encodeURIComponent(period)}`
        );
        if (!res.ok)
          throw new Error(`Failed to fetch deep dive: ${res.status}`);
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
  }, [period]);

  return { data, loading, error };
}
