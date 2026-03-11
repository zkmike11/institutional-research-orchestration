"use client";

import Sparkline from "@/components/shared/Sparkline";
import CryptoLogo from "./CryptoLogo";
import styles from "./CryptoRow.module.css";

export interface CryptoRowData {
  symbol: string;        // BTC-USD
  displaySymbol: string; // BTC
  name: string;
  image: string;
  price: number;
  marketCap: number;
  fdv: number | null;
  volume24h: number;
  athChangePercent: number;
  changePercents: { d1: number; w1: number; m1: number; y1: number };
  sparklineData: number[];
}

function formatMarketCap(value: number | null | undefined): string {
  if (value == null || value === 0) return "-";
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
}

function formatPrice(value: number): string {
  if (value >= 10000) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(4);
  return value.toFixed(6);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function percentBg(value: number): string {
  const clamped = Math.min(Math.abs(value), 50);
  const opacity = 0.08 + (clamped / 50) * 0.2;
  if (value >= 0) return `rgba(34, 197, 94, ${opacity.toFixed(2)})`;
  return `rgba(239, 68, 68, ${opacity.toFixed(2)})`;
}

function percentColor(value: number): string {
  return value >= 0 ? "var(--positive)" : "var(--negative)";
}

function formatVolume(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

interface CryptoRowProps {
  data: CryptoRowData;
}

export default function CryptoRow({ data }: CryptoRowProps) {
  const sparklineColor =
    data.sparklineData.length >= 2 &&
    data.sparklineData[data.sparklineData.length - 1] >= data.sparklineData[0]
      ? "var(--sparkline-green)"
      : "var(--sparkline-red)";

  const percentKeys: (keyof CryptoRowData["changePercents"])[] = [
    "d1",
    "w1",
    "m1",
    "y1",
  ];

  return (
    <tr className={styles.row}>
      <td className={styles.logoCell}>
        <CryptoLogo image={data.image} symbol={data.displaySymbol} size={28} />
      </td>
      <td className={styles.tickerCell}>{data.displaySymbol}</td>
      <td className={styles.nameCell}>
        <span className={styles.name}>{data.name}</span>
      </td>
      <td className={styles.priceCell}>${formatPrice(data.price)}</td>
      <td className={styles.mktCapCell}>{formatMarketCap(data.marketCap)}</td>
      <td className={styles.fdvCell}>{formatMarketCap(data.fdv)}</td>
      {percentKeys.map((key) => {
        const val = data.changePercents[key];
        return (
          <td key={key} className={styles.percentCell}>
            <span
              className={styles.percentInner}
              style={{
                backgroundColor: percentBg(val),
                color: percentColor(val),
              }}
            >
              {formatPercent(val)}
            </span>
          </td>
        );
      })}
      <td className={styles.sparklineCell}>
        <Sparkline
          data={data.sparklineData}
          color={sparklineColor}
          width={120}
          height={40}
          strokeWidth={1.5}
        />
      </td>
      <td className={styles.athCell}>
        <span
          className={styles.athInner}
          style={{
            backgroundColor: percentBg(data.athChangePercent),
            color: percentColor(data.athChangePercent),
          }}
        >
          {formatPercent(data.athChangePercent)}
        </span>
      </td>
      <td className={styles.volumeCell}>{formatVolume(data.volume24h)}</td>
    </tr>
  );
}
