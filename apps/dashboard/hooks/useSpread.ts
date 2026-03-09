"use client";

import { useState, useEffect } from "react";
import type { SpreadData } from "@/lib/types/yield-curve";

export function useSpread(pair: string, period: string) {
  const [data, setData] = useState<SpreadData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ pair, period });
        const res = await fetch(`/api/yield-curve/spread?${params}`);
        if (!res.ok)
          throw new Error(`Failed to fetch spread: ${res.status}`);
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
  }, [pair, period]);

  return { data, loading, error };
}
