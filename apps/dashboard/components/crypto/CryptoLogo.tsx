"use client";

import { useState } from "react";
import styles from "./CryptoLogo.module.css";

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

interface CryptoLogoProps {
  image: string;
  symbol: string;
  size?: number;
}

export default function CryptoLogo({ image, symbol, size = 28 }: CryptoLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const color = PALETTE[hashString(symbol) % PALETTE.length];
  const letter = symbol.charAt(0).toUpperCase();
  const fontSize = size * 0.4;

  if (imgFailed || !image) {
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
        {letter}
      </div>
    );
  }

  return (
    <div
      className={styles.logo}
      style={{ width: size, height: size, backgroundColor: color, fontSize }}
    >
      <img
        src={image}
        alt={symbol}
        className={styles.img}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}
