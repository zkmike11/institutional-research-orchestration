"use client";

import styles from "./TimePeriodSelector.module.css";

const PERIODS = ["1M", "3M", "6M", "YTD", "1Y", "3Y"];

interface TimePeriodSelectorProps {
  selected: string;
  onChange: (period: string) => void;
}

export default function TimePeriodSelector({ selected, onChange }: TimePeriodSelectorProps) {
  return (
    <div className={styles.container}>
      {PERIODS.map((p) => (
        <button
          key={p}
          className={`${styles.pill} ${p === selected ? styles.active : ""}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
