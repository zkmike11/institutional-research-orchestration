"use client";

import { useCallback } from "react";
import type { ProtocolTvlEntry } from "@/lib/types/crypto";
import { useTableSort } from "@/hooks/useTableSort";
import { formatTvl, formatPercent } from "@/lib/format";
import styles from "./TvlLeaderboard.module.css";

interface TvlLeaderboardProps {
  protocols: ProtocolTvlEntry[];
}

const COLUMNS = [
  { key: "tvl", label: "TVL", right: true },
  { key: "change1d", label: "1d \u0394%", right: true },
  { key: "change7d", label: "7d \u0394%", right: true },
];

export default function TvlLeaderboard({ protocols }: TvlLeaderboardProps) {
  const accessor = useCallback(
    (item: ProtocolTvlEntry, key: string): number | null => {
      switch (key) {
        case "tvl":
          return item.tvl;
        case "change1d":
          return item.change1d;
        case "change7d":
          return item.change7d;
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

  function changeClass(val: number): string {
    if (val > 0) return styles.positive;
    if (val < 0) return styles.negative;
    return "";
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>TVL Leaders</span>
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
                <td>
                  <div className={styles.protocolCell}>
                    {p.logo && (
                      <img
                        className={styles.logo}
                        src={p.logo}
                        alt={p.name}
                        width={20}
                        height={20}
                      />
                    )}
                    <span className={styles.protocolName}>{p.name}</span>
                  </div>
                </td>
                <td className={styles.category}>{p.category}</td>
                <td className={styles.numCell}>{formatTvl(p.tvl)}</td>
                <td className={`${styles.numCell} ${changeClass(p.change1d)}`}>
                  {formatPercent(p.change1d)}
                </td>
                <td className={`${styles.numCell} ${changeClass(p.change7d)}`}>
                  {formatPercent(p.change7d)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
