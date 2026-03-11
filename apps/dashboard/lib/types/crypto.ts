/* ── Crypto Performance ─────────────────────────────────── */

export interface CryptoAssetConfig {
  symbol: string;        // Yahoo ticker: BTC-USD
  coingeckoId: string;   // CoinGecko ID: bitcoin
  name: string;
}

export interface CryptoMeta {
  id: string;
  symbol: string;
  name: string;
  image: string;
  marketCap: number;
  fullyDilutedValuation: number | null;
  totalVolume: number;
  ath: number;
  athChangePercentage: number;
  priceChangePercentage24h: number;
  currentPrice: number;
}

/* ── DeFi Overview ─────────────────────────────────────── */

export interface ChainTvl {
  name: string;
  tvl: number;
  tokenSymbol?: string;
}

export interface ProtocolFeeEntry {
  name: string;
  slug: string;
  category: string;
  fees24h: number;
  revenue24h: number;
  fees7dAvg: number;
  chains: string[];
}

export interface ProtocolTvlEntry {
  name: string;
  slug: string;
  category: string;
  tvl: number;
  change1d: number;
  change7d: number;
  chains: string[];
  logo: string;
}

export interface YieldPool {
  pool: string;
  project: string;
  chain: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  ilRisk: boolean;
  stablecoin: boolean;
}

export interface DefiOverviewData {
  chains: ChainTvl[];
  feeLeaders: ProtocolFeeEntry[];
  tvlLeaders: ProtocolTvlEntry[];
}

/* ── Protocol Deep Dive ────────────────────────────────── */

export interface ProtocolDetail {
  name: string;
  slug: string;
  category: string;
  chains: string[];
  tvl: number;
  fees24h: number | null;
  revenue24h: number | null;
  tvlHistory: { date: number; tvl: number }[];
  feeHistory: { date: number; fees: number; revenue: number }[];
  yields: YieldPool[];
}

export interface GovernanceProposal {
  id: string;
  title: string;
  state: string;
  votes: number;
  scoresTotal: number;
  start: number;
  end: number;
}

export interface GovernanceSummary {
  proposals: GovernanceProposal[];
  voterConcentration: {
    topVoterPct: number;
    top5Pct: number;
    totalVp: number;
  } | null;
}

/* ── Crypto Macro ──────────────────────────────────────── */

export interface CryptoMarketData {
  totalMarketCap: number;
  btcDominance: number;
  ethBtcRatio: number;
  stablecoinMarketCap: number;
  topCoins: {
    id: string;
    symbol: string;
    name: string;
    marketCap: number;
    priceChangePercent24h: number;
    currentPrice: number;
  }[];
}
