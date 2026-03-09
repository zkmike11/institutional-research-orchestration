"use client";

import { useMemo } from "react";
import type { TreemapNode } from "@/lib/types/heatmap";
import TreemapCell from "./TreemapCell";
import styles from "./TreemapView.module.css";

interface TreemapViewProps {
  nodes: TreemapNode[];
  width?: number;
  height?: number;
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

function squarify(
  nodes: TreemapNode[],
  x: number,
  y: number,
  w: number,
  h: number
): LayoutRect[] {
  if (nodes.length === 0) return [];

  const totalValue = nodes.reduce((sum, n) => sum + Math.max(n.marketCap, 1), 0);
  const sorted = [...nodes].sort((a, b) => b.marketCap - a.marketCap);
  const rects: LayoutRect[] = [];

  let cx = x;
  let cy = y;
  let cw = w;
  let ch = h;

  for (const node of sorted) {
    const ratio = Math.max(node.marketCap, 1) / totalValue;
    const area = ratio * w * h;

    if (cw >= ch) {
      const cellW = area / ch;
      rects.push({ node, x: cx, y: cy, w: Math.min(cellW, cw), h: ch });
      cx += cellW;
      cw -= cellW;
    } else {
      const cellH = area / cw;
      rects.push({ node, x: cx, y: cy, w: cw, h: Math.min(cellH, ch) });
      cy += cellH;
      ch -= cellH;
    }
  }

  return rects;
}

const GROUP_HEADER_HEIGHT = 18;

export default function TreemapView({
  nodes,
  width = 900,
  height = 500,
}: TreemapViewProps) {
  const { layout, groupLabels } = useMemo(() => {
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

    // First pass: allocate group rectangles
    const totalMcap = nodes.reduce((s, n) => s + Math.max(n.marketCap, 1), 0);
    const allRects: LayoutRect[] = [];
    const labels: GroupLabel[] = [];

    let gx = 0;
    let gy = 0;
    let gw = width;
    let gh = height;

    for (const [groupName, groupNodes] of sortedGroups) {
      const groupMcap = groupNodes.reduce((s, n) => s + Math.max(n.marketCap, 1), 0);
      const ratio = groupMcap / totalMcap;

      // Allocate a slice for this group
      let sliceW: number;
      let sliceH: number;
      let sliceX = gx;
      let sliceY = gy;

      if (gw >= gh) {
        sliceW = gw * ratio;
        sliceH = gh;
        gx += sliceW;
        gw -= sliceW;
      } else {
        sliceW = gw;
        sliceH = gh * ratio;
        gy += sliceH;
        gh -= sliceH;
      }

      // Add group label
      if (sliceW > 80) {
        labels.push({ text: groupName, x: sliceX, y: sliceY, w: sliceW });
      }

      // Squarify nodes within this group's rectangle (below the header)
      const innerY = sliceY + GROUP_HEADER_HEIGHT;
      const innerH = Math.max(sliceH - GROUP_HEADER_HEIGHT, 0);
      const groupRects = squarify(groupNodes, sliceX, innerY, sliceW, innerH);
      allRects.push(...groupRects);
    }

    return { layout: allRects, groupLabels: labels };
  }, [nodes, width, height]);

  if (nodes.length === 0) {
    return <div className={styles.empty}>No data available</div>;
  }

  return (
    <div className={styles.container} style={{ width, height }}>
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
