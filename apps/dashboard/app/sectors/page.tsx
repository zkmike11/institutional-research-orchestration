"use client";

import { useState } from "react";
import { useSectors } from "@/hooks/useSectors";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import QuadrantGrid from "@/components/sectors/QuadrantGrid";
import HorizontalBarPanel from "@/components/sectors/HorizontalBarPanel";
import RotationLineChart from "@/components/sectors/RotationLineChart";
import styles from "./Sectors.module.css";

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y"];

const OUTRIGHT_OPTIONS = [
  { label: "OUTRIGHT", value: "outright" },
  { label: "VS SPY", value: "vs_spy" },
];

const FACTOR_OPTIONS = [
  { label: "VS SPY", value: "vs_spy" },
  { label: "OUTRIGHT", value: "outright" },
];

export default function SectorsPage() {
  // Per-panel state
  const [sectorsMode, setSectorsMode] = useState("outright");
  const [sectorsPeriod, setSectorsPeriod] = useState("1D");
  const [sectorsView, setSectorsView] = useState<"bars" | "lines">("bars");

  const [indMode, setIndMode] = useState("outright");
  const [indPeriod, setIndPeriod] = useState("1D");
  const [indView, setIndView] = useState<"bars" | "lines">("bars");

  const [factorsPeriod, setFactorsPeriod] = useState("1D");
  const [factorsView, setFactorsView] = useState<"bars" | "lines">("bars");

  const [rotPeriod, setRotPeriod] = useState("1D");
  const [rotView, setRotView] = useState<"bars" | "lines">("bars");

  const sectors = useSectors("sectors", sectorsMode, sectorsPeriod);
  const industries = useSectors("industries", indMode, indPeriod);
  const factors = useSectors("factors", "vs_spy", factorsPeriod);
  const rotation = useSectors("rotation", "outright", rotPeriod);

  const isLoading =
    (sectors.loading && !sectors.data) ||
    (industries.loading && !industries.data);
  const hasError = sectors.error || industries.error;

  if (isLoading) return <LoadingState />;
  if (hasError) return <ErrorState message={hasError} />;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Sectors & Rotation</h1>
          <p className={styles.subtitle}>Sector, industry, and factor performance</p>
        </div>
      </div>
      <QuadrantGrid>
        <HorizontalBarPanel
          title="Sectors"
          data={sectors.data ?? []}
          modeOptions={OUTRIGHT_OPTIONS}
          mode={sectorsMode}
          onModeChange={setSectorsMode}
          periodOptions={PERIODS}
          period={sectorsPeriod}
          onPeriodChange={setSectorsPeriod}
          viewMode={sectorsView}
          onViewModeChange={setSectorsView}
        />
        <HorizontalBarPanel
          title="Industries"
          data={industries.data ?? []}
          modeOptions={OUTRIGHT_OPTIONS}
          mode={indMode}
          onModeChange={setIndMode}
          periodOptions={PERIODS}
          period={indPeriod}
          onPeriodChange={setIndPeriod}
          viewMode={indView}
          onViewModeChange={setIndView}
        />
        <HorizontalBarPanel
          title="Factor Rotation"
          data={factors.data ?? []}
          modeOptions={FACTOR_OPTIONS}
          mode="vs_spy"
          onModeChange={() => {}}
          periodOptions={PERIODS}
          period={factorsPeriod}
          onPeriodChange={setFactorsPeriod}
          viewMode={factorsView}
          onViewModeChange={setFactorsView}
        />
        <RotationLineChart
          data={rotation.data ?? []}
          viewMode={rotView}
          onViewModeChange={setRotView}
          periodOptions={PERIODS}
          period={rotPeriod}
          onPeriodChange={setRotPeriod}
        />
      </QuadrantGrid>
    </div>
  );
}
