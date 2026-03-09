"use client";

import { useState, useEffect, useCallback } from "react";
import type { VolatilityMetric } from "@/lib/types/volatility";
import { useInterval } from "./useInterval";

export function useVolatility() {
  const [data, setData] = useState<VolatilityMetric[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/volatility");
      if (!res.ok) throw new Error(`Failed to fetch volatility: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useInterval(refresh, 60_000);

  return { data, loading, error };
}
