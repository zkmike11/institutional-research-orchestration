"use client";

import { formatTvl } from "@/lib/format";
import styles from "./StablecoinChart.module.css";

interface StablecoinChartProps {
  marketCap: number;
}

export default function StablecoinChart({ marketCap }: StablecoinChartProps) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Stablecoin Supply</h3>
      <div className={styles.body}>
        <span className={styles.bigNumber}>{formatTvl(marketCap)}</span>
        <p className={styles.description}>
          Stablecoin supply growth indicates capital inflows into crypto markets.
          Rising supply typically signals new money entering the ecosystem, while
          declining supply suggests capital outflows.
        </p>
      </div>
    </div>
  );
}
