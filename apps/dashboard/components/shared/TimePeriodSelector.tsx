"use client";

import styles from "./TimePeriodSelector.module.css";

interface TimePeriodSelectorProps {
  periods: string[];
  selected: string;
  onChange: (period: string) => void;
}

export default function TimePeriodSelector({
  periods,
  selected,
  onChange,
}: TimePeriodSelectorProps) {
  return (
    <div className={styles.container}>
      {periods.map((period) => (
        <button
          key={period}
          className={`${styles.pill} ${period === selected ? styles.active : ""}`}
          onClick={() => onChange(period)}
        >
          {period}
        </button>
      ))}
    </div>
  );
}
