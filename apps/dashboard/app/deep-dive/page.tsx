"use client";

import { useTimePeriod } from "@/hooks/useTimePeriod";
import { useDeepDive } from "@/hooks/useDeepDive";
import TimePeriodSelector from "@/components/shared/TimePeriodSelector";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import SignalChart from "@/components/deep-dive/SignalChart";
import DualLineChart from "@/components/deep-dive/DualLineChart";
import styles from "./DeepDive.module.css";

const PERIODS = ["1W", "1M", "3M", "6M", "1Y", "3Y"];

export default function DeepDivePage() {
  const { period, setPeriod } = useTimePeriod("1M");
  const { data, loading, error } = useDeepDive(period);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Deep Dive</h1>
          <p className={styles.subtitle}>Cross-asset signal charts</p>
        </div>
        <TimePeriodSelector
          periods={PERIODS}
          selected={period}
          onChange={setPeriod}
        />
      </div>
      <div className={styles.grid}>
        {data?.map((ratio, index) =>
          index === 4 ? (
            <DualLineChart
              key={ratio.name}
              name={ratio.name}
              subtitle={ratio.subtitle}
              primaryColor={ratio.color}
              secondaryColor="var(--sparkline-blue)"
              data={ratio.data}
            />
          ) : (
            <SignalChart
              key={ratio.name}
              name={ratio.name}
              subtitle={ratio.subtitle}
              color={ratio.color}
              data={ratio.data}
            />
          )
        )}
      </div>
    </div>
  );
}
