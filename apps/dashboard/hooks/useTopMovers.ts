"use client";

import { useState, useEffect } from "react";
import type { TopMover } from "@/lib/types/market";

export function useTopMovers(index: string, period: string) {
  const [gainers, setGainers] = useState<TopMover[] | null>(null);
  const [losers, setLosers] = useState<TopMover[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/top-movers?index=${encodeURIComponent(index)}&period=${encodeURIComponent(period)}`
        );
        if (!res.ok)
          throw new Error(`Failed to fetch top movers: ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setGainers(json.gainers);
          setLosers(json.losers);
        }
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
  }, [index, period]);

  return { gainers, losers, loading, error };
}
