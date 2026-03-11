"use client";

import { useMemo } from "react";
import AxisChart from "@/components/shared/AxisChart";
import styles from "./FeeRevenueChart.module.css";

interface FeeRevenueChartProps {
  data: { date: number; fees: number; revenue: number }[];
}

export default function FeeRevenueChart({ data }: FeeRevenueChartProps) {
  const series = useMemo(() => {
    if (data.length === 0) return [];

    const timeLabels = data.map((d) =>
      new Date(d.date * 1000).toISOString().slice(0, 10)
    );

    return [
      {
        data: data.map((d, i) => ({
          time: timeLabels[i],
          value: d.fees,
        })),
        color: "var(--accent)",
        label: "Fees",
      },
      {
        data: data.map((d, i) => ({
          time: timeLabels[i],
          value: d.revenue,
        })),
        color: "var(--positive)",
        label: "Revenue",
      },
    ];
  }, [data]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Fees & Revenue</span>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: "var(--accent)" }}
            />
            Fees
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ backgroundColor: "var(--positive)" }}
            />
            Revenue
          </div>
        </div>
      </div>
      {series.length === 0 ? (
        <div className={styles.empty}>No fee/revenue history available</div>
      ) : (
        <AxisChart series={series} width={720} height={260} />
      )}
    </div>
  );
}
