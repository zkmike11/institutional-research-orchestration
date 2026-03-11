"use client";

import { useMemo, useState } from "react";
import AxisChart from "@/components/shared/AxisChart";
import TimePeriodSelector from "@/components/shared/TimePeriodSelector";
import styles from "./TvlChart.module.css";

interface TvlChartProps {
  data: { date: number; tvl: number }[];
  period?: string;
}

const PERIODS = ["30d", "90d", "1y", "All"];

function filterByPeriod(
  data: { date: number; tvl: number }[],
  period: string
): { date: number; tvl: number }[] {
  if (period === "All" || data.length === 0) return data;

  const now = Date.now() / 1000;
  const days = period === "30d" ? 30 : period === "90d" ? 90 : 365;
  const cutoff = now - days * 86400;
  return data.filter((d) => d.date >= cutoff);
}

export default function TvlChart({ data }: TvlChartProps) {
  const [period, setPeriod] = useState("1y");

  const filtered = useMemo(() => filterByPeriod(data, period), [data, period]);

  const series = useMemo(() => {
    if (filtered.length === 0) return [];
    return [
      {
        data: filtered.map((d) => ({
          time: new Date(d.date * 1000).toISOString().slice(0, 10),
          value: d.tvl,
        })),
        color: "var(--accent)",
        label: "TVL",
      },
    ];
  }, [filtered]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Total Value Locked</span>
        <TimePeriodSelector
          periods={PERIODS}
          selected={period}
          onChange={setPeriod}
        />
      </div>
      {series.length === 0 || series[0].data.length === 0 ? (
        <div className={styles.empty}>No TVL history available</div>
      ) : (
        <AxisChart series={series} width={720} height={260} />
      )}
    </div>
  );
}
