"use client";

import { useEarnings } from "@/hooks/useEarnings";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import styles from "./Earnings.module.css";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function formatEstimate(value: number | null, prefix: string): string {
  if (value === null) return "--";
  if (prefix === "Rev") {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toLocaleString()}`;
  }
  return `$${value.toFixed(2)}`;
}

export default function EarningsPage() {
  const { data, loading, error } = useEarnings();

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Upcoming Earnings</h1>
          <p className={styles.subtitle}>Earnings calendar for watchlist companies</p>
        </div>
      </div>
      <div className={styles.list}>
        {data?.map((entry) => {
          const days = entry.earningsDate ? daysUntil(entry.earningsDate) : null;
          const isSoon = days !== null && days >= 0 && days <= 7;

          return (
            <div key={entry.symbol} className={styles.earningsRow}>
              <div className={styles.dateCol}>
                {entry.earningsDate ? (
                  <>
                    <span className={styles.date}>{formatDate(entry.earningsDate)}</span>
                    <span className={isSoon ? styles.daysUntilSoon : styles.daysUntil}>
                      {days === 0
                        ? "Today"
                        : days === 1
                          ? "Tomorrow"
                          : days !== null && days < 0
                            ? `${Math.abs(days)}d ago`
                            : `${days}d`}
                    </span>
                  </>
                ) : (
                  <span className={styles.noDate}>TBD</span>
                )}
              </div>
              <div className={styles.symbolCol}>
                <span className={styles.symbol}>{entry.symbol}</span>
              </div>
              <span className={styles.name}>{entry.name}</span>
              <div className={styles.estimate}>
                <div>{formatEstimate(entry.epsEstimate, "EPS")}</div>
                <div className={styles.estimateLabel}>EPS Est</div>
              </div>
              <div className={styles.estimate}>
                <div>{formatEstimate(entry.revenueEstimate, "Rev")}</div>
                <div className={styles.estimateLabel}>Rev Est</div>
              </div>
              <div className={styles.marketCap}>
                {entry.marketCap ? formatMarketCap(entry.marketCap) : "--"}
              </div>
            </div>
          );
        })}
        {data?.length === 0 && (
          <div className="empty-state">No upcoming earnings data available</div>
        )}
      </div>
    </div>
  );
}
