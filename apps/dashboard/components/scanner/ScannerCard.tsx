"use client";

import ScannerRow from "./ScannerRow";
import styles from "./ScannerCard.module.css";

interface ScannerAssetData {
  symbol: string;
  name: string;
  ticker: string;
  price: number;
  changePercent: number;
  sparklineData: number[];
}

interface ScannerCardProps {
  name: string;
  color: string;
  assets: ScannerAssetData[];
}

export default function ScannerCard({ name, color, assets }: ScannerCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header} style={{ color }}>
        {name}
      </div>
      {assets.map((asset) => (
        <ScannerRow
          key={asset.symbol}
          name={asset.name}
          ticker={asset.ticker}
          price={asset.price}
          changePercent={asset.changePercent}
          sparklineData={asset.sparklineData}
        />
      ))}
    </div>
  );
}
