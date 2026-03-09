"use client";

import { useState } from "react";
import styles from "./GainersLosersPanel.module.css";
import MoverRow from "./MoverRow";

interface MoverItem {
  symbol?: string;
  shortName?: string;
  sector?: string;
  industry?: string;
  price?: number;
  changePercent?: number;
  z20?: number;
  z200?: number;
}

interface GainersLosersPanelProps {
  gainers: MoverItem[];
  losers: MoverItem[];
}

export default function GainersLosersPanel({ gainers, losers }: GainersLosersPanelProps) {
  const [showZScores, setShowZScores] = useState(false);

  return (
    <>
      <div className={styles.toggleRow}>
        <button
          className={`${styles.zToggle} ${showZScores ? styles.zToggleActive : ""}`}
          onClick={() => setShowZScores(!showZScores)}
        >
          Zσ
        </button>
        {showZScores && (
          <div className={styles.zHeaders}>
            <span className={styles.zHeader}>Z20</span>
            <span className={styles.zHeader}>Z200</span>
          </div>
        )}
      </div>
      <div className={styles.grid}>
        <div className={styles.panel}>
          <h2 className={`${styles.panelHeader} ${styles.gainersHeader}`}>
            Top Gainers
          </h2>
          <div className={styles.list}>
            {gainers.map((item, i) => (
              <MoverRow
                key={item.symbol ?? i}
                symbol={item.symbol}
                shortName={item.shortName}
                sector={item.sector}
                industry={item.industry}
                price={item.price}
                changePercent={item.changePercent}
                z20={item.z20}
                z200={item.z200}
                showZScores={showZScores}
              />
            ))}
            {gainers.length === 0 && (
              <p className={styles.empty}>No gainers</p>
            )}
          </div>
        </div>
        <div className={styles.panel}>
          <h2 className={`${styles.panelHeader} ${styles.losersHeader}`}>
            Top Losers
          </h2>
          <div className={styles.list}>
            {losers.map((item, i) => (
              <MoverRow
                key={item.symbol ?? i}
                symbol={item.symbol}
                shortName={item.shortName}
                sector={item.sector}
                industry={item.industry}
                price={item.price}
                changePercent={item.changePercent}
                z20={item.z20}
                z200={item.z200}
                showZScores={showZScores}
              />
            ))}
            {losers.length === 0 && (
              <p className={styles.empty}>No losers</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
