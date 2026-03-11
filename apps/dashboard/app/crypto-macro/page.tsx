"use client";

import { useCryptoMarket } from "@/hooks/useCryptoMarket";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import MarketKpiCards from "@/components/crypto-macro/MarketKpiCards";
import DominanceChart from "@/components/crypto-macro/DominanceChart";
import StablecoinChart from "@/components/crypto-macro/StablecoinChart";
import MarketCapTreemap from "@/components/crypto-macro/MarketCapTreemap";
import styles from "./CryptoMacro.module.css";

export default function CryptoMacroPage() {
  const { data, loading, error } = useCryptoMarket();

  const isLoading = loading && data.totalMarketCap === 0;

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Macro</h1>
        <p className={styles.subtitle}>Crypto market structure</p>
      </header>

      <MarketKpiCards data={data} />

      <div className={styles.grid}>
        <DominanceChart />
        <MarketCapTreemap coins={data.topCoins} />
      </div>

      <StablecoinChart marketCap={data.stablecoinMarketCap} />
    </div>
  );
}
