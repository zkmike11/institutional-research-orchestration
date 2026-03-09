"use client";

import { useState, useEffect, useCallback } from "react";
import type { Quote } from "@/lib/types/market";
import { useInterval } from "./useInterval";

export function useQuotes(symbols: string[]) {
  const [data, setData] = useState<Quote[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joined = symbols.join(",");

  const refresh = useCallback(async () => {
    if (!joined) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(joined)}`);
      if (!res.ok) throw new Error(`Failed to fetch quotes: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [joined]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useInterval(refresh, 60_000);

  return { data, loading, error, refresh };
}
