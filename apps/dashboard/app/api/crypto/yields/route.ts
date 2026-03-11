import { NextRequest, NextResponse } from "next/server";
import { getYields } from "@/lib/defillama";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { YieldPool } from "@/lib/types/crypto";

export async function GET(request: NextRequest) {
  try {
    const project = request.nextUrl.searchParams.get("project") ?? undefined;
    const cacheKey = `crypto-yields:${project ?? "all"}`;
    const cached = cache.get<YieldPool[]>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const raw = await getYields(project);

    const result: YieldPool[] = raw
      .filter((p: any) => (p.tvlUsd ?? 0) > 10_000)
      .sort((a: any, b: any) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))
      .slice(0, 30)
      .map((p: any) => ({
        pool: p.pool,
        project: p.project,
        chain: p.chain,
        symbol: p.symbol,
        tvlUsd: p.tvlUsd ?? 0,
        apy: p.apy ?? 0,
        apyBase: p.apyBase ?? 0,
        apyReward: p.apyReward ?? 0,
        ilRisk: p.ilRisk === "yes",
        stablecoin: p.stablecoin ?? false,
      }));

    cache.set(cacheKey, result, CACHE_TTL.YIELDS);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] /crypto/yields error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
