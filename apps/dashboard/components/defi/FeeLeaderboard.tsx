"use client";

import { useCallback } from "react";
import type { ProtocolFeeEntry } from "@/lib/types/crypto";
import { useTableSort } from "@/hooks/useTableSort";
import { formatTvl } from "@/lib/format";
import styles from "./FeeLeaderboard.module.css";

interface FeeLeaderboardProps {
  protocols: ProtocolFeeEntry[];
}

const COLUMNS = [
  { key: "fees24h", label: "24h Fees", right: true },
  { key: "revenue24h", label: "24h Revenue", right: true },
  { key: "fees7dAvg", label: "7d Avg Fees", right: true },
];

export default function FeeLeaderboard({ protocols }: FeeLeaderboardProps) {
  const accessor = useCallback(
    (item: ProtocolFeeEntry, key: string): number | null => {
      switch (key) {
        case "fees24h":
          return item.fees24h;
        case "revenue24h":
          return item.revenue24h;
        case "fees7dAvg":
          return item.fees7dAvg;
        default:
          return null;
      }
    },
    []
  );

  const { sorted, sortKey, sortDir, onSort } = useTableSort(protocols, accessor);

  function sortIndicator(key: string) {
    if (sortKey !== key || !sortDir) return null;
    return (
      <span className={styles.sortArrow}>
        {sortDir === "asc" ? "\u25B2" : "\u25BC"}
      </span>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Fee Leaders (24h)</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Protocol</th>
              <th>Category</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={styles.thRight}
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  {sortIndicator(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr key={p.slug}>
                <td className={styles.rank}>{i + 1}</td>
                <td className={styles.protocol}>{p.name}</td>
                <td className={styles.category}>{p.category}</td>
                <td className={styles.numCell}>{formatTvl(p.fees24h)}</td>
                <td className={styles.numCell}>{formatTvl(p.revenue24h)}</td>
                <td className={styles.numCell}>{formatTvl(p.fees7dAvg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
