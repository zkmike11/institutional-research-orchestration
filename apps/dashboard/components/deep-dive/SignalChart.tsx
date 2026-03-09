"use client";

import styles from "./SignalChart.module.css";
import AxisChart from "@/components/shared/AxisChart";

interface SignalChartProps {
  name: string;
  subtitle: string;
  color: string;
  data: { time: string; value: number }[];
}

export default function SignalChart({ name, subtitle, color, data }: SignalChartProps) {
  const currentValue = data.length > 0 ? data[data.length - 1].value : null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.name} style={{ color }}>{name}</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
        {currentValue !== null && (
          <span className={styles.value}>
            {currentValue.toFixed(2)}
          </span>
        )}
      </div>
      <div className={styles.chartArea}>
        <AxisChart
          series={[{ data, color }]}
          width={360}
          height={190}
        />
      </div>
    </div>
  );
}
