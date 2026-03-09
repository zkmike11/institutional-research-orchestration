"use client";

import { useMemo } from "react";
import type { SectorPerformance } from "@/lib/types/market";
import HorizontalBarRow from "./HorizontalBarRow";
import ViewToggle from "@/components/shared/ViewToggle";
import DropdownSelect from "@/components/shared/DropdownSelect";
import styles from "./HorizontalBarPanel.module.css";

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
        {sorted.map((item) => (
          <HorizontalBarRow
            key={item.ticker}
            name={item.name}
            ticker={item.ticker}
            changePercent={item.changePercent}
            sigma={item.sigma}
            maxAbsValue={maxAbsValue}
          />
        ))}
      </div>
    </div>
  );
}
