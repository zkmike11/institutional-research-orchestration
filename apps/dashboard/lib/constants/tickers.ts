export const SCANNER_CONFIG = {
  EQUITIES: {
    name: "EQUITIES",
    color: "#3b82f6",
    assets: [
      { symbol: "^GSPC", name: "S&P 500", ticker: "^GSPC" },
      { symbol: "^NDX", name: "NASDAQ 100", ticker: "^NDX" },
      { symbol: "^RUT", name: "Russell 2000", ticker: "^RUT" },
      { symbol: "ACWI", name: "MSCI ACWI", ticker: "ACWI" },
    ],
  },
  RATES: {
    name: "RATES",
    color: "#3b82f6",
    assets: [
      { symbol: "^IRX", name: "3-Month T-Bill", ticker: "^IRX" },
      { symbol: "^TNX", name: "10-Year Treasury", ticker: "^TNX" },
      { symbol: "^TYX", name: "30-Year Treasury", ticker: "^TYX" },
    ],
  },
  CURRENCIES: {
    name: "CURRENCIES",
    color: "#22c55e",
    assets: [
      { symbol: "DX-Y.NYB", name: "US Dollar Index", ticker: "DX-Y.NYB" },
      { symbol: "JPY=X", name: "USD/JPY", ticker: "USDJPY=X" },
      { symbol: "EURUSD=X", name: "EUR/USD", ticker: "EURUSD=X" },
    ],
  },
  COMMODITIES: {
    name: "COMMODITIES",
    color: "#22c55e",
    assets: [
      { symbol: "CL=F", name: "Crude Oil WTI", ticker: "CL=F" },
      { symbol: "GC=F", name: "Gold", ticker: "GC=F" },
      { symbol: "HG=F", name: "Copper", ticker: "HG=F" },
    ],
  },
  CREDIT: {
    name: "CREDIT",
    color: "#22c55e",
    assets: [
      { symbol: "LQD", name: "IG Corporate Bonds", ticker: "LQD" },
      { symbol: "HYG", name: "High Yield Bonds", ticker: "HYG" },
    ],
  },
  GLOBAL_ANCHORS: {
    name: "GLOBAL ANCHORS",
    color: "#3b82f6",
    assets: [
      { symbol: "BTC-USD", name: "Bitcoin", ticker: "BTC-USD" },
    ],
  },
} as const;

export const VOLATILITY_SYMBOLS = {
  VIX: "^VIX",
  VIX3M: "^VIX3M",
  VXN: "^VXN",
  SKEW: "^SKEW",
  VVIX: "^VVIX",
  MOVE_PROXY: "TLT",
  IMP_CORR: "^JCJ",
} as const;
