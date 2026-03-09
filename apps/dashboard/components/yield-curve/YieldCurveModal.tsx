"use client";

import { useState } from "react";
import styles from "./YieldCurveModal.module.css";
import Modal from "@/components/shared/Modal";
import DateControls from "./DateControls";
import YieldCurveChart from "./YieldCurveChart";
import SpreadPairSelector from "./SpreadPairSelector";
import TimePeriodSelector from "./TimePeriodSelector";
import SpreadChart from "./SpreadChart";
import type { YieldCurveSnapshot } from "@/lib/types/yield-curve";

interface YieldCurveModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: YieldCurveSnapshot[];
}

export default function YieldCurveModal({ isOpen, onClose, snapshots }: YieldCurveModalProps) {
  const [selectedPair, setSelectedPair] = useState("3M/10Y");
  const [selectedPeriod, setSelectedPeriod] = useState("3M");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="US Treasury Yield Curve">
      <div className={styles.container}>
        <DateControls />
        <div className={styles.chartSection}>
          <YieldCurveChart snapshots={snapshots} />
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
