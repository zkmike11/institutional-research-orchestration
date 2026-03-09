"use client";

import styles from "./TreemapCell.module.css";

interface TreemapCellProps {
  symbol: string;
  name: string;
  changePercent: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function TreemapCell({
  symbol,
  changePercent,
  x,
  y,
  width,
  height,
}: TreemapCellProps) {
  const isPositive = changePercent >= 0;
  const intensity = Math.min(Math.abs(changePercent) / 5, 1);

  const bgColor = isPositive
    ? `rgba(34, 197, 94, ${0.15 + intensity * 0.55})`
    : `rgba(239, 68, 68, ${0.15 + intensity * 0.55})`;

  const showLabel = width > 40 && height > 30;
  const showPercent = width > 50 && height > 45;

  return (
    <div
      className={styles.cell}
      style={{
        left: x,
        top: y,
        width,
        height,
        backgroundColor: bgColor,
      }}
      title={`${symbol}: ${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`}
    >
      {showLabel && <span className={styles.symbol}>{symbol}</span>}
      {showPercent && (
        <span className={styles.percent}>
          {changePercent >= 0 ? "+" : ""}
          {changePercent.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
