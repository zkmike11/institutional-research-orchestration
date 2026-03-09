"use client";

import { useTimePeriod } from "@/hooks/useTimePeriod";
import { useScanner } from "@/hooks/useScanner";
import TimePeriodSelector from "@/components/shared/TimePeriodSelector";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import ScannerCard from "@/components/scanner/ScannerCard";
import styles from "@/components/scanner/Scanner.module.css";

const PERIODS = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y"];

const LEFT_CATEGORIES = ["EQUITIES", "CURRENCIES", "CREDIT"];
const RIGHT_CATEGORIES = ["RATES", "COMMODITIES", "GLOBAL ANCHORS"];

export default function ScannerPage() {
  const { period, setPeriod } = useTimePeriod("1D");
  const { data, loading, error } = useScanner(period);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const categoryMap = new Map(data?.map((cat) => [cat.name, cat]));

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>The Scanner</h1>
          <p className={styles.subtitle}>Cross-asset daily pulse</p>
        </div>
        <TimePeriodSelector
          periods={PERIODS}
          selected={period}
          onChange={setPeriod}
        />
      </div>
      <div className={styles.grid}>
        <div className={styles.column}>
          {LEFT_CATEGORIES.map((name) => {
            const cat = categoryMap.get(name);
            if (!cat) return null;
            return (
              <ScannerCard
                key={cat.name}
                name={cat.name}
                color={cat.color}
                assets={cat.assets}
              />
            );
          })}
        </div>
        <div className={styles.column}>
          {RIGHT_CATEGORIES.map((name) => {
            const cat = categoryMap.get(name);
            if (!cat) return null;
            return (
              <ScannerCard
                key={cat.name}
                name={cat.name}
                color={cat.color}
                assets={cat.assets}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
