"use client";

import styles from "./AxisChart.module.css";

interface DataPoint {
  time: string;
  value: number;
}

interface Series {
  data: DataPoint[];
  color: string;
  label?: string;
}

interface AxisChartProps {
  series: Series[];
  width?: number;
  height?: number;
  strokeWidth?: number;
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatAxisValue(value: number): string {
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 1) return value.toFixed(2);
  return value.toPrecision(4);
}

function niceStep(range: number, ticks: number): number {
  const rough = range / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let step: number;
  if (norm < 1.5) step = 1;
  else if (norm < 3.5) step = 2;
  else if (norm < 7.5) step = 5;
  else step = 10;
  return step * mag;
}

export default function AxisChart({
  series,
  width = 360,
  height = 200,
  strokeWidth = 1.5,
}: AxisChartProps) {
  if (series.length === 0 || series[0].data.length === 0) return null;

  const margin = { top: 8, right: 12, bottom: 24, left: 48 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Compute global min/max across all series
  let allValues: number[] = [];
  for (const s of series) {
    for (const d of s.data) allValues.push(d.value);
  }
  if (allValues.length === 0) return null;

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const range = rawMax - rawMin || 1;
  const pad = range * 0.08;
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;

  // Use the first series for X-axis (all series share same timestamps)
  const primaryData = series[0].data;
  const xLen = primaryData.length;
  if (xLen <= 1) return null;

  // X scale
  const xScale = (i: number) => margin.left + (i / (xLen - 1)) * plotW;
  // Y scale
  const yScale = (v: number) => margin.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  // Y-axis ticks (4-5 nice ticks)
  const step = niceStep(yMax - yMin, 4);
  const yTicks: number[] = [];
  let tick = Math.ceil(yMin / step) * step;
  while (tick <= yMax) {
    yTicks.push(tick);
    tick += step;
  }

  // X-axis labels: pick ~5 evenly spaced dates
  const xLabelCount = Math.min(5, xLen);
  const xLabels: { index: number; label: string }[] = [];
  for (let i = 0; i < xLabelCount; i++) {
    const idx = Math.round((i / (xLabelCount - 1)) * (xLen - 1));
    xLabels.push({ index: idx, label: formatAxisDate(primaryData[idx].time) });
  }

  // Build polyline points for each series
  const polylines = series.map((s) => {
    const points = s.data
      .map((d, i) => `${xScale(i).toFixed(1)},${yScale(d.value).toFixed(1)}`)
      .join(" ");
    return { points, color: s.color };
  });

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTicks.map((t) => (
          <line
            key={t}
            x1={margin.left}
            y1={yScale(t)}
            x2={width - margin.right}
            y2={yScale(t)}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((t) => (
          <text
            key={`y-${t}`}
            x={margin.left - 6}
            y={yScale(t) + 3}
            textAnchor="end"
            fill="var(--fg-muted)"
            fontSize="9"
            fontFamily="Inter, sans-serif"
          >
            {formatAxisValue(t)}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ index, label }) => (
          <text
            key={`x-${index}`}
            x={xScale(index)}
            y={height - 4}
            textAnchor="middle"
            fill="var(--fg-muted)"
            fontSize="9"
            fontFamily="Inter, sans-serif"
          >
            {label}
          </text>
        ))}

        {/* Data lines */}
        {polylines.map((pl, i) => (
          <polyline
            key={i}
            points={pl.points}
            fill="none"
            stroke={pl.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* End-value dots */}
        {series.map((s, i) => {
          const last = s.data[s.data.length - 1];
          return (
            <circle
              key={`dot-${i}`}
              cx={xScale(s.data.length - 1)}
              cy={yScale(last.value)}
              r={2.5}
              fill={s.color}
            />
          );
        })}
      </svg>
    </div>
  );
}
