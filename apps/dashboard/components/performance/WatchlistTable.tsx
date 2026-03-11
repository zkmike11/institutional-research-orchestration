"use client";

import { useCallback } from "react";
import { useTableSort } from "@/hooks/useTableSort";
import WatchlistGroupHeader from "./WatchlistGroupHeader";
import WatchlistRow from "./WatchlistRow";
import AddBenchmarkButton from "./AddBenchmarkButton";
import SortableHeader from "./SortableHeader";
import type { WatchlistRowData } from "./WatchlistRow";
import styles from "./WatchlistTable.module.css";

interface WatchlistGroup {
  name: string;
  rows: WatchlistRowData[];
}

interface WatchlistTableProps {
  benchmarkRows: WatchlistRowData[];
  groups: WatchlistGroup[];
  onAddBenchmark: (symbol: string) => void;
}

const COL_SPAN = 12;

function rowAccessor(row: WatchlistRowData, key: string): number | null {
  switch (key) {
    case "price":
      return row.price;
    case "mktCap":
      return row.marketCap ?? null;
    case "d1":
      return row.changePercents.d1;
    case "w1":
      return row.changePercents.w1;
    case "m1":
      return row.changePercents.m1;
    case "y1":
      return row.changePercents.y1;
    case "y3":
      return row.changePercents.y3;
    case "high52w":
      return row.fiftyTwoWeekHigh && row.fiftyTwoWeekHigh > 0
        ? ((row.price - row.fiftyTwoWeekHigh) / row.fiftyTwoWeekHigh) * 100
        : null;
    default:
      return null;
  }
}

export default function WatchlistTable({
  benchmarkRows,
  groups,
  onAddBenchmark,
}: WatchlistTableProps) {
  const accessor = useCallback(rowAccessor, []);
  const { sorted: sortedBenchmarks, sortKey, sortDir, onSort } = useTableSort(
    benchmarkRows,
    accessor
  );

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 3, padding: 0 }} />
            <th style={{ width: 40 }} />
            <th>Ticker</th>
            <th>Company</th>
            <SortableHeader label="Price" sortKey="price" activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} className={styles.right} />
            <SortableHeader label="Mkt Cap" sortKey="mktCap" activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} className={styles.right} />
            <SortableHeader label="% 1D" sortKey="d1" activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} className={styles.percentHeader} />
            <SortableHeader label="% 1W" sortKey="w1" activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} className={styles.percentHeader} />
            <SortableHeader label="% 1M" sortKey="m1" activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} className={styles.percentHeader} />
            <SortableHeader label="% 1Y" sortKey="y1" activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} className={styles.percentHeader} />
            <SortableHeader label="% 3Y" sortKey="y3" activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} className={styles.percentHeader} />
            <th>Chart 1Y</th>
            <SortableHeader label="&Delta; 52W High" sortKey="high52w" activeSortKey={sortKey} sortDir={sortDir} onSort={onSort} className={styles.right} />
          </tr>
        </thead>
        <tbody>
          <WatchlistGroupHeader name="Benchmarks" colSpan={COL_SPAN + 1} />
          {sortedBenchmarks.map((row) => (
            <WatchlistRow key={row.symbol} data={row} />
          ))}
          <tr className={styles.addRow}>
            <td colSpan={COL_SPAN + 1} style={{ borderBottom: "none" }}>
              <AddBenchmarkButton onAdd={onAddBenchmark} />
            </td>
          </tr>
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
  group: WatchlistGroup;
  sortKey: string | null;
  sortDir: "asc" | "desc" | null;
  accessor: (item: WatchlistRowData, key: string) => number | null;
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
      <WatchlistGroupHeader name={group.name} colSpan={COL_SPAN + 1} />
      {rows.map((row) => (
        <WatchlistRow key={row.symbol} data={row} />
      ))}
    </>
  );
}
