"use client";

import WatchlistGroupHeader from "./WatchlistGroupHeader";
import WatchlistRow from "./WatchlistRow";
import AddBenchmarkButton from "./AddBenchmarkButton";
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

export default function WatchlistTable({
  benchmarkRows,
  groups,
  onAddBenchmark,
}: WatchlistTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 3, padding: 0 }} />
            <th style={{ width: 40 }} />
            <th>Ticker</th>
            <th>Company</th>
            <th className={styles.right}>Price</th>
            <th className={styles.right}>Mkt Cap</th>
            <th className={styles.percentHeader}>% 1D</th>
            <th className={styles.percentHeader}>% 1W</th>
            <th className={styles.percentHeader}>% 1M</th>
            <th className={styles.percentHeader}>% 1Y</th>
            <th className={styles.percentHeader}>% 3Y</th>
            <th>Chart 1Y</th>
            <th className={styles.right}>&Delta; 52W High</th>
          </tr>
        </thead>
        <tbody>
          <WatchlistGroupHeader name="Benchmarks" colSpan={COL_SPAN + 1} />
          {benchmarkRows.map((row) => (
            <WatchlistRow key={row.symbol} data={row} />
          ))}
          <tr className={styles.addRow}>
            <td colSpan={COL_SPAN + 1} style={{ borderBottom: "none" }}>
              <AddBenchmarkButton onAdd={onAddBenchmark} />
            </td>
          </tr>
          {groups.map((group) => (
            <GroupSection key={group.name} group={group} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupSection({ group }: { group: WatchlistGroup }) {
  return (
    <>
      <WatchlistGroupHeader name={group.name} colSpan={COL_SPAN + 1} />
      {group.rows.map((row) => (
        <WatchlistRow key={row.symbol} data={row} />
      ))}
    </>
  );
}
