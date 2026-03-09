import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";
import {
  SECTOR_ETFS,
  INDUSTRY_ETFS,
  FACTOR_ETFS,
  ROTATION_PAIRS,
} from "@/lib/constants/sectors";
import type { SectorPerformance } from "@/lib/types/market";

type SectorType = "sectors" | "industries" | "factors" | "rotation";

function getTickersForType(type: SectorType) {
  switch (type) {
    case "sectors":
      return SECTOR_ETFS;
    case "industries":
      return INDUSTRY_ETFS;
    case "factors":
      return FACTOR_ETFS;
    case "rotation":
      return ROTATION_PAIRS;
    default:
      return SECTOR_ETFS;
  }
}

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("mode") ?? "outright";
    const period = request.nextUrl.searchParams.get("period") ?? "1D";
    const type = (request.nextUrl.searchParams.get("type") ?? "sectors") as SectorType;

    const cacheKey = `sectors:${type}:${mode}:${period}`;
    const cached = cache.get<SectorPerformance[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const config = getTickersForType(type);

    // Collect all tickers we need to fetch
    const tickersToFetch: string[] = [];
    if (type === "rotation") {
      for (const pair of ROTATION_PAIRS) {
        tickersToFetch.push(pair.numerator);
        tickersToFetch.push(pair.denominator);
      }
    } else {
      for (const item of config) {
        tickersToFetch.push((item as { ticker: string }).ticker);
      }
    }

    // Always fetch SPY for vs_spy mode
    if (mode === "vs_spy" && !tickersToFetch.includes("SPY")) {
      tickersToFetch.push("SPY");
    }

    const uniqueTickers = [...new Set(tickersToFetch)];
    const quotes = await getQuotes(uniqueTickers);
    const quoteMap = new Map(quotes.map((q) => [q?.symbol, q]));

    const spyChange = quoteMap.get("SPY")?.regularMarketChangePercent ?? 0;

    let result: SectorPerformance[];

    if (type === "rotation") {
      result = ROTATION_PAIRS.map((pair) => {
        const numQuote = quoteMap.get(pair.numerator);
        const denQuote = quoteMap.get(pair.denominator);
        const numChange = numQuote?.regularMarketChangePercent ?? 0;
        const denChange = denQuote?.regularMarketChangePercent ?? 0;
        const relativeChange = numChange - denChange;

        return {
          name: pair.name,
          ticker: `${pair.numerator}/${pair.denominator}`,
          etfSymbol: pair.numerator,
          change: relativeChange,
          changePercent: relativeChange,
        };
      });
    } else {
      result = (config as readonly { name: string; ticker: string }[]).map((item) => {
        const quote = quoteMap.get(item.ticker);
        const rawChange = quote?.regularMarketChangePercent ?? 0;
        const changePercent = mode === "vs_spy" ? rawChange - spyChange : rawChange;

        return {
          name: item.name,
          ticker: item.ticker,
          etfSymbol: item.ticker,
          change: quote?.regularMarketChange ?? 0,
          changePercent,
        };
      });
    }

    cache.set(cacheKey, result, CACHE_TTL.QUOTES);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] /sectors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sector data" },
      { status: 500 }
    );
  }
}
