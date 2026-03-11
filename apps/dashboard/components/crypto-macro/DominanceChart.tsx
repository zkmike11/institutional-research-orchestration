"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./DominanceChart.module.css";

interface HistoricalPoint {
  date: string;
  close: number;
}

export default function DominanceChart() {
  const [btcData, setBtcData] = useState<HistoricalPoint[] | null>(null);
  const [ethData, setEthData] = useState<HistoricalPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBoth() {
      setLoading(true);
      setError(null);
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch("/api/historical?symbol=BTC-USD&range=1y"),
          fetch("/api/historical?symbol=ETH-USD&range=1y"),
        ]);

        if (!btcRes.ok || !ethRes.ok) {
          throw new Error("Failed to fetch historical data");
        }

        const btcJson: HistoricalPoint[] = await btcRes.json();
        const ethJson: HistoricalPoint[] = await ethRes.json();

        if (!cancelled) {
          setBtcData(btcJson);
          setEthData(ethJson);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBoth();
    return () => {
      cancelled = true;
    };
  }, []);

  const ratioSeries = useMemo(() => {
    if (!btcData || !ethData) return [];

    const btcMap = new Map<string, number>();
    for (const p of btcData) {
      btcMap.set(p.date, p.close);
    }

    const series: { date: string; ratio: number }[] = [];
    for (const p of ethData) {
      const btcClose = btcMap.get(p.date);
      if (btcClose && btcClose > 0) {
        series.push({ date: p.date, ratio: p.close / btcClose });
      }
    }

    return series;
  }, [btcData, ethData]);

  if (loading) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.title}>ETH / BTC Ratio (1Y)</h3>
        <div className={styles.placeholder}>Loading...</div>
      </div>
    );
  }

  if (error || ratioSeries.length === 0) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.title}>ETH / BTC Ratio (1Y)</h3>
        <div className={styles.placeholder}>
          {error ?? "No data available"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>ETH / BTC Ratio (1Y)</h3>
      <RatioLineChart data={ratioSeries} />
    </div>
  );
}

/* ── Self-contained SVG Line Chart ───────────────────────── */

interface RatioLineChartProps {
  data: { date: string; ratio: number }[];
}

const CHART_W = 480;
const CHART_H = 220;
const PAD_LEFT = 58;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 32;

function RatioLineChart({ data }: RatioLineChartProps) {
  const values = data.map((d) => d.ratio);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 0.001;

  const innerW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const innerH = CHART_H - PAD_TOP - PAD_BOTTOM;

  // Build polyline points
  const points = data.map((d, i) => {
    const x = PAD_LEFT + (i / (data.length - 1)) * innerW;
    const y = PAD_TOP + innerH - ((d.ratio - min) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  // Y-axis labels (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = min + (range * i) / 4;
    const y = PAD_TOP + innerH - (i / 4) * innerH;
    return { val, y };
  });

  // X-axis labels (5 evenly spaced dates)
  const xTicks = Array.from({ length: 5 }, (_, i) => {
    const idx = Math.round((i / 4) * (data.length - 1));
    const x = PAD_LEFT + (idx / (data.length - 1)) * innerW;
    const raw = data[idx].date;
    const label = formatShortDate(raw);
    return { label, x };
  });

  // Current value
  const currentVal = values[values.length - 1];

  // Fill polygon (area under curve)
  const fillPoints = [
    `${PAD_LEFT},${PAD_TOP + innerH}`,
    ...points,
    `${PAD_LEFT + innerW},${PAD_TOP + innerH}`,
  ].join(" ");

  return (
    <div className={styles.chartWrap}>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <line
            key={i}
            x1={PAD_LEFT}
            y1={t.y}
            x2={CHART_W - PAD_RIGHT}
            y2={t.y}
            stroke="var(--border)"
            strokeWidth={0.5}
          />
        ))}

        {/* Area fill */}
        <polygon
          points={fillPoints}
          fill="var(--accent)"
          opacity={0.08}
        />

        {/* Line */}
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Y-axis labels */}
        {yTicks.map((t, i) => (
          <text
            key={i}
            x={PAD_LEFT - 8}
            y={t.y + 3}
            textAnchor="end"
            fill="var(--fg-secondary)"
            fontSize={10}
            fontFamily="var(--font-tabular)"
          >
            {t.val.toFixed(4)}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((t, i) => (
          <text
            key={i}
            x={t.x}
            y={CHART_H - 6}
            textAnchor="middle"
            fill="var(--fg-secondary)"
            fontSize={10}
            fontFamily="var(--font-tabular)"
          >
            {t.label}
          </text>
        ))}
      </svg>

      <div className={styles.currentBadge}>
        <span className={styles.currentLabel}>Current</span>
        <span className={styles.currentValue}>{currentVal.toFixed(4)}</span>
      </div>
    </div>
  );
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}
