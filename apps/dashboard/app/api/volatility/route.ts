import { NextRequest, NextResponse } from "next/server";
import { getQuotes, getHistorical } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";
import { dailyReturns, annualizedVolatility } from "@/lib/calculations";
import {
  classifyVIX,
  classifyVIXRatio,
  classifyVXN,
  classifyMOVE,
  classifySKEW,
  classifyVVIX,
  classifyImpliedCorrelation,
} from "@/lib/regime";
import type { VolatilityMetric } from "@/lib/types/volatility";

export async function GET(_request: NextRequest) {
  try {
    const cacheKey = "volatility";
    const cached = cache.get<VolatilityMetric[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch quotes for all volatility symbols
    const volSymbols = ["^VIX", "^VIX3M", "^VXN", "^SKEW", "^VVIX"];
    const quotes = await getQuotes(volSymbols);
    const quoteMap = new Map(quotes.map((q) => [q?.symbol, q]));

    const vixQuote = quoteMap.get("^VIX");
    const vix3mQuote = quoteMap.get("^VIX3M");
    const vxnQuote = quoteMap.get("^VXN");
    const skewQuote = quoteMap.get("^SKEW");
    const vvixQuote = quoteMap.get("^VVIX");

    const vixPrice = vixQuote?.regularMarketPrice ?? 0;
    const vix3mPrice = vix3mQuote?.regularMarketPrice ?? 0;
    const vixRatio = vix3mPrice !== 0 ? vixPrice / vix3mPrice : 0;

    // Fetch TLT 1-month historical for MOVE proxy (annualized vol of TLT)
    let moveProxy = 0;
    try {
      const tltHistorical = await getHistorical("TLT", "1m");
      if (tltHistorical.length > 1) {
        const closes = tltHistorical.map((d) => d.close);
        const returns = dailyReturns(closes);
        moveProxy = annualizedVolatility(returns);
      }
    } catch {
      // Fall back to placeholder
      moveProxy = 90;
    }

    // Try to fetch implied correlation
    let impCorrValue = 30; // placeholder
    try {
      const jcjQuotes = await getQuotes(["^JCJ"]);
      if (jcjQuotes.length > 0 && jcjQuotes[0]) {
        impCorrValue = jcjQuotes[0].regularMarketPrice;
      }
    } catch {
      // Keep placeholder
    }

    // Fetch short historical for sparklines (1 week)
    const sparklineSymbols = ["^VIX", "^VIX3M", "^VXN", "^SKEW", "^VVIX"];
    const sparklineResults = await Promise.allSettled(
      sparklineSymbols.map((s) => getHistorical(s, "1m"))
    );
    const sparklineMap = new Map<string, number[]>();
    sparklineSymbols.forEach((symbol, i) => {
      const result = sparklineResults[i];
      if (result.status === "fulfilled" && result.value.length > 0) {
        sparklineMap.set(symbol, result.value.map((d) => d.close));
      } else {
        if (result.status === "rejected") {
          console.warn(`[API] /volatility sparkline failed for ${symbol}:`, result.reason?.message ?? result.reason);
        }
        sparklineMap.set(symbol, []);
      }
    });

    const metrics: VolatilityMetric[] = [
      {
        name: "VIX",
        symbol: "^VIX",
        value: vixPrice,
        change: vixQuote?.regularMarketChange ?? 0,
        regime: classifyVIX(vixPrice),
        sparklineData: sparklineMap.get("^VIX") ?? [],
        description: "CBOE Volatility Index — measures 30-day implied volatility on S&P 500 options. Key levels: <15 calm, 15-20 elevated, 20-30 fear, >30 extreme. The market's 'fear gauge'.",
      },
      {
        name: "VIX/VIX3M Ratio",
        symbol: "^VIX/^VIX3M",
        value: parseFloat(vixRatio.toFixed(3)),
        change: 0,
        regime: classifyVIXRatio(vixRatio),
        sparklineData: [],
        description: "VIX / VIX3M — the 'Panic Ratio'. Compares 30-day vs 3-month implied volatility. Key level: ratio > 1.0 means backwardation (traders paying more for immediate protection than 3-month) — a mechanical sell signal indicating immediate panic mode. Ratio < 1.0 is normal contango.",
      },
      {
        name: "VXN",
        symbol: "^VXN",
        value: vxnQuote?.regularMarketPrice ?? 0,
        change: vxnQuote?.regularMarketChange ?? 0,
        regime: classifyVXN(vxnQuote?.regularMarketPrice ?? 0, vixPrice),
        sparklineData: sparklineMap.get("^VXN") ?? [],
        description: "CBOE NASDAQ-100 Volatility Index — implied vol for tech-heavy Nasdaq. Typically trades at a premium to VIX. The spread (VXN − VIX) indicates relative tech risk sentiment.",
      },
      {
        name: "MOVE (TLT Vol Proxy)",
        symbol: "TLT",
        value: parseFloat(moveProxy.toFixed(1)),
        change: 0,
        regime: classifyMOVE(moveProxy),
        sparklineData: [],
        description: "ICE BofA MOVE proxy — 20-day annualized realized volatility of TLT (long-term Treasury ETF). Approximates the MOVE index which measures bond market implied vol. Key levels: <80 calm, 80-120 elevated, >120 stress.",
      },
      {
        name: "SKEW",
        symbol: "^SKEW",
        value: skewQuote?.regularMarketPrice ?? 0,
        change: skewQuote?.regularMarketChange ?? 0,
        regime: classifySKEW(skewQuote?.regularMarketPrice ?? 0),
        sparklineData: sparklineMap.get("^SKEW") ?? [],
        description: "CBOE SKEW Index — measures the perceived tail risk of S&P 500 returns. Higher values indicate greater probability of a 2+ sigma downside move. Key levels: <130 normal, 130-150 elevated, >150 extreme crash fear.",
      },
      {
        name: "VVIX",
        symbol: "^VVIX",
        value: vvixQuote?.regularMarketPrice ?? 0,
        change: vvixQuote?.regularMarketChange ?? 0,
        regime: classifyVVIX(vvixQuote?.regularMarketPrice ?? 0),
        sparklineData: sparklineMap.get("^VVIX") ?? [],
        description: "CBOE VIX of VIX — volatility of volatility. Measures the expected volatility of the 30-day forward price of VIX. High VVIX means the market expects VIX itself to be volatile, signaling regime uncertainty.",
      },
      {
        name: "Implied Correlation",
        symbol: "^JCJ",
        value: impCorrValue,
        change: 0,
        regime: classifyImpliedCorrelation(impCorrValue),
        sparklineData: [],
        description: "CBOE S&P 500 Implied Correlation Index — measures the expected average correlation between S&P 500 component stocks. Low values indicate healthy sector rotation and stock-picking opportunities. High values signal correlated sell-offs ('risk-off').",
      },
    ];

    cache.set(cacheKey, metrics, CACHE_TTL.VOLATILITY);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("[API] /volatility error:", error);
    return NextResponse.json(
      { error: "Failed to fetch volatility data" },
      { status: 500 }
    );
  }
}
