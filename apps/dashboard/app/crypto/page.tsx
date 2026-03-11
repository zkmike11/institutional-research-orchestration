"use client";

import { useMemo } from "react";
import { useQuotes } from "@/hooks/useQuotes";
import { useCryptoPerformance } from "@/hooks/useCryptoPerformance";
import { useCryptoMeta } from "@/hooks/useCryptoMeta";
import {
  CRYPTO_WATCHLIST,
  ALL_CRYPTO_SYMBOLS,
  ALL_COINGECKO_IDS,
  COINGECKO_ID_MAP,
} from "@/lib/constants/crypto";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import CryptoPerformanceTable from "@/components/crypto/CryptoPerformanceTable";
import type { CryptoRowData } from "@/components/crypto/CryptoRow";
import type { CryptoMeta } from "@/lib/types/crypto";
import styles from "./Crypto.module.css";

export default function CryptoPage() {
  // 1. Fetch live prices from Yahoo via batch quotes
  const {
    data: quotes,
    loading: quotesLoading,
    error: quotesError,
  } = useQuotes(ALL_CRYPTO_SYMBOLS);

  // Build price map for the performance hook
  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    if (quotes) {
      for (const q of quotes) {
        map.set(q.symbol, q.regularMarketPrice);
      }
    }
    return map;
  }, [quotes]);

  // 2. Fetch sparklines + period returns (1Y historical from Yahoo)
  const {
    data: perfData,
    loading: perfLoading,
    error: perfError,
  } = useCryptoPerformance(ALL_CRYPTO_SYMBOLS, priceMap);

  // 3. Fetch FDV, ATH, volume, logos from CoinGecko
  const {
    data: metaList,
    loading: metaLoading,
    error: metaError,
  } = useCryptoMeta(ALL_COINGECKO_IDS);

  // Build a lookup: coingeckoId -> CryptoMeta
  const metaMap = useMemo(() => {
    const map = new Map<string, CryptoMeta>();
    for (const m of metaList) {
      map.set(m.id, m);
    }
    return map;
  }, [metaList]);

  // Build a lookup: yahooSymbol -> quote
  const quoteMap = useMemo(() => {
    const map = new Map<string, (typeof quotes extends (infer T)[] | null ? T : never)>();
    if (quotes) {
      for (const q of quotes) {
        map.set(q.symbol, q);
      }
    }
    return map;
  }, [quotes]);

  // 4. Merge all data into grouped CryptoRowData[]
  const groups = useMemo(() => {
    return Object.values(CRYPTO_WATCHLIST).map((group) => ({
      name: group.name,
      rows: group.assets
        .map((asset): CryptoRowData | null => {
          const quote = quoteMap.get(asset.symbol);
          const cgId = COINGECKO_ID_MAP[asset.symbol];
          const meta = cgId ? metaMap.get(cgId) : undefined;
          const perf = perfData[asset.symbol];

          // Need at least a price to display the row
          const price = quote?.regularMarketPrice ?? meta?.currentPrice ?? 0;
          if (price === 0) return null;

          // Extract display symbol: "BTC-USD" -> "BTC"
          const displaySymbol = asset.symbol.replace(/-USD$/, "");

          return {
            symbol: asset.symbol,
            displaySymbol,
            name: asset.name,
            image: meta?.image ?? "",
            price,
            marketCap: meta?.marketCap ?? quote?.marketCap ?? 0,
            fdv: meta?.fullyDilutedValuation ?? null,
            volume24h: meta?.totalVolume ?? 0,
            athChangePercent: meta?.athChangePercentage ?? 0,
            changePercents: {
              d1: quote?.regularMarketChangePercent ?? meta?.priceChangePercentage24h ?? 0,
              w1: perf?.periodReturns.w1 ?? 0,
              m1: perf?.periodReturns.m1 ?? 0,
              y1: perf?.periodReturns.y1 ?? 0,
            },
            sparklineData: perf?.sparklineData ?? [],
          };
        })
        .filter((r): r is CryptoRowData => r !== null),
    }));
  }, [quoteMap, metaMap, perfData]);

  // Loading & error states
  const isLoading =
    (quotesLoading && !quotes) ||
    (perfLoading && Object.keys(perfData).length === 0) ||
    (metaLoading && metaList.length === 0);
  const error = quotesError || perfError || metaError;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Crypto</h1>
        <p className={styles.subtitle}>Token watchlist &amp; performance</p>
      </header>
      <div className={styles.card}>
        <CryptoPerformanceTable groups={groups} />
      </div>
    </div>
  );
}
