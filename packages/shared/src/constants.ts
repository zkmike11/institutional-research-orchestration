export const AGENT_ROLES = [
  { name: "Tokenomics Analyst", category: "data_gathering" },
  { name: "Governance Analyst", category: "data_gathering" },
  { name: "On-Chain Analyst", category: "data_gathering" },
  { name: "Competitive Intel", category: "data_gathering" },
  { name: "Field Intel", category: "data_gathering" },
  { name: "Risk Officer", category: "critical_analysis" },
  { name: "Maturation Scorer", category: "critical_analysis" },
  { name: "Knowledge Agent", category: "critical_analysis" },
  { name: "Portfolio Manager", category: "critical_analysis" },
  { name: "Legal Structure", category: "critical_analysis" },
  { name: "Devil's Advocate", category: "critical_analysis" },
  { name: "Report Writer", category: "synthesis" },
  { name: "Committee Chair", category: "synthesis" },
] as const;

export const DATA_SOURCES = {
  defillama: { name: "DefiLlama", baseUrl: "https://api.llama.fi", requiresKey: false },
  coingecko: { name: "CoinGecko", baseUrl: "https://api.coingecko.com/api/v3", requiresKey: false },
  snapshot: { name: "Snapshot", baseUrl: "https://hub.snapshot.org/graphql", requiresKey: false },
  etherscan: { name: "Etherscan", baseUrl: "https://api.etherscan.io/api", requiresKey: true },
} as const;
