"use client";

import type { YieldPool } from "@/lib/types/crypto";
import { formatTvl, formatApy } from "@/lib/format";
import styles from "./YieldTable.module.css";

interface YieldTableProps {
  pools: YieldPool[];
}

export default function YieldTable({ pools }: YieldTableProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Top Yields</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pool Symbol</th>
              <th>Project</th>
              <th>Chain</th>
              <th className={styles.thRight}>TVL</th>
              <th className={styles.thRight}>APY</th>
              <th className={styles.thRight}>Base APY</th>
              <th className={styles.thRight}>Reward APY</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => (
              <tr key={pool.pool}>
                <td className={styles.symbol}>{pool.symbol}</td>
                <td className={styles.project}>{pool.project}</td>
                <td className={styles.chain}>{pool.chain}</td>
                <td className={styles.numCell}>{formatTvl(pool.tvlUsd)}</td>
                <td className={styles.apyGreen}>{formatApy(pool.apy)}</td>
                <td className={styles.numCell}>{formatApy(pool.apyBase)}</td>
                <td className={styles.numCell}>{formatApy(pool.apyReward)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
