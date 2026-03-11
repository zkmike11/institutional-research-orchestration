"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Report } from "@/lib/api";

interface Props {
  reports: Report[];
}

const BADGE_CLASS: Record<string, string> = {
  BUY: "badge badge-buy",
  WATCH: "badge badge-watch",
  HOLD: "badge badge-hold",
  REDUCE: "badge badge-reduce",
  EXIT: "badge badge-exit",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPhase(phase: string | null): string {
  if (!phase) return "-";
  const match = phase.match(/(\d)/);
  return match ? `Phase ${match[1]}` : phase;
}

export function MemoList({ reports }: Props) {
  const router = useRouter();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Memo Library</h2>
        <Link
          href="/review/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#fff",
            backgroundColor: "var(--accent)",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          New Memo
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          No memos yet. Start a review to generate your first memo.
        </div>
      ) : (
      <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Protocol</th>
            <th>Decision</th>
            <th>Phase</th>
            <th>Conviction</th>
            <th>Versions</th>
            <th>Latest</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr
              key={report.id}
              className="clickable-row"
              onClick={() => router.push(`/reports/${report.id}`)}
            >
              <td style={{ fontWeight: 500 }}>
                {report.protocolName}
              </td>
              <td>
                <span
                  className={
                    BADGE_CLASS[report.recommendation?.toUpperCase()] ||
                    "badge badge-hold"
                  }
                >
                  {report.recommendation}
                </span>
              </td>
              <td>{formatPhase(report.maturationPhase)}</td>
              <td>{report.conviction || "-"}</td>
              <td>{report.version}</td>
              <td>{formatDate(report.createdAt)}</td>
              <td style={{ color: "var(--fg-secondary)", fontSize: "0.8rem" }}>&#8250;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      )}
    </div>
  );
}
