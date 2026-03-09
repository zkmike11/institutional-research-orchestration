"use client";

import ColorBar from "@/components/shared/ColorBar";
import Sparkline from "@/components/shared/Sparkline";
import CompanyLogo from "./CompanyLogo";
import styles from "./WatchlistRow.module.css";

export interface WatchlistRowData {
  symbol: string;
  shortName: string;
  sector?: string;
  industry?: string;
  price: number;
  marketCap?: number;
  changePercents: {
    d1: number;
    w1: number;
    m1: number;
    y1: number;
    y3: number;
  };
  sparklineData: number[];
  fiftyTwoWeekHigh?: number;
  color?: string;
}

function formatMarketCap(value: number | undefined): string {
  if (value == null || value === 0) return "-";
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
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

interface WatchlistRowProps {
  data: WatchlistRowData;
}

export default function WatchlistRow({ data }: WatchlistRowProps) {
  const sparklineColor =
    data.sparklineData.length >= 2 && data.sparklineData[data.sparklineData.length - 1] >= data.sparklineData[0]
      ? "var(--sparkline-green)"
      : "var(--sparkline-red)";

  const fiftyTwoWeekDelta =
    data.fiftyTwoWeekHigh && data.fiftyTwoWeekHigh > 0
      ? ((data.price - data.fiftyTwoWeekHigh) / data.fiftyTwoWeekHigh) * 100
      : null;

  const subtitle = [data.sector, data.industry].filter(Boolean).join(" \u2014 ");

  const percentKeys: (keyof WatchlistRowData["changePercents"])[] = [
    "d1",
    "w1",
    "m1",
    "y1",
    "y3",
  ];

  return (
    <tr className={styles.row}>
      <td className={styles.colorBarCell}>
        <ColorBar color={data.color} />
      </td>
      <td className={styles.logoCell}>
        <CompanyLogo symbol={data.symbol} size={28} />
      </td>
      <td className={styles.tickerCell}>{data.symbol}</td>
      <td className={styles.companyCell}>
        <span className={styles.companyName}>{data.shortName}</span>
        {subtitle && <span className={styles.companySub}>{subtitle}</span>}
      </td>
      <td className={styles.priceCell}>
        ${data.price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td className={styles.mktCapCell}>{formatMarketCap(data.marketCap)}</td>
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
      <td className={styles.highCell}>
        {fiftyTwoWeekDelta != null ? (
          <span
            className={styles.highInner}
            style={{
              backgroundColor: percentBg(fiftyTwoWeekDelta),
              color: percentColor(fiftyTwoWeekDelta),
            }}
          >
            {formatPercent(fiftyTwoWeekDelta)}
          </span>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
}
