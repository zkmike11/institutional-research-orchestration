"use client";

import { useMemo } from "react";
import type { ChainTvl } from "@/lib/types/crypto";
import { CHAIN_COLORS } from "@/lib/constants/crypto";
import { formatTvl } from "@/lib/format";
import styles from "./TvlByChainPanel.module.css";

interface TvlByChainPanelProps {
  chains: ChainTvl[];
}

export default function TvlByChainPanel({ chains }: TvlByChainPanelProps) {
  const sorted = useMemo(
    () => [...chains].sort((a, b) => b.tvl - a.tvl),
    [chains]
  );

  const maxTvl = useMemo(
    () => Math.max(...sorted.map((c) => c.tvl), 1),
    [sorted]
  );

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>TVL by Chain</span>
      </div>
      <div className={styles.rows}>
        {sorted.map((chain) => {
          const barWidth = (chain.tvl / maxTvl) * 100;
          const color = CHAIN_COLORS[chain.name] ?? "var(--accent)";

          return (
            <div key={chain.name} className={styles.row}>
              <span className={styles.chainName}>{chain.name}</span>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span className={styles.tvlValue}>{formatTvl(chain.tvl)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
