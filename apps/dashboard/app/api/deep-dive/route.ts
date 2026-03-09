import { NextRequest, NextResponse } from "next/server";
import { getHistorical } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";
import { computeRatio } from "@/lib/calculations";
import { SIGNAL_RATIOS } from "@/lib/constants/signal-ratios";
import type { RatioChartData } from "@/lib/types/market";

const PERIOD_TO_RANGE: Record<string, string> = {
  "1D": "1m",
  "1W": "1m",
  "1M": "3m",
  "3M": "6m",
  "6M": "1y",
  "YTD": "ytd",
  "1Y": "1y",
  "3Y": "3y",
};

export async function GET(request: NextRequest) {
  try {
    const period = request.nextUrl.searchParams.get("period") ?? "1M";
    const cacheKey = `deep-dive:${period}`;
    const cached = cache.get<RatioChartData[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const range = PERIOD_TO_RANGE[period] ?? "3m";

    const results: RatioChartData[] = [];

    for (const ratio of SIGNAL_RATIOS) {
      try {
        const numData = await getHistorical(ratio.numerator, range);

        let data: { time: string; value: number }[];

        if (ratio.denominator === null) {
          // Single symbol — just use its closing prices
          data = numData.map((d) => ({ time: d.date, value: d.close }));
        } else {
          // Compute ratio of numerator / denominator
          const denData = await getHistorical(ratio.denominator, range);
          data = computeRatio(numData, denData);
        }

        results.push({
          name: ratio.name,
          subtitle: ratio.subtitle,
          color: ratio.color,
          data,
        });
      } catch {
        // Skip failed ratios rather than crashing everything
        results.push({
          name: ratio.name,
          subtitle: ratio.subtitle,
          color: ratio.color,
          data: [],
        });
      }
    }

    cache.set(cacheKey, results, CACHE_TTL.HISTORICAL);
    return NextResponse.json(results);
  } catch (error) {
    console.error("[API] /deep-dive error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deep dive data" },
      { status: 500 }
    );
  }
}
