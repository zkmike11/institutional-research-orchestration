"use client";

import { useState, useMemo, useCallback } from "react";
import styles from "./YieldCurveModal.module.css";
import Modal from "@/components/shared/Modal";
import DateControls from "./DateControls";
import YieldCurveChart from "./YieldCurveChart";
import SpreadPairSelector from "./SpreadPairSelector";
import TimePeriodSelector from "./TimePeriodSelector";
import SpreadChart from "./SpreadChart";
import { useCustomYieldCurves } from "@/hooks/useCustomYieldCurves";
import type { YieldCurveSnapshot } from "@/lib/types/yield-curve";

interface YieldCurveModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: YieldCurveSnapshot[];
}

export default function YieldCurveModal({ isOpen, onClose, snapshots }: YieldCurveModalProps) {
  const [selectedPair, setSelectedPair] = useState("3M/10Y");
  const [selectedPeriod, setSelectedPeriod] = useState("3M");
  const [comparisonDates, setComparisonDates] = useState<string[]>([]);

  const { snapshots: customSnapshots } = useCustomYieldCurves(comparisonDates);

  const allSnapshots = useMemo(
    () => [...snapshots, ...customSnapshots],
    [snapshots, customSnapshots]
  );

  const handleAddDate = useCallback((date: string) => {
    setComparisonDates((prev) => {
      if (prev.includes(date) || prev.length >= 5) return prev;
      return [...prev, date];
    });
  }, []);

  const handleRemoveDate = useCallback(() => {
    setComparisonDates((prev) => prev.slice(0, -1));
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="US Treasury Yield Curve">
      <div className={styles.container}>
        <DateControls onAdd={handleAddDate} onRemove={handleRemoveDate} />
        <div className={styles.chartSection}>
          <YieldCurveChart snapshots={allSnapshots} />
        </div>
        <div className={styles.spreadSection}>
          <div className={styles.spreadHeader}>
            <span className={styles.spreadTitle}>Spread</span>
            <div className={styles.spreadControls}>
              <SpreadPairSelector selected={selectedPair} onChange={setSelectedPair} />
              <TimePeriodSelector selected={selectedPeriod} onChange={setSelectedPeriod} />
            </div>
          </div>
          <SpreadChart pair={selectedPair} period={selectedPeriod} />
        </div>
      </div>
    </Modal>
  );
}
