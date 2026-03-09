"use client";

import { useState, useEffect, useMemo } from "react";
import Sparkline from "@/components/shared/Sparkline";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import styles from "./RiskReward.module.css";

interface HistoricalPoint {
  date: string;
  close: number;
}

const SYMBOLS = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "QQQ", name: "Nasdaq 100" },
  { symbol: "IWM", name: "Russell 2000" },
  { symbol: "EFA", name: "Intl Developed" },
  { symbol: "EEM", name: "Emerging Markets" },
  { symbol: "TLT", name: "Long-Term Bonds" },
  { symbol: "GLD", name: "Gold" },
];

function dailyReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

function annualizedReturn(prices: number[]): number {
  if (prices.length < 2) return 0;
  const totalReturn = prices[prices.length - 1] / prices[0] - 1;
  const years = prices.length / 252;
  return (Math.pow(1 + totalReturn, 1 / years) - 1) * 100;
}

function annualizedVol(returns: number[]): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

function sharpeRatio(annReturn: number, annVol: number, riskFree = 4.5): number {
  if (annVol === 0) return 0;
  return (annReturn - riskFree) / annVol;
}

function maxDrawdown(prices: number[]): number {
  let peak = prices[0];
  let maxDD = 0;
  for (const p of prices) {
    if (p > peak) peak = p;
    const dd = (peak - p) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD * 100;
}

export default function RiskRewardPage() {
  const [data, setData] = useState<Map<string, HistoricalPoint[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled(
          SYMBOLS.map(async (s) => {
            const res = await fetch(`/api/historical?symbol=${s.symbol}&range=1y`);
            if (!res.ok) throw new Error(`Failed: ${res.status}`);
            const json = await res.json();
            return { symbol: s.symbol, data: json as HistoricalPoint[] };
          })
        );
        if (!cancelled) {
          const map = new Map<string, HistoricalPoint[]>();
          for (const r of results) {
            if (r.status === "fulfilled") {
              map.set(r.value.symbol, r.value.data);
            }
          }
          setData(map);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const metrics = useMemo(() => {
    return SYMBOLS.map((s) => {
      const hist = data.get(s.symbol) ?? [];
      const prices = hist.map((h) => h.close);
      const returns = dailyReturns(prices);
      const annRet = annualizedReturn(prices);
      const annV = annualizedVol(returns);
      return {
        ...s,
        prices,
        annualizedReturn: annRet,
        annualizedVol: annV,
        sharpe: sharpeRatio(annRet, annV),
        maxDrawdown: maxDrawdown(prices),
      };
    });
  }, [data]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Risk / Reward</h1>
          <p className={styles.subtitle}>1-year risk-adjusted return metrics</p>
        </div>
      </div>
      <div className={styles.grid}>
        {metrics.map((m) => (
          <div key={m.symbol} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.symbol}>{m.symbol}</span>
              <span className={styles.name}>{m.name}</span>
            </div>
            <div className={styles.sparkline}>
              <Sparkline
                data={m.prices}
                color={m.annualizedReturn >= 0 ? "var(--positive)" : "var(--negative)"}
                width={240}
                height={80}
                filled
                strokeWidth={1.5}
              />
            </div>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Ann. Return</span>
                <span
                  className={styles.statValue}
                  style={{
                    color: m.annualizedReturn >= 0 ? "var(--positive)" : "var(--negative)",
                  }}
                >
                  {m.annualizedReturn >= 0 ? "+" : ""}
                  {m.annualizedReturn.toFixed(1)}%
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Volatility</span>
                <span className={styles.statValue}>
                  {m.annualizedVol.toFixed(1)}%
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Sharpe</span>
                <span className={styles.statValue}>
                  {m.sharpe.toFixed(2)}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Max DD</span>
                <span className={styles.statValue} style={{ color: "var(--negative)" }}>
                  -{m.maxDrawdown.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
