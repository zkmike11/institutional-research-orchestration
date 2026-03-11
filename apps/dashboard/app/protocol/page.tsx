"use client";

import { useState } from "react";
import { useProtocol } from "@/hooks/useProtocol";
import { SNAPSHOT_SPACES } from "@/lib/constants/crypto";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import ProtocolSelector from "@/components/protocol/ProtocolSelector";
import ProtocolSummaryCard from "@/components/protocol/ProtocolSummaryCard";
import TvlChart from "@/components/protocol/TvlChart";
import FeeRevenueChart from "@/components/protocol/FeeRevenueChart";
import GovernancePanel from "@/components/protocol/GovernancePanel";
import YieldTable from "@/components/defi/YieldTable";
import styles from "./Protocol.module.css";

export default function ProtocolPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>("aave");

  const snapshotSpace = SNAPSHOT_SPACES[selectedSlug] ?? undefined;
  const { protocol, governance, loading, error } = useProtocol(
    selectedSlug,
    snapshotSpace
  );

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Protocol Deep Dive</h1>
          <p className={styles.subtitle}>
            TVL, fees, yields, and governance for individual DeFi protocols
          </p>
        </div>
      </div>

      <div className={styles.selectorRow}>
        <ProtocolSelector
          selected={selectedSlug}
          onSelect={setSelectedSlug}
        />
      </div>

      {loading && !protocol && <LoadingState />}
      {error && <ErrorState message={error} />}

      {protocol && (
        <div className={styles.stack}>
          <div className={styles.section}>
            <ProtocolSummaryCard protocol={protocol} />
          </div>

          <div className={styles.section}>
            <TvlChart data={protocol.tvlHistory} />
          </div>

          <div className={styles.section}>
            <FeeRevenueChart data={protocol.feeHistory} />
          </div>

          {protocol.yields.length > 0 && (
            <div className={styles.section}>
              <YieldTable pools={protocol.yields} />
            </div>
          )}

          <div className={styles.section}>
            <GovernancePanel governance={governance} />
          </div>
        </div>
      )}
    </div>
  );
}
