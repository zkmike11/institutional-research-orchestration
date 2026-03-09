import { NextRequest, NextResponse } from "next/server";
import { getHistorical } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";

const PERIOD_TO_RANGE: Record<string, string> = {
  "1D": "5d",
  "1W": "1m",
  "1M": "3m",
  "3M": "6m",
  "6M": "1y",
  "YTD": "ytd",
  "1Y": "1y",
  "3Y": "5y",
};

interface HistoryPoint {
  time: string;
  value: number;
}

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get("symbol") ?? "^VIX";
    const period = request.nextUrl.searchParams.get("period") ?? "1Y";
    const range = PERIOD_TO_RANGE[period] ?? "1y";

    const cacheKey = `vol-history:${symbol}:${period}`;
    const cached = cache.get<HistoryPoint[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const historical = await getHistorical(symbol, range);
    const data: HistoryPoint[] = historical.map((d) => ({
      time: d.date,
      value: d.close,
    }));

    cache.set(cacheKey, data, CACHE_TTL.HISTORICAL);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /volatility/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch volatility history" },
      { status: 500 }
    );
  }
}
