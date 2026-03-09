"use client";

import { useState } from "react";
import type { DataSourceStat } from "@/lib/api";

interface Props {
  initialDataSources: DataSourceStat[];
}

type Period = "7d" | "30d" | "all";

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "All time", value: "all" },
];

function successClass(rate: number): string {
  if (rate >= 90) return "success-good";
  if (rate >= 50) return "success-warn";
  return "success-bad";
}

function formatLatency(ms: number): string {
  return `${Math.round(ms)} ms`;
}

function formatFailure(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DataSourceReliability({ initialDataSources }: Props) {
  const [period, setPeriod] = useState<Period>("7d");
  const [dataSources, setDataSources] =
    useState<DataSourceStat[]>(initialDataSources);
  const [loading, setLoading] = useState(false);

  async function handlePeriodChange(newPeriod: Period) {
    setPeriod(newPeriod);
    setLoading(true);
    try {
      const periodParam = newPeriod === "all" ? undefined : newPeriod;
      const res = await fetch(
        `/api/data-sources${periodParam ? `?period=${periodParam}` : ""}`
      );
      if (res.ok) {
        const data: DataSourceStat[] = await res.json();
        setDataSources(data);
      }
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reliability">
      <h2>Data Source Reliability</h2>

      <div className="filter-tabs">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-tab${period === opt.value ? " filter-tab-active" : ""}`}
            onClick={() => handlePeriodChange(opt.value)}
            disabled={loading}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {dataSources.length === 0 ? (
        <div className="empty-state">No data source statistics available.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Tool</th>
                <th>Success %</th>
                <th>Avg Latency</th>
                <th>Calls</th>
                <th>Last Failure</th>
              </tr>
            </thead>
            <tbody>
              {dataSources.map((ds, i) => (
                <tr key={`${ds.source}-${ds.tool_name}-${i}`}>
                  <td>{ds.source}</td>
                  <td>
                    <code
                      style={{
                        fontSize: "0.8125rem",
                        background: "rgba(151, 159, 167, 0.1)",
                        padding: "0.125rem 0.375rem",
                        borderRadius: "4px",
                      }}
                    >
                      {ds.tool_name}
                    </code>
                  </td>
                  <td>
                    <span className={successClass(ds.success_rate)}>
                      {ds.success_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td>{formatLatency(ds.avg_latency)}</td>
                  <td>{ds.total_calls.toLocaleString()}</td>
                  <td>{formatFailure(ds.last_failure)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
