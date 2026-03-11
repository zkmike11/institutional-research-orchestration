"use client";

import { useMemo } from "react";
import type { CryptoMarketData } from "@/lib/types/crypto";
import { formatTvl } from "@/lib/format";
import styles from "./MarketCapTreemap.module.css";

interface MarketCapTreemapProps {
  coins: CryptoMarketData["topCoins"];
}

interface CellLayout {
  coin: CryptoMarketData["topCoins"][number];
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Simple squarify algorithm to lay out cells with good aspect ratios.
 */
function squarify(
  coins: CryptoMarketData["topCoins"],
  x: number,
  y: number,
  w: number,
  h: number
): CellLayout[] {
  if (coins.length === 0 || w <= 0 || h <= 0) return [];

  const totalValue = coins.reduce((sum, c) => sum + Math.max(c.marketCap, 1), 0);
  const sorted = [...coins].sort((a, b) => b.marketCap - a.marketCap);
  const totalArea = w * h;

  const areas = sorted.map(
    (c) => (Math.max(c.marketCap, 1) / totalValue) * totalArea
  );

  const rects: CellLayout[] = [];
  let cx = x,
    cy = y,
    cw = w,
    ch = h;
  let i = 0;

  while (i < sorted.length) {
    const shortSide = Math.min(cw, ch);
    const remaining = areas.slice(i).reduce((s, a) => s + a, 0);

    const row: number[] = [i];
    let rowArea = areas[i];
    i++;

    while (i < sorted.length) {
      const worstCurrent = worstAspectRatio(
        row.map((j) => areas[j]),
        shortSide,
        rowArea
      );
      const worstWithNext = worstAspectRatio(
        [...row.map((j) => areas[j]), areas[i]],
        shortSide,
        rowArea + areas[i]
      );
      if (worstWithNext <= worstCurrent) {
        row.push(i);
        rowArea += areas[i];
        i++;
      } else {
        break;
      }
    }

    const rowFraction = rowArea / remaining;
    const isHorizontal = cw >= ch;

    if (isHorizontal) {
      const rowW = cw * rowFraction;
      let ry = cy;
      for (const j of row) {
        const cellH = (areas[j] / rowArea) * ch;
        rects.push({ coin: sorted[j], x: cx, y: ry, w: rowW, h: cellH });
        ry += cellH;
      }
      cx += rowW;
      cw -= rowW;
    } else {
      const rowH = ch * rowFraction;
      let rx = cx;
      for (const j of row) {
        const cellW = (areas[j] / rowArea) * cw;
        rects.push({ coin: sorted[j], x: rx, y: cy, w: cellW, h: rowH });
        rx += cellW;
      }
      cy += rowH;
      ch -= rowH;
    }
  }

  return rects;
}

function worstAspectRatio(
  areas: number[],
  side: number,
  totalArea: number
): number {
  if (side <= 0 || totalArea <= 0) return Infinity;
  const otherSide = totalArea / side;
  let worst = 0;
  for (const area of areas) {
    const cellSide = area / otherSide;
    const ratio = Math.max(cellSide / otherSide, otherSide / cellSide);
    if (ratio > worst) worst = ratio;
  }
  return worst;
}

const TREEMAP_W = 600;
const TREEMAP_H = 380;

export default function MarketCapTreemap({ coins }: MarketCapTreemapProps) {
  const top20 = useMemo(() => {
    return [...coins]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 20);
  }, [coins]);

  const layout = useMemo(() => {
    return squarify(top20, 0, 0, TREEMAP_W, TREEMAP_H);
  }, [top20]);

  if (top20.length === 0) {
    return (
      <div className={styles.panel}>
        <h3 className={styles.title}>Market Cap Treemap</h3>
        <div className={styles.empty}>No data available</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Market Cap Treemap</h3>
      <div
        className={styles.treemapContainer}
        style={{ aspectRatio: `${TREEMAP_W} / ${TREEMAP_H}` }}
      >
        <svg
          viewBox={`0 0 ${TREEMAP_W} ${TREEMAP_H}`}
          className={styles.svg}
          preserveAspectRatio="xMidYMid meet"
        >
          {layout.map((cell) => (
            <TreemapCellSvg key={cell.coin.id} cell={cell} />
          ))}
        </svg>
      </div>
    </div>
  );
}

function TreemapCellSvg({ cell }: { cell: CellLayout }) {
  const { coin, x, y, w, h } = cell;
  const isPositive = coin.priceChangePercent24h >= 0;
  const intensity = Math.min(Math.abs(coin.priceChangePercent24h) / 5, 1);

  const bgColor = isPositive
    ? `rgba(34, 197, 94, ${0.15 + intensity * 0.55})`
    : `rgba(239, 68, 68, ${0.15 + intensity * 0.55})`;

  const showSymbol = w > 40 && h > 28;
  const showPercent = w > 50 && h > 44;
  const showMcap = w > 70 && h > 60;

  const changeStr = `${isPositive ? "+" : ""}${coin.priceChangePercent24h.toFixed(1)}%`;

  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(w - 2, 0)}
        height={Math.max(h - 2, 0)}
        rx={3}
        fill={bgColor}
        stroke="var(--bg)"
        strokeWidth={1}
      />
      {showSymbol && (
        <text
          x={x + w / 2}
          y={y + h / 2 - (showPercent ? 8 : 0) - (showMcap ? 4 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--fg)"
          fontSize={w > 80 ? 12 : 10}
          fontWeight={700}
        >
          {coin.symbol.toUpperCase()}
        </text>
      )}
      {showPercent && (
        <text
          x={x + w / 2}
          y={y + h / 2 + (showMcap ? 4 : 8)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--fg)"
          fontSize={10}
          opacity={0.85}
        >
          {changeStr}
        </text>
      )}
      {showMcap && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--fg-secondary)"
          fontSize={9}
          opacity={0.7}
        >
          {formatTvl(coin.marketCap)}
        </text>
      )}
      <title>
        {coin.name} ({coin.symbol.toUpperCase()}): {changeStr} | MCap: {formatTvl(coin.marketCap)}
      </title>
    </g>
  );
}
