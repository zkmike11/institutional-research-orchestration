"use client";

import { useState, useEffect } from "react";
import { useDefiOverview } from "@/hooks/useDefiOverview";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import TvlByChainPanel from "@/components/defi/TvlByChainPanel";
import FeeLeaderboard from "@/components/defi/FeeLeaderboard";
import TvlLeaderboard from "@/components/defi/TvlLeaderboard";
import YieldTable from "@/components/defi/YieldTable";
import type { YieldPool } from "@/lib/types/crypto";
import styles from "./Defi.module.css";

export default function DefiPage() {
  const { data, loading, error } = useDefiOverview();
  const [yields, setYields] = useState<YieldPool[]>([]);
  const [yieldsLoading, setYieldsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchYields() {
      setYieldsLoading(true);
      try {
        const res = await fetch("/api/crypto/yields");
        if (!res.ok) throw new Error(`Yields fetch failed: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setYields(json);
      } catch {
        // yields are non-critical, silently fail
      } finally {
        if (!cancelled) setYieldsLoading(false);
      }
    }
    fetchYields();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLoading = (loading && !data.chains.length) || yieldsLoading;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>DeFi</h1>
          <p className={styles.subtitle}>Protocol ecosystem overview</p>
        </div>
      </div>
      <div className={styles.grid}>
        <TvlByChainPanel chains={data.chains} />
        <FeeLeaderboard protocols={data.feeLeaders} />
        <TvlLeaderboard protocols={data.tvlLeaders} />
        <YieldTable pools={yields} />
      </div>
    </div>
  );
}
