"use client";

import { useState } from "react";
import { useVolatility } from "@/hooks/useVolatility";
import { useYieldCurve } from "@/hooks/useYieldCurve";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import VolatilityPanel from "@/components/volatility/VolatilityPanel";
import VixDetailModal from "@/components/volatility/VixDetailModal";
import YieldCurveChart from "@/components/yield-curve/YieldCurveChart";
import YieldCurveModal from "@/components/yield-curve/YieldCurveModal";
import type { VolatilityMetric } from "@/lib/types/volatility";
import styles from "./Volatility.module.css";

export default function VolatilityPage() {
  const volatility = useVolatility();
  const yieldCurve = useYieldCurve();

  const [selectedMetric, setSelectedMetric] = useState<VolatilityMetric | null>(null);
  const [showVixModal, setShowVixModal] = useState(false);
  const [showYieldModal, setShowYieldModal] = useState(false);
  const [volPeriod, setVolPeriod] = useState("1M");

  const isLoading =
    (volatility.loading && !volatility.data) ||
    (yieldCurve.loading && !yieldCurve.data);
  const hasError = volatility.error || yieldCurve.error;

  if (isLoading) return <LoadingState />;
  if (hasError) return <ErrorState message={hasError ?? undefined} />;

  function handleRowClick(metric: VolatilityMetric) {
    setSelectedMetric(metric);
    setShowVixModal(true);
  }

  function handleCloseVixModal() {
    setShowVixModal(false);
    setSelectedMetric(null);
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Volatility & Yield Curve</h1>
          <p className={styles.subtitle}>Volatility regimes, VIX metrics, and yield curve analysis</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftPanel}>
          <VolatilityPanel
            metrics={volatility.data ?? []}
            onRowClick={handleRowClick}
            period={volPeriod}
            onPeriodChange={setVolPeriod}
          />
        </div>

        <div className={styles.rightPanel}>
          <div
            className={styles.yieldCard}
            onClick={() => setShowYieldModal(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setShowYieldModal(true);
            }}
          >
            <div className={styles.yieldHeader}>Yield Curve</div>
            <YieldCurveChart snapshots={yieldCurve.data ?? []} />
          </div>
        </div>
      </div>

      <VixDetailModal
        metric={selectedMetric}
        isOpen={showVixModal}
        onClose={handleCloseVixModal}
      />

      <YieldCurveModal
        isOpen={showYieldModal}
        onClose={() => setShowYieldModal(false)}
        snapshots={yieldCurve.data ?? []}
      />
    </div>
  );
}
