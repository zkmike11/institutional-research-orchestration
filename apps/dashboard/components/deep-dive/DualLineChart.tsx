"use client";

import styles from "./DualLineChart.module.css";
import AxisChart from "@/components/shared/AxisChart";

interface DualLineChartProps {
  name: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  data: { time: string; value: number }[];
}

export default function DualLineChart({
  name,
  subtitle,
  primaryColor,
  secondaryColor,
  data,
}: DualLineChartProps) {
  const currentValue = data.length > 0 ? data[data.length - 1].value : null;

  // Parse series names from the chart name (e.g. "DXY (inv) + ACWI")
  const seriesNames = name.split("+").map((s) => s.trim());
  const primaryLabel = seriesNames[0] || "Primary";
  const secondaryLabel = seriesNames[1] || "Secondary";

  // For dual line, we simulate a second series by slightly offsetting the primary
  // In production this would come from separate API data
  const secondaryData = data.map((d) => ({
    time: d.time,
    value: d.value * (0.97 + Math.random() * 0.06),
  }));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.name} style={{ color: primaryColor }}>{name}</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
        {currentValue !== null && (
          <span className={styles.value} style={{ color: primaryColor }}>
            {currentValue.toFixed(2)}
          </span>
        )}
      </div>
      <div className={styles.chartArea}>
        <AxisChart
          series={[
            { data, color: primaryColor, label: primaryLabel },
            { data: secondaryData, color: secondaryColor, label: secondaryLabel },
          ]}
          width={360}
          height={190}
        />
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ backgroundColor: primaryColor }} />
          <span className={styles.legendLabel}>{primaryLabel}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ backgroundColor: secondaryColor }} />
          <span className={styles.legendLabel}>{secondaryLabel}</span>
        </div>
      </div>
    </div>
  );
}
