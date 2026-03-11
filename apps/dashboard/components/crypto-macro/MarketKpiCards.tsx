"use client";

import type { CryptoMarketData } from "@/lib/types/crypto";
import { formatTvl } from "@/lib/format";
import styles from "./MarketKpiCards.module.css";

interface MarketKpiCardsProps {
  data: CryptoMarketData;
}

interface KpiCard {
  label: string;
  value: string;
}

function buildCards(data: CryptoMarketData): KpiCard[] {
  return [
    {
      label: "Total Market Cap",
      value: formatTvl(data.totalMarketCap),
    },
    {
      label: "BTC Dominance",
      value: `${data.btcDominance.toFixed(1)}%`,
    },
    {
      label: "ETH / BTC",
      value: data.ethBtcRatio.toFixed(4),
    },
    {
      label: "Stablecoin Supply",
      value: formatTvl(data.stablecoinMarketCap),
    },
  ];
}

export default function MarketKpiCards({ data }: MarketKpiCardsProps) {
  const cards = buildCards(data);

  return (
    <div className={styles.row}>
      {cards.map((card) => (
        <div key={card.label} className={styles.card}>
          <span className={styles.label}>{card.label}</span>
          <span className={styles.value}>{card.value}</span>
        </div>
      ))}
    </div>
  );
}
