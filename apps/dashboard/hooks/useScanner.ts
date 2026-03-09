"use client";

import { useState, useEffect, useCallback } from "react";
import type { ScannerCategory } from "@/lib/types/market";
import { useInterval } from "./useInterval";

export function useScanner(period: string) {
  const [data, setData] = useState<ScannerCategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/scanner?period=${encodeURIComponent(period)}`
      );
      if (!res.ok) throw new Error(`Failed to fetch scanner: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useInterval(refresh, 60_000);

  return { data, loading, error };
}
