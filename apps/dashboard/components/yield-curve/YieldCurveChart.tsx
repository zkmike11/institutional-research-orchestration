"use client";

import styles from "./YieldCurveChart.module.css";
import type { YieldCurveSnapshot } from "@/lib/types/yield-curve";

interface YieldCurveChartProps {
  snapshots: YieldCurveSnapshot[];
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 300;
const PADDING = { top: 20, right: 30, bottom: 40, left: 50 };

export default function YieldCurveChart({ snapshots }: YieldCurveChartProps) {
  if (!snapshots || snapshots.length === 0) return null;

  const allMaturities = snapshots[0].points.map((p) => p.maturity);
  const allYields = snapshots.flatMap((s) => s.points.map((p) => p.yield));
  const minYield = Math.floor(Math.min(...allYields) * 10) / 10;
  const maxYield = Math.ceil(Math.max(...allYields) * 10) / 10;
  const yieldRange = maxYield - minYield || 1;

  const chartWidth = SVG_WIDTH - PADDING.left - PADDING.right;
  const chartHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  function xScale(index: number): number {
    return PADDING.left + (index / (allMaturities.length - 1)) * chartWidth;
  }

  function yScale(value: number): number {
    return PADDING.top + chartHeight - ((value - minYield) / yieldRange) * chartHeight;
  }

  const yTicks: number[] = [];
  const tickStep = yieldRange <= 2 ? 0.25 : yieldRange <= 5 ? 0.5 : 1;
  for (let v = minYield; v <= maxYield; v += tickStep) {
    yTicks.push(Math.round(v * 100) / 100);
  }

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={tick}
            x1={PADDING.left}
            y1={yScale(tick)}
            x2={SVG_WIDTH - PADDING.right}
            y2={yScale(tick)}
            stroke="var(--border)"
            strokeWidth={0.5}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={`label-${tick}`}
            x={PADDING.left - 8}
            y={yScale(tick)}
            textAnchor="end"
            dominantBaseline="middle"
            className={styles.axisLabel}
          >
            {tick.toFixed(2)}%
          </text>
        ))}

        {/* X-axis labels */}
        {allMaturities.map((mat, i) => (
          <text
            key={mat}
            x={xScale(i)}
            y={SVG_HEIGHT - PADDING.bottom + 20}
            textAnchor="middle"
            className={styles.axisLabel}
          >
            {mat}
          </text>
        ))}

        {/* Curve lines */}
        {snapshots.map((snapshot) => {
          const pointStr = snapshot.points
            .map((p, i) => `${xScale(i)},${yScale(p.yield)}`)
            .join(" ");
          return (
            <polyline
              key={snapshot.label}
              points={pointStr}
              fill="none"
              stroke={snapshot.color}
              strokeWidth={2}
              strokeDasharray={snapshot.dashed ? "6 3" : "none"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Data points */}
        {snapshots.map((snapshot) =>
          snapshot.points.map((p, i) => (
            <circle
              key={`${snapshot.label}-${i}`}
              cx={xScale(i)}
              cy={yScale(p.yield)}
              r={2.5}
              fill={snapshot.color}
            />
          ))
        )}

        {/* Value labels on first (Current) snapshot */}
        {snapshots.length > 0 &&
          snapshots[0].points.map((p, i) => (
            <text
              key={`val-${i}`}
              x={xScale(i)}
              y={yScale(p.yield) - 10}
              textAnchor="middle"
              fill={snapshots[0].color}
              fontSize="10"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              {p.yield.toFixed(2)}
            </text>
          ))
        }
      </svg>

      <div className={styles.legend}>
        {snapshots.map((snapshot) => (
          <div key={snapshot.label} className={styles.legendItem}>
            <span
              className={styles.legendLine}
              style={{
                backgroundColor: snapshot.color,
                borderStyle: snapshot.dashed ? "dashed" : "solid",
              }}
            />
            <span className={styles.legendText}>{snapshot.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
