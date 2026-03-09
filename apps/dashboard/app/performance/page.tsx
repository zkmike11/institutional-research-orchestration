"use client";

import { useMemo } from "react";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useQuotes } from "@/hooks/useQuotes";
import { usePerformanceData } from "@/hooks/usePerformanceData";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import WatchlistTable from "@/components/performance/WatchlistTable";
import type { WatchlistRowData } from "@/components/performance/WatchlistRow";
import type { Quote } from "@/lib/types/market";
import styles from "@/components/performance/Performance.module.css";

export default function PerformancePage() {
  const { state, addBenchmark } = useWatchlist();

  // Collect all unique symbols
  const allSymbols = useMemo(() => {
    const set = new Set<string>();
    for (const b of state.benchmarks) set.add(b.symbol);
    for (const g of state.groups) {
      for (const item of g.items) set.add(item.symbol);
    }
    return Array.from(set);
  }, [state]);

  // Fetch quotes for all symbols
  const {
    data: quotes,
    loading: quotesLoading,
    error: quotesError,
  } = useQuotes(allSymbols);

  // Build a map of symbol -> current price for the performance hook
  const currentPrices = useMemo(() => {
    const map = new Map<string, number>();
    if (quotes) {
      for (const q of quotes) {
        map.set(q.symbol, q.regularMarketPrice);
      }
    }
    return map;
  }, [quotes]);

  // Fetch 3Y historical data and compute period returns
  const {
    data: perfData,
    loading: perfLoading,
    error: perfError,
  } = usePerformanceData(allSymbols, currentPrices);

  // Build a lookup map from quotes
  const quoteMap = useMemo(() => {
    const map = new Map<string, Quote>();
    if (quotes) {
      for (const q of quotes) {
        map.set(q.symbol, q);
      }
    }
    return map;
  }, [quotes]);

  // Build row data for a symbol
  function buildRowData(
    symbol: string,
    color?: string
  ): WatchlistRowData | null {
    const quote = quoteMap.get(symbol);
    const perf = perfData[symbol];

    if (!quote) return null;

    return {
      symbol: quote.symbol,
      shortName: quote.shortName || quote.symbol,
      sector: quote.sector,
      industry: quote.industry,
      price: quote.regularMarketPrice,
      marketCap: quote.marketCap,
      changePercents: {
        d1: quote.regularMarketChangePercent ?? 0,
        w1: perf?.periodReturns.w1 ?? 0,
        m1: perf?.periodReturns.m1 ?? 0,
        y1: perf?.periodReturns.y1 ?? 0,
        y3: perf?.periodReturns.y3 ?? 0,
      },
      sparklineData: perf?.sparklineData ?? [],
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      color,
    };
  }

  // Assemble benchmark rows
  const benchmarkRows = useMemo(() => {
    return state.benchmarks
      .map((b) => buildRowData(b.symbol, b.color))
      .filter((r): r is WatchlistRowData => r !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.benchmarks, quoteMap, perfData]);

  // Assemble group rows
  const groups = useMemo(() => {
    return state.groups.map((g) => ({
      name: g.name,
      rows: g.items
        .map((item) => buildRowData(item.symbol, item.color))
        .filter((r): r is WatchlistRowData => r !== null),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.groups, quoteMap, perfData]);

  const isLoading = (quotesLoading && !quotes) || (perfLoading && Object.keys(perfData).length === 0);
  const error = quotesError || perfError;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className={styles.page}>
      <WatchlistTable
        benchmarkRows={benchmarkRows}
        groups={groups}
        onAddBenchmark={addBenchmark}
      />
    </div>
  );
}
