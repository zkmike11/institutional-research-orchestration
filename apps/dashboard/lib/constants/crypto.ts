import type { CryptoAssetConfig } from "@/lib/types/crypto";

export const CRYPTO_WATCHLIST: Record<string, { name: string; assets: CryptoAssetConfig[] }> = {
  BENCHMARKS: {
    name: "BENCHMARKS",
    assets: [
      { symbol: "BTC-USD", coingeckoId: "bitcoin", name: "Bitcoin" },
      { symbol: "ETH-USD", coingeckoId: "ethereum", name: "Ethereum" },
    ],
  },
  L1S: {
    name: "L1s",
    assets: [
      { symbol: "SOL-USD", coingeckoId: "solana", name: "Solana" },
      { symbol: "AVAX-USD", coingeckoId: "avalanche-2", name: "Avalanche" },
      { symbol: "SUI20947-USD", coingeckoId: "sui", name: "Sui" },
      { symbol: "APT21794-USD", coingeckoId: "aptos", name: "Aptos" },
      { symbol: "NEAR-USD", coingeckoId: "near", name: "NEAR Protocol" },
    ],
  },
  DEFI: {
    name: "DeFi Blue Chips",
    assets: [
      { symbol: "UNI7083-USD", coingeckoId: "uniswap", name: "Uniswap" },
      { symbol: "AAVE-USD", coingeckoId: "aave", name: "Aave" },
      { symbol: "MKR-USD", coingeckoId: "maker", name: "Maker" },
      { symbol: "LDO-USD", coingeckoId: "lido-dao", name: "Lido DAO" },
      { symbol: "LINK-USD", coingeckoId: "chainlink", name: "Chainlink" },
    ],
  },
  L2S: {
    name: "L2s / Scaling",
    assets: [
      { symbol: "OP-USD", coingeckoId: "optimism", name: "Optimism" },
      { symbol: "ARB11841-USD", coingeckoId: "arbitrum", name: "Arbitrum" },
      { symbol: "POL-USD", coingeckoId: "matic-network", name: "Polygon" },
    ],
  },
};

/** Map Yahoo ticker → CoinGecko ID for supplementary data */
export const COINGECKO_ID_MAP: Record<string, string> = Object.values(CRYPTO_WATCHLIST)
  .flatMap((g) => g.assets)
  .reduce(
    (acc, a) => {
      acc[a.symbol] = a.coingeckoId;
      return acc;
    },
    {} as Record<string, string>
  );

/** All Yahoo symbols for batch quote fetching */
export const ALL_CRYPTO_SYMBOLS = Object.values(CRYPTO_WATCHLIST).flatMap((g) =>
  g.assets.map((a) => a.symbol)
);

/** All CoinGecko IDs for batch meta fetching */
export const ALL_COINGECKO_IDS = Object.values(CRYPTO_WATCHLIST).flatMap((g) =>
  g.assets.map((a) => a.coingeckoId)
);

/** Chain colors for TVL chart */
export const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "#627eea",
  Solana: "#9945ff",
  BSC: "#f0b90b",
  Arbitrum: "#28a0f0",
  Base: "#0052ff",
  Optimism: "#ff0420",
  Avalanche: "#e84142",
  Polygon: "#8247e5",
  Tron: "#ff0013",
  Sui: "#4da2ff",
};

/** Snapshot space IDs for governance lookup */
export const SNAPSHOT_SPACES: Record<string, string> = {
  aave: "aave.eth",
  uniswap: "uniswapgovernance.eth",
  maker: "makerdao.eth",
  "lido-dao": "lido-snapshot.eth",
  arbitrum: "arbitrumfoundation.eth",
  optimism: "opcollective.eth",
};
