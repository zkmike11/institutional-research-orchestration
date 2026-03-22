import { NextRequest, NextResponse } from "next/server";
import { getMultiDateYieldCurve, getYieldCurve } from "@/lib/fred";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { YieldCurveSnapshot } from "@/lib/types/yield-curve";

const CUSTOM_COLORS = ["#14b8a6", "#f472b6", "#38bdf8", "#f97316", "#06b6d4"];

export async function GET(request: NextRequest) {
  try {
    // Always return the default 5 snapshots (cached)
    const cacheKey = "yield-curve-multi";
    let defaults = cache.get<YieldCurveSnapshot[]>(cacheKey);
    if (!defaults) {
      defaults = await getMultiDateYieldCurve();
      cache.set(cacheKey, defaults, CACHE_TTL.YIELD_CURVE);
    }

    // If custom dates requested, fetch those too
    const datesParam = request.nextUrl.searchParams.get("dates");
    if (datesParam) {
      const dates = datesParam.split(",").filter(Boolean).slice(0, 5);
      const customSnapshots = await Promise.all(
        dates.map(async (date, i) => {
          const points = await getYieldCurve(date);
          return {
            label: date,
            color: CUSTOM_COLORS[i % CUSTOM_COLORS.length],
            dashed: true,
            points,
          } satisfies YieldCurveSnapshot;
        })
      );
      return NextResponse.json([...defaults, ...customSnapshots]);
    }

    return NextResponse.json(defaults);
  } catch (error) {
    console.error("[API] /yield-curve error:", error);
    return NextResponse.json(
      { error: "Failed to fetch yield curve data" },
      { status: 500 }
    );
  }
}
