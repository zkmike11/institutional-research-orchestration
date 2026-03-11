"use client";

import { useState, useEffect, useCallback } from "react";
import type { CryptoMeta } from "@/lib/types/crypto";
import { useInterval } from "./useInterval";

export function useCryptoMeta(coingeckoIds: string[]) {
  const [data, setData] = useState<CryptoMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idsKey = coingeckoIds.join(",");

  const refresh = useCallback(async () => {
    if (!idsKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/crypto/quotes?ids=${encodeURIComponent(idsKey)}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [idsKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useInterval(refresh, 120_000);

  return { data, loading, error, refresh };
}
