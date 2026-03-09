import { NextRequest, NextResponse } from "next/server";
import { getHistorical } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json(
        { error: "Missing required query param: symbol" },
        { status: 400 }
      );
    }

    const range = request.nextUrl.searchParams.get("range") ?? "1y";
    const cacheKey = `historical:${symbol}:${range}`;
    const cached = cache.get<{ date: string; close: number }[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await getHistorical(symbol, range);

    cache.set(cacheKey, data, CACHE_TTL.HISTORICAL);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /historical error:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    );
  }
}
