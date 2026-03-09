"use client";

import styles from "./SpreadPairSelector.module.css";

const SPREAD_PAIRS = ["3M/10Y", "2Y/5Y", "5Y/30Y", "10Y/30Y"];

interface SpreadPairSelectorProps {
  selected: string;
  onChange: (pair: string) => void;
}

export default function SpreadPairSelector({ selected, onChange }: SpreadPairSelectorProps) {
  return (
    <div className={styles.container}>
      {SPREAD_PAIRS.map((pair) => (
        <button
          key={pair}
          className={`${styles.pill} ${pair === selected ? styles.active : ""}`}
          onClick={() => onChange(pair)}
        >
          {pair}
        </button>
      ))}
    </div>
  );
}
