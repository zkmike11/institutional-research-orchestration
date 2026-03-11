"use client";

import { useCallback } from "react";
import { useTableSort } from "@/hooks/useTableSort";
import WatchlistGroupHeader from "@/components/performance/WatchlistGroupHeader";
import SortableHeader from "@/components/performance/SortableHeader";
import CryptoRow from "./CryptoRow";
import type { CryptoRowData } from "./CryptoRow";
import styles from "./CryptoPerformanceTable.module.css";

interface CryptoGroup {
  name: string;
  rows: CryptoRowData[];
}

interface CryptoPerformanceTableProps {
  groups: CryptoGroup[];
}

const COL_SPAN = 13;

function rowAccessor(row: CryptoRowData, key: string): number | null {
  switch (key) {
    case "price":
      return row.price;
    case "mktCap":
      return row.marketCap;
    case "fdv":
      return row.fdv;
    case "d1":
      return row.changePercents.d1;
    case "w1":
      return row.changePercents.w1;
    case "m1":
      return row.changePercents.m1;
    case "y1":
      return row.changePercents.y1;
    case "ath":
      return row.athChangePercent;
    case "volume":
      return row.volume24h;
    default:
      return null;
  }
}

export default function CryptoPerformanceTable({
  groups,
}: CryptoPerformanceTableProps) {
  const accessor = useCallback(rowAccessor, []);

  // Use first group for the sort state (shared across all groups)
  const allRows = groups.flatMap((g) => g.rows);
  const { sortKey, sortDir, onSort } = useTableSort(allRows, accessor);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 40 }} />
            <th>Token</th>
            <th>Name</th>
            <SortableHeader
              label="Price"
              sortKey="price"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.right}
            />
            <SortableHeader
              label="Mkt Cap"
              sortKey="mktCap"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.right}
            />
            <SortableHeader
              label="FDV"
              sortKey="fdv"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.right}
            />
            <SortableHeader
              label="% 1D"
              sortKey="d1"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.percentHeader}
            />
            <SortableHeader
              label="% 1W"
              sortKey="w1"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.percentHeader}
            />
            <SortableHeader
              label="% 1M"
              sortKey="m1"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.percentHeader}
            />
            <SortableHeader
              label="% 1Y"
              sortKey="y1"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.percentHeader}
            />
            <th>Chart 90D</th>
            <SortableHeader
              label="% from ATH"
              sortKey="ath"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.right}
            />
            <SortableHeader
              label="24h Volume"
              sortKey="volume"
              activeSortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
              className={styles.right}
            />
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <SortedGroupSection
              key={group.name}
              group={group}
              sortKey={sortKey}
              sortDir={sortDir}
              accessor={accessor}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortedGroupSection({
  group,
  sortKey,
  sortDir,
  accessor,
}: {
  group: CryptoGroup;
  sortKey: string | null;
  sortDir: "asc" | "desc" | null;
  accessor: (item: CryptoRowData, key: string) => number | null;
}) {
  const rows =
    sortKey && sortDir
      ? [...group.rows].sort((a, b) => {
          const aVal = accessor(a, sortKey) ?? -Infinity;
          const bVal = accessor(b, sortKey) ?? -Infinity;
          return sortDir === "asc" ? aVal - bVal : bVal - aVal;
        })
      : group.rows;

  return (
    <>
      <WatchlistGroupHeader name={group.name} colSpan={COL_SPAN} />
      {rows.map((row) => (
        <CryptoRow key={row.symbol} data={row} />
      ))}
    </>
  );
}
