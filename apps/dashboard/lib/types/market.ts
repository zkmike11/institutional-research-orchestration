export interface Quote {
  symbol: string;
  shortName: string;
  longName?: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  currency?: string;
  sector?: string;
  industry?: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ScannerAsset {
  symbol: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  sparklineData: number[];
  category: string;
}

export interface ScannerCategory {
  name: string;
  color: string;
  assets: ScannerAsset[];
}

export interface SectorPerformance {
  name: string;
  ticker: string;
  etfSymbol: string;
  change: number;
  changePercent: number;
  sigma?: number;
  sparklineData?: number[];
}

export interface TopMover {
  symbol: string;
  shortName: string;
  sector: string;
  industry: string;
  price: number;
  changePercent: number;
  z20?: number;
  z200?: number;
}

export interface RatioChartData {
  name: string;
  subtitle: string;
  color: string;
  data: { time: string; value: number }[];
}

export interface CompanyInfo {
  symbol: string;
  shortName: string;
  longName: string;
  sector: string;
  industry: string;
  marketCap: number;
  logo?: string;
}

export type TimePeriod = "1D" | "1W" | "1M" | "3M" | "6M" | "YTD" | "1Y" | "3Y";

export type ViewMode = "outright" | "vs_spy";

export type ChartViewMode = "bars" | "lines";
