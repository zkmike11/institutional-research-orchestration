import { NextRequest, NextResponse } from "next/server";
import { getMultiDateYieldCurve } from "@/lib/fred";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { YieldCurveSnapshot } from "@/lib/types/yield-curve";

export async function GET(_request: NextRequest) {
  try {
    const cacheKey = "yield-curve-multi";
    const cached = cache.get<YieldCurveSnapshot[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await getMultiDateYieldCurve();

    cache.set(cacheKey, data, CACHE_TTL.YIELD_CURVE);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /yield-curve error:", error);
    return NextResponse.json(
      { error: "Failed to fetch yield curve data" },
      { status: 500 }
    );
  }
}
