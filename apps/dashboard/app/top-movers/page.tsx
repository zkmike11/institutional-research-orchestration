"use client";

import { useState } from "react";
import { useTimePeriod } from "@/hooks/useTimePeriod";
import { useTopMovers } from "@/hooks/useTopMovers";
import { useSectors } from "@/hooks/useSectors";
import TimePeriodSelector from "@/components/shared/TimePeriodSelector";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import IndexFilter from "@/components/top-movers/IndexFilter";
import GainersLosersPanel from "@/components/top-movers/GainersLosersPanel";
import HorizontalBarPanel from "@/components/sectors/HorizontalBarPanel";
import styles from "./TopMovers.module.css";

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y"];

export default function TopMoversPage() {
  const [index, setIndex] = useState("ndx");
  const { period, setPeriod } = useTimePeriod("1D");
  const { gainers, losers, loading, error } = useTopMovers(index, period);

  // Embedded sector/industry panels (matches Dean's reference)
  const sectors = useSectors("sectors", "outright", period);
  const industries = useSectors("industries", "outright", period);

  if (loading && !gainers) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Top Movers</h1>
        </div>
        <div className={styles.controls}>
          <IndexFilter selected={index} onChange={setIndex} />
          <TimePeriodSelector
            periods={PERIODS}
            selected={period}
            onChange={setPeriod}
          />
        </div>
      </div>
      <GainersLosersPanel
        gainers={gainers ?? []}
        losers={losers ?? []}
      />
      <div className={styles.sectorPanels}>
        <HorizontalBarPanel
          title="Equity Sectors"
          data={sectors.data ?? []}
        />
        <HorizontalBarPanel
          title="Industry Groups"
          data={industries.data ?? []}
        />
      </div>
    </div>
  );
}
