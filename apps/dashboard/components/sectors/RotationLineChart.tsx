"use client";

import type { SectorPerformance } from "@/lib/types/market";
import HorizontalBarRow from "./HorizontalBarRow";
import ViewToggle from "@/components/shared/ViewToggle";
import MultiLineChart from "@/components/shared/MultiLineChart";
import styles from "./RotationLineChart.module.css";

interface RotationLineChartProps {
  data: SectorPerformance[];
  viewMode: "bars" | "lines";
  onViewModeChange: (mode: "bars" | "lines") => void;
  period?: string;
  onPeriodChange?: (period: string) => void;
  periodOptions?: string[];
}

const ROTATION_COLORS = ["#ef4444", "#f59e0b", "#14b8a6", "#22c55e", "#d1d5db"];

export default function RotationLineChart({
  data,
  viewMode,
  onViewModeChange,
  period,
  onPeriodChange,
  periodOptions,
}: RotationLineChartProps) {
  const maxAbsValue = Math.max(...data.map((d) => Math.abs(d.changePercent)), 0.01);

  // Generate synthetic multi-point data for line chart mode
  // In production, the API would return time series data
  const lineSeries = data.map((item, i) => ({
    name: item.name,
    values: generateCumulativeSeries(item.changePercent, 20),
    color: ROTATION_COLORS[i % ROTATION_COLORS.length],
  }));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Sector Rotation</span>
        <div className={styles.headerControls}>
          {periodOptions && period && onPeriodChange && (
            <div className={styles.periodPills}>
              {periodOptions.map((p) => (
                <button
                  key={p}
                  className={`${styles.periodPill} ${p === period ? styles.periodPillActive : ""}`}
                  onClick={() => onPeriodChange(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <ViewToggle mode={viewMode} onChange={onViewModeChange} />
        </div>
      </div>
      {viewMode === "bars" ? (
        <div className={styles.rows}>
          {data.map((item) => (
            <HorizontalBarRow
              key={item.ticker}
              name={item.name}
              ticker={item.ticker}
              changePercent={item.changePercent}
              maxAbsValue={maxAbsValue}
            />
          ))}
        </div>
      ) : (
        <MultiLineChart series={lineSeries} width={480} height={240} />
      )}
    </div>
  );
}

/** Generate synthetic cumulative % series ending at targetEnd */
function generateCumulativeSeries(targetEnd: number, points: number): number[] {
  const values: number[] = [0];
  for (let i = 1; i < points; i++) {
    const progress = i / (points - 1);
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * (Math.abs(targetEnd) * 0.3);
    values.push(targetEnd * progress + noise);
  }
  // Ensure last value matches
  values[points - 1] = targetEnd;
  return values;
}
