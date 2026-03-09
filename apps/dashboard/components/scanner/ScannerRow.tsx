"use client";

import Sparkline from "@/components/shared/Sparkline";
import PercentBadge from "@/components/shared/PercentBadge";
import styles from "./ScannerRow.module.css";

interface ScannerRowProps {
  name: string;
  ticker: string;
  price: number;
  changePercent: number;
  sparklineData: number[];
  color?: string;
}

export default function ScannerRow({
  name,
  ticker,
  price,
  changePercent,
  sparklineData,
  color,
}: ScannerRowProps) {
  const sparklineColor =
    color ?? (changePercent >= 0 ? "var(--sparkline-green)" : "var(--sparkline-red)");

  const formattedPrice = price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.ticker}>{ticker}</span>
      </div>
      <div className={styles.sparkline}>
        <Sparkline
          data={sparklineData}
          color={sparklineColor}
          width={120}
          height={30}
          strokeWidth={1.5}
        />
      </div>
      <div className={styles.price}>{formattedPrice}</div>
      <div className={styles.badge}>
        <PercentBadge value={changePercent} size="sm" />
      </div>
    </div>
  );
}
