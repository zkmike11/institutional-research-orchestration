"use client";

import { useState, useEffect, useCallback } from "react";
import type { CryptoMarketData } from "@/lib/types/crypto";
import { useInterval } from "./useInterval";

const EMPTY: CryptoMarketData = {
  totalMarketCap: 0,
  btcDominance: 0,
  ethBtcRatio: 0,
  stablecoinMarketCap: 0,
  topCoins: [],
};

export function useCryptoMarket() {
  const [data, setData] = useState<CryptoMarketData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crypto/market");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
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

  useInterval(refresh, 300_000);

  return { data, loading, error, refresh };
}
