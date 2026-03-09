"use client";

import styles from "./HorizontalBarRow.module.css";

interface HorizontalBarRowProps {
  name: string;
  ticker: string;
  changePercent: number;
  sigma?: number;
  maxAbsValue: number;
}

export default function HorizontalBarRow({
  name,
  ticker,
  changePercent,
  sigma,
  maxAbsValue,
}: HorizontalBarRowProps) {
  const isPositive = changePercent >= 0;
  const barWidth = maxAbsValue > 0 ? (Math.abs(changePercent) / maxAbsValue) * 100 : 0;

  return (
    <div className={styles.row}>
      <div className={styles.miniIcons}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--fg-muted)" strokeWidth="1.2" strokeLinecap="round">
          <line x1="1" y1="3" x2="11" y2="3" />
          <line x1="1" y1="6" x2="11" y2="6" />
          <line x1="1" y1="9" x2="11" y2="9" />
        </svg>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--fg-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 9 4 5 7 7 11 2" />
        </svg>
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.ticker}>{ticker}</span>
      </div>
      <div className={styles.barContainer}>
        <div className={styles.barCenter}>
          <div
            className={`${styles.bar} ${isPositive ? styles.barPositive : styles.barNegative}`}
            style={{
              width: `${barWidth}%`,
              [isPositive ? "left" : "right"]: "50%",
            }}
          />
        </div>
      </div>
      <div className={`${styles.value} ${isPositive ? styles.positive : styles.negative}`}>
        {isPositive ? "+" : ""}
        {changePercent.toFixed(2)}%
      </div>
      {sigma !== undefined && (
        <div className={styles.sigma}>
          {sigma >= 0 ? "+" : ""}
          {sigma.toFixed(1)}σ
        </div>
      )}
    </div>
  );
}
