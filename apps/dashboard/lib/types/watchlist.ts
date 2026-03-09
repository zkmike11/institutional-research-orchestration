export interface WatchlistItem {
  symbol: string;
  color?: string;
}

export interface WatchlistGroup {
  id: string;
  name: string;
  items: WatchlistItem[];
}

export interface WatchlistState {
  benchmarks: WatchlistItem[];
  groups: WatchlistGroup[];
}

export const DEFAULT_WATCHLIST: WatchlistState = {
  benchmarks: [{ symbol: "^NDX", color: "#2e90fa" }],
  groups: [
    {
      id: "space",
      name: "SPACE",
      items: [
        { symbol: "PL", color: "#22c55e" },
        { symbol: "RKLB", color: "#22c55e" },
        { symbol: "ASTS", color: "#22c55e" },
        { symbol: "BKSY", color: "#22c55e" },
        { symbol: "LUNR", color: "#22c55e" },
      ],
    },
  ],
};
