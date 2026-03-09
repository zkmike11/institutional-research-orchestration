"use client";

import { useState } from "react";
import styles from "./VixDetailModal.module.css";
import Modal from "@/components/shared/Modal";
import TimePeriodSelector from "@/components/shared/TimePeriodSelector";
import AxisChart from "@/components/shared/AxisChart";
import { useVolatilityHistory } from "@/hooks/useVolatilityHistory";
import type { VolatilityMetric } from "@/lib/types/volatility";

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "3Y"];

interface VixDetailModalProps {
  metric: VolatilityMetric | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VixDetailModal({ metric, isOpen, onClose }: VixDetailModalProps) {
  const [period, setPeriod] = useState("1Y");
  const { data, loading } = useVolatilityHistory(
    isOpen ? metric?.symbol ?? null : null,
    period
  );

  if (!metric) return null;

  const series = data && data.length > 0
    ? [{ data, color: "#f87171", label: metric.name }]
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={metric.name}>
      <div className={styles.container}>
        <TimePeriodSelector
          periods={PERIODS}
          selected={period}
          onChange={setPeriod}
        />
        <div className={styles.chartContainer}>
          {loading ? (
            <div className={styles.loading}>Loading chart data...</div>
          ) : series.length > 0 ? (
            <AxisChart series={series} width={700} height={340} strokeWidth={1.5} />
          ) : (
            <div className={styles.loading}>No data available</div>
          )}
        </div>
        {metric.description && (
          <p className={styles.description}>{metric.description}</p>
        )}
      </div>
    </Modal>
  );
}
