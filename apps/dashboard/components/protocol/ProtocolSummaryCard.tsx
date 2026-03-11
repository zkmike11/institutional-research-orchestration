"use client";

import type { ProtocolDetail } from "@/lib/types/crypto";
import { formatTvl } from "@/lib/format";
import styles from "./ProtocolSummaryCard.module.css";

interface ProtocolSummaryCardProps {
  protocol: ProtocolDetail;
}

export default function ProtocolSummaryCard({
  protocol,
}: ProtocolSummaryCardProps) {
  return (
    <div className={styles.row}>
      <div className={styles.card}>
        <div className={styles.label}>Protocol</div>
        <div className={styles.value}>{protocol.name}</div>
        <div className={styles.category}>{protocol.category}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Current TVL</div>
        <div className={styles.value}>{formatTvl(protocol.tvl)}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>24h Fees</div>
        <div className={styles.value}>
          {protocol.fees24h != null ? formatTvl(protocol.fees24h) : "N/A"}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>24h Revenue</div>
        <div className={styles.value}>
          {protocol.revenue24h != null
            ? formatTvl(protocol.revenue24h)
            : "N/A"}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.label}>Chains</div>
        <div className={styles.valueSm}>
          {protocol.chains.slice(0, 6).join(", ")}
          {protocol.chains.length > 6 && ` +${protocol.chains.length - 6}`}
        </div>
      </div>
    </div>
  );
}
