"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { TreemapNode } from "@/lib/types/heatmap";
import TreemapCell from "./TreemapCell";
import styles from "./TreemapView.module.css";

interface TreemapViewProps {
  nodes: TreemapNode[];
}

interface LayoutRect {
  node: TreemapNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GroupLabel {
  text: string;
  x: number;
  y: number;
  w: number;
}

/**
 * True squarify algorithm (Bruls, Huizing, van Wijk 2000).
 * Places items in rows, optimizing for best aspect ratio.
 */
function squarify(
  nodes: TreemapNode[],
  x: number,
  y: number,
  w: number,
  h: number
): LayoutRect[] {
  if (nodes.length === 0 || w <= 0 || h <= 0) return [];

  const totalValue = nodes.reduce((sum, n) => sum + Math.max(n.marketCap, 1), 0);
  const sorted = [...nodes].sort((a, b) => b.marketCap - a.marketCap);
  const totalArea = w * h;

  // Convert market cap to area
  const areas = sorted.map(
    (n) => (Math.max(n.marketCap, 1) / totalValue) * totalArea
  );

  const rects: LayoutRect[] = [];
  let cx = x,
    cy = y,
    cw = w,
    ch = h;

  let i = 0;
  while (i < sorted.length) {
    // Determine the shorter side of remaining rectangle
    const shortSide = Math.min(cw, ch);
    const remaining = areas.slice(i).reduce((s, a) => s + a, 0);

    // Build a row greedily, checking aspect ratio
    const row: number[] = [i];
    let rowArea = areas[i];
    i++;

    while (i < sorted.length) {
      const testArea = rowArea + areas[i];
      const worstCurrent = worstAspectRatio(row.map((j) => areas[j]), shortSide, rowArea);
      const worstWithNext = worstAspectRatio(
        [...row.map((j) => areas[j]), areas[i]],
        shortSide,
        testArea
      );

      if (worstWithNext <= worstCurrent) {
        row.push(i);
        rowArea = testArea;
        i++;
      } else {
        break;
      }
    }

    // Layout this row
    const rowFraction = rowArea / remaining;
    const isHorizontal = cw >= ch;

    if (isHorizontal) {
      const rowW = cw * rowFraction;
      let ry = cy;
      for (const j of row) {
        const cellH = (areas[j] / rowArea) * ch;
        rects.push({ node: sorted[j], x: cx, y: ry, w: rowW, h: cellH });
        ry += cellH;
      }
      cx += rowW;
      cw -= rowW;
    } else {
      const rowH = ch * rowFraction;
      let rx = cx;
      for (const j of row) {
        const cellW = (areas[j] / rowArea) * cw;
        rects.push({ node: sorted[j], x: rx, y: cy, w: cellW, h: rowH });
        rx += cellW;
      }
      cy += rowH;
      ch -= rowH;
    }
  }

  return rects;
}

/** Calculate worst aspect ratio for a set of areas laid out along a side */
function worstAspectRatio(areas: number[], side: number, totalArea: number): number {
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

const GROUP_HEADER_HEIGHT = 18;

export default function TreemapView({ nodes }: TreemapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDims({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const width = dims.width;
  const height = dims.height;

  const { layout, groupLabels } = useMemo(() => {
    if (width === 0 || height === 0) return { layout: [], groupLabels: [] };

    // Group nodes by subIndustry
    const groups = new Map<string, TreemapNode[]>();
    for (const node of nodes) {
      const key = node.subIndustry || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(node);
    }

    // Sort groups by total market cap (largest first)
    const sortedGroups = [...groups.entries()].sort(
      (a, b) =>
        b[1].reduce((s, n) => s + n.marketCap, 0) -
        a[1].reduce((s, n) => s + n.marketCap, 0)
    );

    // Allocate group rectangles using squarify at the group level too
    const totalMcap = nodes.reduce((s, n) => s + Math.max(n.marketCap, 1), 0);
    const allRects: LayoutRect[] = [];
    const labels: GroupLabel[] = [];

    // Use squarify-like layout for groups
    const groupAreas = sortedGroups.map(([, g]) => {
      const mcap = g.reduce((s, n) => s + Math.max(n.marketCap, 1), 0);
      return (mcap / totalMcap) * width * height;
    });

    let gx = 0,
      gy = 0,
      gw = width,
      gh = height;
    let gi = 0;

    while (gi < sortedGroups.length) {
      const shortSide = Math.min(gw, gh);
      const remaining = groupAreas.slice(gi).reduce((s, a) => s + a, 0);

      const row: number[] = [gi];
      let rowArea = groupAreas[gi];
      gi++;

      while (gi < sortedGroups.length) {
        const worstCurrent = worstAspectRatio(
          row.map((j) => groupAreas[j]),
          shortSide,
          rowArea
        );
        const worstWithNext = worstAspectRatio(
          [...row.map((j) => groupAreas[j]), groupAreas[gi]],
          shortSide,
          rowArea + groupAreas[gi]
        );
        if (worstWithNext <= worstCurrent) {
          row.push(gi);
          rowArea += groupAreas[gi];
          gi++;
        } else {
          break;
        }
      }

      const rowFraction = rowArea / remaining;
      const isHorizontal = gw >= gh;

      if (isHorizontal) {
        const rowW = gw * rowFraction;
        let ry = gy;
        for (const j of row) {
          const cellH = (groupAreas[j] / rowArea) * gh;
          const [groupName, groupNodes] = sortedGroups[j];

          if (rowW > 60) {
            labels.push({ text: groupName, x: gx, y: ry, w: rowW });
          }
          const innerY = ry + GROUP_HEADER_HEIGHT;
          const innerH = Math.max(cellH - GROUP_HEADER_HEIGHT, 0);
          const groupRects = squarify(groupNodes, gx, innerY, rowW, innerH);
          allRects.push(...groupRects);
          ry += cellH;
        }
        gx += rowW;
        gw -= rowW;
      } else {
        const rowH = gh * rowFraction;
        let rx = gx;
        for (const j of row) {
          const cellW = (groupAreas[j] / rowArea) * gw;
          const [groupName, groupNodes] = sortedGroups[j];

          if (cellW > 60) {
            labels.push({ text: groupName, x: rx, y: gy, w: cellW });
          }
          const innerY = gy + GROUP_HEADER_HEIGHT;
          const innerH = Math.max(rowH - GROUP_HEADER_HEIGHT, 0);
          const groupRects = squarify(groupNodes, rx, innerY, cellW, innerH);
          allRects.push(...groupRects);
          rx += cellW;
        }
        gy += rowH;
        gh -= rowH;
      }
    }

    return { layout: allRects, groupLabels: labels };
  }, [nodes, width, height]);

  if (nodes.length === 0) {
    return <div className={styles.empty}>No data available</div>;
  }

  return (
    <div ref={containerRef} className={styles.container}>
      {groupLabels.map((label) => (
        <div
          key={label.text}
          className={styles.groupLabel}
          style={{
            left: label.x,
            top: label.y,
            width: label.w,
            height: GROUP_HEADER_HEIGHT,
          }}
        >
          {label.text}
        </div>
      ))}
      {layout.map((rect) => (
        <TreemapCell
          key={rect.node.symbol}
          symbol={rect.node.symbol}
          name={rect.node.name}
          changePercent={rect.node.changePercent}
          x={rect.x}
          y={rect.y}
          width={rect.w}
          height={rect.h}
        />
      ))}
    </div>
  );
}
