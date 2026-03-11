"use client";

import { useState, useCallback } from "react";
import { useTimePeriod } from "@/hooks/useTimePeriod";
import { useHeatmap } from "@/hooks/useHeatmap";
import TimePeriodSelector from "@/components/shared/TimePeriodSelector";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import SectorSelector from "@/components/heatmap/SectorSelector";
import DateRangePicker from "@/components/heatmap/DateRangePicker";
import TreemapView from "@/components/heatmap/TreemapView";
import styles from "./Heatmap.module.css";

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y"];

export default function HeatmapPage() {
  const [sector, setSector] = useState("XLK");
  const { period, setPeriod } = useTimePeriod("1D");
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const { data, loading, error } = useHeatmap(
    sector,
    period,
    dateRange?.start,
    dateRange?.end
  );

  const handleDateRangeApply = useCallback((start: string, end: string) => {
    setDateRange({ start, end });
  }, []);

  const handlePeriodChange = useCallback((p: string) => {
    setDateRange(null);
    setPeriod(p);
  }, [setPeriod]);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Sector Heatmap</h1>
          <p className={styles.subtitle}>Market cap weighted treemap by sector</p>
        </div>
        <div className={styles.controls}>
          <SectorSelector selected={sector} onChange={setSector} />
          <TimePeriodSelector
            periods={PERIODS}
            selected={dateRange ? "" : period}
            onChange={handlePeriodChange}
          />
          <DateRangePicker onApply={handleDateRangeApply} />
        </div>
      </div>
      {loading && !data ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <TreemapView nodes={data ?? []} />
      )}
    </div>
  );
}
