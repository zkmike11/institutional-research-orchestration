import { NextRequest, NextResponse } from "next/server";
import { getQuotes, getHistorical } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";
import { SCANNER_CONFIG } from "@/lib/constants/tickers";
import type { ScannerCategory } from "@/lib/types/market";

const PERIOD_TO_RANGE: Record<string, string> = {
  "1D": "5d",
  "1W": "1m",
  "1M": "3m",
  "3M": "6m",
  "6M": "1y",
  "YTD": "ytd",
  "1Y": "1y",
};

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get("period") ?? "1D";
    const cacheKey = `scanner:${period}`;
    const cached = cache.get<ScannerCategory[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Flatten all symbols from every category
    const allSymbols: string[] = [];
    const categories = Object.values(SCANNER_CONFIG);
    for (const category of categories) {
      for (const asset of category.assets) {
        allSymbols.push(asset.symbol);
      }
    }

    // Fetch quotes in a single batch
    const quotes = await getQuotes(allSymbols);
    const quoteMap = new Map(quotes.map((q) => [q?.symbol, q]));

    // Fetch sparkline historical data for each symbol
    const sparklineRange = PERIOD_TO_RANGE[period] ?? "5d";
    const historicals = await Promise.allSettled(
      allSymbols.map((symbol) => getHistorical(symbol, sparklineRange))
    );
    const sparklineMap = new Map<string, number[]>();
    allSymbols.forEach((symbol, i) => {
      const result = historicals[i];
      if (result.status === "fulfilled" && result.value.length > 0) {
        sparklineMap.set(symbol, result.value.map((d) => d.close));
      } else {
        if (result.status === "rejected") {
          console.warn(`[API] /scanner sparkline failed for ${symbol}:`, result.reason?.message ?? result.reason);
        }
        sparklineMap.set(symbol, []);
      }
    });

    // Build response grouped by category
    const response: ScannerCategory[] = categories.map((category) => ({
      name: category.name,
      color: category.color,
      assets: category.assets.map((asset) => {
        const quote = quoteMap.get(asset.symbol);
        return {
          symbol: asset.symbol,
          name: asset.name,
          ticker: asset.ticker,
          price: quote?.regularMarketPrice ?? 0,
          change: quote?.regularMarketChange ?? 0,
          changePercent: quote?.regularMarketChangePercent ?? 0,
          sparklineData: sparklineMap.get(asset.symbol) ?? [],
          category: category.name,
        };
      }),
    }));

    cache.set(cacheKey, response, CACHE_TTL.QUOTES);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] /scanner error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scanner data" },
      { status: 500 }
    );
  }
}
