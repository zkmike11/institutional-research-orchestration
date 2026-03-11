"use client";

import type { GovernanceSummary } from "@/lib/types/crypto";
import { formatCompact, formatPercent } from "@/lib/format";
import styles from "./GovernancePanel.module.css";

interface GovernancePanelProps {
  governance: GovernanceSummary | null;
}

function relativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 0) {
    // Future
    const absDiff = Math.abs(diff);
    if (absDiff < 3600) return `in ${Math.round(absDiff / 60)}m`;
    if (absDiff < 86400) return `in ${Math.round(absDiff / 3600)}h`;
    return `in ${Math.round(absDiff / 86400)}d`;
  }

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.round(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function badgeClass(state: string): string {
  const lower = state.toLowerCase();
  if (lower === "active") return styles.badgeActive;
  if (lower === "pending") return styles.badgePending;
  return styles.badgeClosed;
}

export default function GovernancePanel({
  governance,
}: GovernancePanelProps) {
  if (!governance) {
    return (
      <div className={styles.card}>
        <div className={styles.title}>Governance</div>
        <div className={styles.empty}>No governance data available</div>
      </div>
    );
  }

  const { voterConcentration, proposals } = governance;

  return (
    <div className={styles.card}>
      <div className={styles.title}>Governance</div>

      {voterConcentration && (
        <>
          <div className={styles.subTitle}>Voter Concentration</div>
          <div className={styles.concentration}>
            <div className={styles.concCard}>
              <div className={styles.concLabel}>Top Voter</div>
              <div className={styles.concValue}>
                {formatPercent(voterConcentration.topVoterPct)}
              </div>
            </div>
            <div className={styles.concCard}>
              <div className={styles.concLabel}>Top 5 Voters</div>
              <div className={styles.concValue}>
                {formatPercent(voterConcentration.top5Pct)}
              </div>
            </div>
            <div className={styles.concCard}>
              <div className={styles.concLabel}>Total VP</div>
              <div className={styles.concValue}>
                {formatCompact(voterConcentration.totalVp)}
              </div>
            </div>
          </div>
        </>
      )}

      {proposals.length > 0 && (
        <>
          <div className={styles.subTitle}>Recent Proposals</div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>State</th>
                  <th className={styles.thRight}>Votes</th>
                  <th className={styles.thRight}>Date</th>
                </tr>
              </thead>
              <tbody>
                {proposals.slice(0, 10).map((p) => (
                  <tr key={p.id}>
                    <td className={styles.proposalTitle}>{p.title}</td>
                    <td>
                      <span className={`${styles.badge} ${badgeClass(p.state)}`}>
                        {p.state}
                      </span>
                    </td>
                    <td className={styles.numCell}>{p.votes.toLocaleString()}</td>
                    <td className={styles.dateCell}>
                      {relativeTime(p.end)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {proposals.length === 0 && !voterConcentration && (
        <div className={styles.empty}>No proposals found</div>
      )}
    </div>
  );
}
