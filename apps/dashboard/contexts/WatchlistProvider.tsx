"use client";

import { useReducer, useEffect, type ReactNode } from "react";
import type { WatchlistState, WatchlistItem } from "@/lib/types/watchlist";
import { DEFAULT_WATCHLIST } from "@/lib/types/watchlist";
import { WatchlistContext } from "./WatchlistContext";

const STORAGE_KEY = "dashboard-watchlist";

type WatchlistAction =
  | { type: "ADD_BENCHMARK"; symbol: string }
  | { type: "REMOVE_BENCHMARK"; symbol: string }
  | { type: "ADD_GROUP"; name: string }
  | { type: "REMOVE_GROUP"; id: string }
  | { type: "ADD_TO_GROUP"; groupId: string; symbol: string; color?: string }
  | { type: "REMOVE_FROM_GROUP"; groupId: string; symbol: string };

function watchlistReducer(
  state: WatchlistState,
  action: WatchlistAction
): WatchlistState {
  switch (action.type) {
    case "ADD_BENCHMARK": {
      if (state.benchmarks.some((b) => b.symbol === action.symbol)) {
        return state;
      }
      return {
        ...state,
        benchmarks: [...state.benchmarks, { symbol: action.symbol }],
      };
    }
    case "REMOVE_BENCHMARK": {
      return {
        ...state,
        benchmarks: state.benchmarks.filter((b) => b.symbol !== action.symbol),
      };
    }
    case "ADD_GROUP": {
      const id = action.name.toLowerCase().replace(/\s+/g, "-");
      if (state.groups.some((g) => g.id === id)) {
        return state;
      }
      return {
        ...state,
        groups: [...state.groups, { id, name: action.name, items: [] }],
      };
    }
    case "REMOVE_GROUP": {
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.id),
      };
    }
    case "ADD_TO_GROUP": {
      return {
        ...state,
        groups: state.groups.map((g) => {
          if (g.id !== action.groupId) return g;
          if (g.items.some((i) => i.symbol === action.symbol)) return g;
          const item: WatchlistItem = { symbol: action.symbol };
          if (action.color) item.color = action.color;
          return { ...g, items: [...g.items, item] };
        }),
      };
    }
    case "REMOVE_FROM_GROUP": {
      return {
        ...state,
        groups: state.groups.map((g) => {
          if (g.id !== action.groupId) return g;
          return {
            ...g,
            items: g.items.filter((i) => i.symbol !== action.symbol),
          };
        }),
      };
    }
    default:
      return state;
  }
}

function loadInitialState(): WatchlistState {
  if (typeof window === "undefined") {
    return DEFAULT_WATCHLIST;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as WatchlistState) : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(watchlistReducer, null, loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable
    }
  }, [state]);

  const addBenchmark = (symbol: string) =>
    dispatch({ type: "ADD_BENCHMARK", symbol });

  const removeBenchmark = (symbol: string) =>
    dispatch({ type: "REMOVE_BENCHMARK", symbol });

  const addGroup = (name: string) =>
    dispatch({ type: "ADD_GROUP", name });

  const removeGroup = (id: string) =>
    dispatch({ type: "REMOVE_GROUP", id });

  const addToGroup = (groupId: string, symbol: string, color?: string) =>
    dispatch({ type: "ADD_TO_GROUP", groupId, symbol, color });

  const removeFromGroup = (groupId: string, symbol: string) =>
    dispatch({ type: "REMOVE_FROM_GROUP", groupId, symbol });

  return (
    <WatchlistContext.Provider
      value={{
        state,
        addBenchmark,
        removeBenchmark,
        addGroup,
        removeGroup,
        addToGroup,
        removeFromGroup,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}
