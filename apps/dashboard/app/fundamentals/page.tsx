"use client";

import { useState } from "react";
import { useFundamentals } from "@/hooks/useFundamentals";
import type { FundamentalData } from "@/hooks/useFundamentals";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import { formatMarketCap, formatPercent } from "@/lib/format";
import styles from "./Fundamentals.module.css";

const DEFAULT_SYMBOLS = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA",
  "AVGO", "JPM", "V", "UNH", "LLY", "MA", "HD", "PG",
];

export default function FundamentalsPage() {
  const [input, setInput] = useState("");
  const [symbols, setSymbols] = useState(DEFAULT_SYMBOLS);
  const { data, loading, error } = useFundamentals(symbols);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const newSymbols = input
      .toUpperCase()
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !symbols.includes(s));
    if (newSymbols.length > 0) {
      setSymbols([...symbols, ...newSymbols]);
    }
    setInput("");
  }

  function formatValue(val: number | null, suffix = ""): string {
    if (val === null || val === undefined) return "-";
    return val.toFixed(2) + suffix;
  }

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Fundamentals</h1>
          <p className={styles.subtitle}>Key financial metrics</p>
        </div>
        <form onSubmit={handleAdd} className={styles.addForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add ticker (e.g. AAPL)"
            className={styles.input}
          />
          <button type="submit" className={styles.addBtn}>
            Add
          </button>
        </form>
      </div>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Sector</th>
              <th className={styles.numCol}>P/E</th>
              <th className={styles.numCol}>Fwd P/E</th>
              <th className={styles.numCol}>P/S</th>
              <th className={styles.numCol}>EPS</th>
              <th className={styles.numCol}>Revenue</th>
              <th className={styles.numCol}>Gross Margin</th>
              <th className={styles.numCol}>Net Margin</th>
              <th className={styles.numCol}>Div Yield</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row: FundamentalData) => (
              <tr key={row.symbol}>
                <td className={styles.symbol}>{row.symbol}</td>
                <td className={styles.name}>{row.shortName}</td>
                <td className={styles.sector}>{row.sector}</td>
                <td className={styles.numCol}>{formatValue(row.pe)}</td>
                <td className={styles.numCol}>{formatValue(row.forwardPe)}</td>
                <td className={styles.numCol}>{formatValue(row.ps)}</td>
                <td className={styles.numCol}>{formatValue(row.eps)}</td>
                <td className={styles.numCol}>
                  {row.revenue ? formatMarketCap(row.revenue) : "-"}
                </td>
                <td className={styles.numCol}>
                  {row.grossMargin !== null
                    ? formatPercent(row.grossMargin * 100)
                    : "-"}
                </td>
                <td className={styles.numCol}>
                  {row.netMargin !== null
                    ? formatPercent(row.netMargin * 100)
                    : "-"}
                </td>
                <td className={styles.numCol}>
                  {row.dividendYield !== null
                    ? formatPercent(row.dividendYield * 100)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
