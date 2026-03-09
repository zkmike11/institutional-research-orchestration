import { NextRequest, NextResponse } from "next/server";
import { getQuotes, getHistorical } from "@/lib/yahoo";
import { zScore } from "@/lib/calculations";
import { cache, CACHE_TTL } from "@/lib/cache";

const INDEX_TICKERS: Record<string, string[]> = {
  ndx: [
    "AAPL", "MSFT", "AMZN", "NVDA", "META", "GOOGL", "GOOG", "TSLA", "AVGO",
    "COST", "NFLX", "AMD", "ADBE", "PEP", "CSCO", "INTC", "CMCSA", "TMUS",
    "AMGN", "INTU", "TXN", "ISRG", "QCOM", "HON", "AMAT", "BKNG", "LRCX",
    "ADP", "SBUX", "MU", "ADI", "MDLZ", "REGN", "GILD", "VRTX", "SNPS",
    "CDNS", "PANW", "KLAC", "PYPL", "MELI", "CRWD", "MNST", "FTNT", "ABNB",
    "CEG", "KHC", "DASH", "GEHC", "MRVL", "ZS", "WBD", "MAR", "TEAM", "CCEP",
    "ALNY", "INSM", "AXON",
  ],
  spx: [
    "AAPL", "MSFT", "AMZN", "NVDA", "META", "GOOGL", "TSLA", "AVGO", "BRK-B",
    "JPM", "LLY", "UNH", "V", "XOM", "MA", "JNJ", "PG", "HD", "COST", "ABBV",
    "MRK", "NFLX", "CRM", "BAC", "AMD", "KO", "PEP", "CVX", "TMO", "WMT",
    "LIN", "ADBE", "MCD", "CSCO", "ACN", "ABT", "DHR", "TXN", "PM", "NEE",
  ],
  rut: [
    "SMCI", "MSTR", "LUMN", "SFM", "DJT", "CORT", "CVNA", "HIMS", "DUOL",
    "INSM", "FN", "MEDP", "COOP", "ANF", "LNTH", "CARG", "BURL", "SKY",
    "CRS", "PNFP",
  ],
  djia: [
    "AAPL", "MSFT", "AMZN", "NVDA", "JPM", "V", "UNH", "HD", "PG", "JNJ",
    "MRK", "KO", "CRM", "CSCO", "MCD", "DIS", "VZ", "NKE", "IBM", "GS",
    "CAT", "BA", "AXP", "MMM", "WMT", "DOW", "TRV", "HON", "AMGN", "CVX",
  ],
};

function mapMover(q: Record<string, unknown>) {
  return {
    symbol: q.symbol as string,
    shortName: q.shortName as string,
    sector: (q as Record<string, unknown>).sector as string | undefined,
    industry: (q as Record<string, unknown>).industry as string | undefined,
    price: q.regularMarketPrice as number,
    changePercent: q.regularMarketChangePercent as number,
    marketCap: q.marketCap as number | undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const index = request.nextUrl.searchParams.get("index") ?? "ndx";
    const period = request.nextUrl.searchParams.get("period") ?? "1D";

    const cacheKey = `top-movers:${index}:${period}`;
    const cached = cache.get<{ gainers: unknown[]; losers: unknown[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const tickers = INDEX_TICKERS[index] ?? INDEX_TICKERS.ndx;
    const quotes = await getQuotes(tickers);

    const sorted = quotes
      .filter((q) => q !== null)
      .sort(
        (a, b) =>
          (b?.regularMarketChangePercent ?? 0) -
          (a?.regularMarketChangePercent ?? 0)
      );

    const topGainers = sorted.slice(0, 10);
    const topLosers = sorted.slice(-10).reverse();
    const topSymbols = [...topGainers, ...topLosers].map((q) => q?.symbol).filter(Boolean) as string[];

    // Fetch 200-day historical for Z-score calculations (batched, best-effort)
    const zScoreMap = new Map<string, { z20?: number; z200?: number }>();
    const histResults = await Promise.allSettled(
      topSymbols.map(async (sym) => {
        const hist = await getHistorical(sym, "1y");
        const closes = hist.map((h) => h.close);
        if (closes.length < 20) return { sym, z20: undefined, z200: undefined };
        const current = closes[closes.length - 1];
        const z20 = closes.length >= 20 ? zScore(current, closes.slice(-20)) : undefined;
        const z200 = closes.length >= 200 ? zScore(current, closes.slice(-200)) : undefined;
        return { sym, z20, z200 };
      })
    );

    for (const r of histResults) {
      if (r.status === "fulfilled" && r.value) {
        zScoreMap.set(r.value.sym, { z20: r.value.z20, z200: r.value.z200 });
      }
    }

    const gainers = topGainers.map((q) => {
      const base = mapMover(q as unknown as Record<string, unknown>);
      const zs = zScoreMap.get(base.symbol);
      return { ...base, z20: zs?.z20, z200: zs?.z200 };
    });

    const losers = topLosers.map((q) => {
      const base = mapMover(q as unknown as Record<string, unknown>);
      const zs = zScoreMap.get(base.symbol);
      return { ...base, z20: zs?.z20, z200: zs?.z200 };
    });

    const data = { gainers, losers };

    cache.set(cacheKey, data, CACHE_TTL.QUOTES);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /top-movers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top movers" },
      { status: 500 }
    );
  }
}
