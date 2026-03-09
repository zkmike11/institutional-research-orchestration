"use client";

import styles from "./MoverRow.module.css";
import { formatPrice } from "@/lib/format";

interface MoverRowProps {
  symbol?: string;
  shortName?: string;
  sector?: string;
  industry?: string;
  price?: number;
  changePercent?: number;
  z20?: number;
  z200?: number;
  showZScores?: boolean;
}

export default function MoverRow({
  symbol,
  shortName,
  sector,
  industry,
  price,
  changePercent,
  z20,
  z200,
  showZScores,
}: MoverRowProps) {
  const isPositive = (changePercent ?? 0) >= 0;
  const subtitle = [sector, industry].filter(Boolean).join(" · ");

  return (
    <div className={styles.row}>
      <div className={styles.identity}>
        <div className={styles.nameGroup}>
          <span className={styles.symbol}>{symbol ?? "-"}</span>
          <span className={styles.name}>{shortName ?? "-"}</span>
        </div>
        {subtitle && (
          <span className={styles.subtitle}>{subtitle}</span>
        )}
      </div>
      <div className={styles.metrics}>
        <span className={styles.price}>
          {price !== undefined ? formatPrice(price) : "-"}
        </span>
        <span className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
          {isPositive ? "+" : ""}{(changePercent ?? 0).toFixed(2)}%
        </span>
        {showZScores && (
          <>
            <span className={`${styles.zscore} ${(z20 ?? 0) >= 0 ? styles.positive : styles.negative}`}>
              {z20 !== undefined ? `${z20 >= 0 ? "+" : ""}${z20.toFixed(1)}σ` : "—"}
            </span>
            <span className={`${styles.zscore} ${(z200 ?? 0) >= 0 ? styles.positive : styles.negative}`}>
              {z200 !== undefined ? `${z200 >= 0 ? "+" : ""}${z200.toFixed(1)}σ` : "—"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
