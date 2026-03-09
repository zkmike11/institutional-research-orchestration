"use client";

import { createContext, useContext } from "react";
import type { WatchlistState } from "@/lib/types/watchlist";

export interface WatchlistContextValue {
  state: WatchlistState;
  addBenchmark: (symbol: string) => void;
  removeBenchmark: (symbol: string) => void;
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
  addToGroup: (groupId: string, symbol: string, color?: string) => void;
  removeFromGroup: (groupId: string, symbol: string) => void;
}

export const WatchlistContext = createContext<WatchlistContextValue | undefined>(
  undefined
);

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return ctx;
}
