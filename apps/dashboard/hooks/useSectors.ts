"use client";

import { useState, useEffect } from "react";
import type { SectorPerformance } from "@/lib/types/market";

export function useSectors(type: string, mode: string, period: string) {
  const [data, setData] = useState<SectorPerformance[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/sectors?type=${encodeURIComponent(type)}&mode=${encodeURIComponent(mode)}&period=${encodeURIComponent(period)}`
        );
        if (!res.ok) throw new Error(`Failed to fetch sectors: ${res.status}`);
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
  }, [type, mode, period]);

  return { data, loading, error };
}
