"use client";

import { useState } from "react";
import styles from "./CompanyLogo.module.css";

const PALETTE = [
  "#2e90fa",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#eab308",
  "#ef4444",
  "#06b6d4",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(symbol: string): string {
  const cleaned = symbol.replace(/[^A-Za-z]/g, "");
  return cleaned.slice(0, 2).toUpperCase();
}

function getLogoUrl(symbol: string): string {
  // Strip ^ prefix for indices
  const clean = symbol.replace(/^\^/, "");
  return `https://logo.clearbit.com/${clean.toLowerCase()}.com`;
}

interface CompanyLogoProps {
  symbol: string;
  size?: number;
}

export default function CompanyLogo({ symbol, size = 28 }: CompanyLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const color = PALETTE[hashString(symbol) % PALETTE.length];
  const initials = getInitials(symbol);
  const fontSize = size * 0.4;

  if (imgFailed || symbol.startsWith("^")) {
    return (
      <div
        className={styles.logo}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          fontSize,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={styles.logo}
      style={{ width: size, height: size, backgroundColor: color, fontSize }}
    >
      <img
        src={getLogoUrl(symbol)}
        alt={symbol}
        className={styles.img}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}
