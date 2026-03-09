"use client";

import styles from "./VolatilityRow.module.css";
import RegimeLabel from "./RegimeLabel";
import Sparkline from "@/components/shared/Sparkline";
import type { VolatilityMetric } from "@/lib/types/volatility";

interface VolatilityRowProps {
  metric: VolatilityMetric;
  onClick?: () => void;
}

export default function VolatilityRow({ metric, onClick }: VolatilityRowProps) {
  const isPositive = metric.change >= 0;
  const arrow = isPositive ? "\u25B2" : "\u25BC";
  const changeColor = isPositive ? "var(--positive)" : "var(--negative)";

  return (
    <div
      className={styles.row}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      <div className={styles.sparklineBackground}>
        <Sparkline
          data={metric.sparklineData}
          color="var(--fg-secondary)"
          width={300}
          height={36}
          strokeWidth={1}
        />
      </div>

      <div className={styles.content}>
        <span className={styles.name}>{metric.name}</span>
        <div className={styles.right}>
          <span className={styles.value}>{metric.value.toFixed(2)}</span>
          <span className={styles.change} style={{ color: changeColor }}>
            {arrow} {Math.abs(metric.change).toFixed(2)}
          </span>
          <RegimeLabel label={metric.regime.label} level={metric.regime.level} />
        </div>
      </div>
    </div>
  );
}
