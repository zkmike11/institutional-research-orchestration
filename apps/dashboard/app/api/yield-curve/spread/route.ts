import { NextRequest, NextResponse } from "next/server";
import { getSpreadHistory } from "@/lib/fred";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { SpreadData } from "@/lib/types/yield-curve";

const PERIOD_DAYS: Record<string, number> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  "3Y": 1095,
};

function getYTDDays(): number {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((now.getTime() - jan1.getTime()) / 86_400_000);
}

export async function GET(request: NextRequest) {
  try {
    const pair = request.nextUrl.searchParams.get("pair") ?? "3M/10Y";
    const period = request.nextUrl.searchParams.get("period") ?? "3M";

    const daysBack = period === "YTD" ? getYTDDays() : (PERIOD_DAYS[period] ?? 90);
    const cacheKey = `spread:${pair}:${period}`;

    const cached = cache.get<SpreadData[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await getSpreadHistory(pair, daysBack);

    cache.set(cacheKey, data, CACHE_TTL.YIELD_CURVE);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /yield-curve/spread error:", error);
    return NextResponse.json(
      { error: "Failed to fetch spread data" },
      { status: 500 }
    );
  }
}
