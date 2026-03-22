"use client";

import { useMemo } from "react";
import type { SectorPerformance } from "@/lib/types/market";
import HorizontalBarRow from "./HorizontalBarRow";
import MultiLineChart from "@/components/shared/MultiLineChart";
import ViewToggle from "@/components/shared/ViewToggle";
import DropdownSelect from "@/components/shared/DropdownSelect";
import styles from "./HorizontalBarPanel.module.css";

const BAR_PANEL_COLORS = ["#ef4444", "#f59e0b", "#14b8a6", "#22c55e", "#d1d5db"];

interface HorizontalBarPanelProps {
  title: string;
  data: SectorPerformance[];
  viewMode?: "bars" | "lines";
  onViewModeChange?: (mode: "bars" | "lines") => void;
  mode?: string;
  onModeChange?: (mode: string) => void;
  modeOptions?: { label: string; value: string }[];
  period?: string;
  onPeriodChange?: (period: string) => void;
  periodOptions?: string[];
}

export default function HorizontalBarPanel({
  title,
  data,
  viewMode,
  onViewModeChange,
  mode,
  onModeChange,
  modeOptions,
  period,
  onPeriodChange,
  periodOptions,
}: HorizontalBarPanelProps) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.changePercent - a.changePercent),
    [data]
  );

  const maxAbsValue = useMemo(
    () => Math.max(...data.map((d) => Math.abs(d.changePercent)), 0.01),
    [data]
  );

  const hasControls = modeOptions || periodOptions || (viewMode && onViewModeChange);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>{title}</span>
        {hasControls && (
          <div className={styles.headerControls}>
            {modeOptions && mode !== undefined && onModeChange && (
              <DropdownSelect
                options={modeOptions}
                value={mode}
                onChange={onModeChange}
              />
            )}
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
            {viewMode && onViewModeChange && (
              <ViewToggle mode={viewMode} onChange={onViewModeChange} />
            )}
          </div>
        )}
      </div>
      <div className={styles.rows}>
        {viewMode === "lines" ? (
          <MultiLineChart
            series={sorted.map((item, i) => ({
              name: item.name,
              values: generateCumulativeSeries(item.changePercent, 20),
              color: BAR_PANEL_COLORS[i % BAR_PANEL_COLORS.length],
            }))}
            width={480}
            height={240}
          />
        ) : (
          sorted.map((item) => (
            <HorizontalBarRow
              key={item.ticker}
              name={item.name}
              ticker={item.ticker}
              changePercent={item.changePercent}
              sigma={item.sigma}
              maxAbsValue={maxAbsValue}
            />
          ))
        )}
      </div>
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
