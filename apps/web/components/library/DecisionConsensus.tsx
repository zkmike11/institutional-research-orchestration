"use client";

import type { Consensus } from "@/lib/api";

interface Props {
  consensus: Consensus;
}

const SEGMENT_COLORS: Record<string, string> = {
  BUY: "#16a34a",
  WATCH: "#ca8a04",
  HOLD: "#9ca3af",
  REDUCE: "#ea580c",
  EXIT: "#dc2626",
};

const SEGMENT_ORDER = ["BUY", "WATCH", "HOLD", "REDUCE", "EXIT"];

export function DecisionConsensus({ consensus }: Props) {
  const { total, breakdown, vetoRate, avgActivism } = consensus;

  const segments = SEGMENT_ORDER.filter(
    (key) => breakdown[key] && breakdown[key] > 0
  ).map((key) => {
    const count = breakdown[key];
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { key, count, pct, color: SEGMENT_COLORS[key] || "#9ca3af" };
  });

  return (
    <div className="consensus">
      <h2>Decision Consensus</h2>
      <p className="consensus-stats">
        {total} review{total !== 1 ? "s" : ""}, {vetoRate}% veto rate, avg
        activism {avgActivism}/10
      </p>

      {total > 0 && segments.length > 0 ? (
        <div className="consensus-bar">
          {segments.map((seg) => (
            <div
              key={seg.key}
              className="consensus-bar-segment"
              style={{
                width: `${seg.pct}%`,
                backgroundColor: seg.color,
              }}
              title={`${seg.key}: ${seg.pct}%`}
            >
              {seg.pct >= 8 ? `${seg.key} ${seg.pct}%` : ""}
            </div>
          ))}
        </div>
      ) : (
        <div className="consensus-bar">
          <div
            className="consensus-bar-segment"
            style={{
              width: "100%",
              backgroundColor: "var(--bg-hover)",
              color: "var(--fg-secondary)",
            }}
          >
            No data
          </div>
        </div>
      )}
    </div>
  );
}
