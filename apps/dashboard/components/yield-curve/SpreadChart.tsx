"use client";

import { useSpread } from "@/hooks/useSpread";
import AxisChart from "@/components/shared/AxisChart";
import styles from "./SpreadChart.module.css";

interface SpreadChartProps {
  pair: string;
  period: string;
}

export default function SpreadChart({ pair, period }: SpreadChartProps) {
  const { data, loading } = useSpread(pair, period);

  if (loading || !data) {
    return (
      <div className={styles.card}>
        <div className={styles.placeholder}>
          <p className={styles.message}>Loading spread data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.placeholder}>
          <p className={styles.message}>No spread data available.</p>
        </div>
      </div>
    );
  }

  const latestSpread = data[data.length - 1].spread;
  const series = [
    {
      data: data.map((d) => ({ time: d.date, value: d.spread })),
      color: "#22c55e",
      label: `${latestSpread} bps`,
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.chartWrap}>
        <AxisChart series={series} width={700} height={200} strokeWidth={1.5} />
      </div>
      <div className={styles.currentSpread} style={{ color: "#22c55e" }}>
        {latestSpread} bps
      </div>
    </div>
  );
}
