"use client";

import styles from "./VolatilityPanel.module.css";
import VolatilityRow from "./VolatilityRow";
import type { VolatilityMetric } from "@/lib/types/volatility";

interface VolatilityPanelProps {
  metrics: VolatilityMetric[];
  onRowClick: (metric: VolatilityMetric) => void;
  period?: string;
  onPeriodChange?: (period: string) => void;
}

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y"];

export default function VolatilityPanel({
  metrics,
  onRowClick,
  period,
  onPeriodChange,
}: VolatilityPanelProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Volatility</span>
        {period && onPeriodChange && (
          <select
            className={styles.periodSelect}
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
          >
            {PERIODS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}
      </div>
      <div className={styles.rows}>
        {metrics.map((metric) => (
          <VolatilityRow
            key={metric.symbol}
            metric={metric}
            onClick={() => onRowClick(metric)}
          />
        ))}
      </div>
    </div>
  );
}
