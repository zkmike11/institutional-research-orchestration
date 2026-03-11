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

const MODE_OPTIONS = [
  { label: "OUTRIGHT", value: "outright" },
  { label: "VS SPY", value: "vs_spy" },
];

const EMBEDDED_PERIODS = ["1D", "1W", "1M", "3M", "6M", "1Y"];

export default function TopMoversPage() {
  const [index, setIndex] = useState("ndx");
  const { period, setPeriod } = useTimePeriod("1D");
  const { gainers, losers, loading, error } = useTopMovers(index, period);

  // Per-panel state for embedded sector/industry panels
  const [sectorsMode, setSectorsMode] = useState("outright");
  const [sectorsPeriod, setSectorsPeriod] = useState("1D");
  const [sectorsView, setSectorsView] = useState<"bars" | "lines">("bars");

  const [indMode, setIndMode] = useState("outright");
  const [indPeriod, setIndPeriod] = useState("1D");
  const [indView, setIndView] = useState<"bars" | "lines">("bars");

  const sectors = useSectors("sectors", sectorsMode, sectorsPeriod);
  const industries = useSectors("industries", indMode, indPeriod);

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
        {sectors.loading && !sectors.data ? (
          <div className={styles.sectorCard}><LoadingState /></div>
        ) : sectors.error ? (
          <div className={styles.sectorCard}><ErrorState message={sectors.error} /></div>
        ) : (
          <HorizontalBarPanel
            title="Equity Sectors"
            data={sectors.data ?? []}
            modeOptions={MODE_OPTIONS}
            mode={sectorsMode}
            onModeChange={setSectorsMode}
            periodOptions={EMBEDDED_PERIODS}
            period={sectorsPeriod}
            onPeriodChange={setSectorsPeriod}
            viewMode={sectorsView}
            onViewModeChange={setSectorsView}
          />
        )}
        {industries.loading && !industries.data ? (
          <div className={styles.sectorCard}><LoadingState /></div>
        ) : industries.error ? (
          <div className={styles.sectorCard}><ErrorState message={industries.error} /></div>
        ) : (
          <HorizontalBarPanel
            title="Industry Groups"
            data={industries.data ?? []}
            modeOptions={MODE_OPTIONS}
            mode={indMode}
            onModeChange={setIndMode}
            periodOptions={EMBEDDED_PERIODS}
            period={indPeriod}
            onPeriodChange={setIndPeriod}
            viewMode={indView}
            onViewModeChange={setIndView}
          />
        )}
      </div>
    </div>
  );
}
