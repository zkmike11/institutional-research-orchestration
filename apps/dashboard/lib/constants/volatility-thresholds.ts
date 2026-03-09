export const VOLATILITY_METRICS = [
  {
    name: "VIX",
    symbol: "^VIX",
    description: "30-day implied volatility on S&P 500 options",
  },
  {
    name: "VIX/VIX3M",
    symbols: ["^VIX", "^VIX3M"],
    isRatio: true,
    description: "VIX / VIX3M — the 'Panic Ratio'. Compares 30-day vs 3-month implied volatility. Key level: ratio > 1.0 means backwardation (traders paying more for immediate protection than 3-month) — a mechanical sell signal indicating immediate panic mode. Ratio < 1.0 is normal contango.",
  },
  {
    name: "VXN",
    symbol: "^VXN",
    description: "NASDAQ-100 implied volatility",
  },
  {
    name: "MOVE",
    symbol: "TLT",
    isProxy: true,
    proxyLabel: "Bond Vol (TLT proxy)",
    description: "ICE BofA MOVE proxy — 20-day annualized realized vol of TLT",
  },
  {
    name: "SKEW",
    symbol: "^SKEW",
    description: "CBOE SKEW — measures perceived tail risk in S&P 500",
  },
  {
    name: "VVIX",
    symbol: "^VVIX",
    description: "Volatility of VIX — vol-of-vol metric",
  },
  {
    name: "Imp. Corr.",
    symbol: "^JCJ",
    fallbackDescription: "Sector ETF dispersion (inverted) as implied correlation proxy",
    description: "CBOE S&P 500 Implied Correlation Index",
  },
] as const;
