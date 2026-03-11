import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/cache";
import { getEarningsData } from "@/lib/yahoo";

const EARNINGS_TTL = 3_600_000; // 1 hour

/** Watchlist of individual equities to track earnings for */
const EARNINGS_WATCHLIST = [
  "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA",
  "AVGO", "JPM", "V", "UNH", "LLY", "MA", "HD", "PG",
];

export interface EarningsEntry {
  symbol: string;
  name: string;
  earningsDate: string | null; // ISO date
  epsEstimate: number | null;
  revenueEstimate: number | null;
  marketCap: number;
}

export async function GET(_request: NextRequest) {
  try {
    const cacheKey = "earnings";
    const cached = cache.get<EarningsEntry[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const entries = await getEarningsData(EARNINGS_WATCHLIST);

    // Sort by earnings date (nearest first), nulls at end
    entries.sort((a, b) => {
      if (!a.earningsDate && !b.earningsDate) return 0;
      if (!a.earningsDate) return 1;
      if (!b.earningsDate) return -1;
      return a.earningsDate.localeCompare(b.earningsDate);
    });

    cache.set(cacheKey, entries, EARNINGS_TTL);
    return NextResponse.json(entries);
  } catch (error) {
    console.error("[API] /earnings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings data" },
      { status: 500 }
    );
  }
}
