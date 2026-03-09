"use client";

import styles from "./MultiLineChart.module.css";

interface LineSeries {
  name: string;
  values: number[];
  color: string;
}

interface MultiLineChartProps {
  series: LineSeries[];
  width?: number;
  height?: number;
}

const SERIES_COLORS = [
  "#ef4444", // red
  "#f59e0b", // orange
  "#3b82f6", // blue
  "#22c55e", // green
  "#d1d5db", // grey/white
];

export default function MultiLineChart({
  series,
  width = 480,
  height = 260,
}: MultiLineChartProps) {
  if (series.length === 0 || series[0].values.length === 0) return null;

  const margin = { top: 12, right: 140, bottom: 28, left: 48 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const allValues = series.flatMap((s) => s.values);
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const range = rawMax - rawMin || 1;
  const pad = range * 0.1;
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;

  const len = series[0].values.length;
  const xScale = (i: number) => margin.left + (i / (len - 1)) * plotW;
  const yScale = (v: number) => margin.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  // Y-axis ticks
  const yTicks: number[] = [];
  const step = (yMax - yMin) / 4;
  for (let i = 0; i <= 4; i++) {
    yTicks.push(yMin + step * i);
  }

  // 0% reference line
  const zeroY = yScale(0);
  const showZeroLine = yMin < 0 && yMax > 0;

  return (
    <div className={styles.container}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <line
            key={i}
            x1={margin.left}
            y1={yScale(t)}
            x2={margin.left + plotW}
            y2={yScale(t)}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
        ))}

        {/* 0% reference line */}
        {showZeroLine && (
          <line
            x1={margin.left}
            y1={zeroY}
            x2={margin.left + plotW}
            y2={zeroY}
            stroke="var(--fg-muted)"
            strokeWidth="0.5"
            strokeDasharray="4 2"
          />
        )}

        {/* Y-axis labels */}
        {yTicks.map((t, i) => (
          <text
            key={`y-${i}`}
            x={margin.left - 6}
            y={yScale(t) + 3}
            textAnchor="end"
            fill="var(--fg-muted)"
            fontSize="9"
            fontFamily="Inter, sans-serif"
          >
            {t.toFixed(1)}%
          </text>
        ))}

        {/* Data lines */}
        {series.map((s, si) => {
          const points = s.values
            .map((v, i) => `${xScale(i).toFixed(1)},${yScale(v).toFixed(1)}`)
            .join(" ");
          return (
            <polyline
              key={si}
              points={points}
              fill="none"
              stroke={s.color || SERIES_COLORS[si % SERIES_COLORS.length]}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Right-edge labels */}
        {series.map((s, si) => {
          const lastVal = s.values[s.values.length - 1];
          const y = yScale(lastVal);
          return (
            <g key={`label-${si}`}>
              <text
                x={margin.left + plotW + 8}
                y={y + 3}
                fill={s.color || SERIES_COLORS[si % SERIES_COLORS.length]}
                fontSize="10"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                {s.name} {lastVal >= 0 ? "+" : ""}{lastVal.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
