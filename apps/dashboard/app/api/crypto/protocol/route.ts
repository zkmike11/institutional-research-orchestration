import { NextRequest, NextResponse } from "next/server";
import { getProtocol, getFees, getYields } from "@/lib/defillama";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { ProtocolDetail } from "@/lib/types/crypto";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "slug parameter required" }, { status: 400 });
    }

    const cacheKey = `crypto-protocol:${slug}`;
    const cached = cache.get<ProtocolDetail>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [protocolRaw, feesRaw, yieldsRaw] = await Promise.all([
      getProtocol(slug),
      getFees(slug),
      getYields(slug).catch(() => []),
    ]);

    const tvlHistory = (protocolRaw.tvl ?? []).map((entry: any) => ({
      date: entry.date,
      tvl: entry.totalLiquidityUSD ?? 0,
    }));

    let feeHistory: { date: number; fees: number; revenue: number }[] = [];
    const feeChart = feesRaw?.fees?.totalDataChart;
    const revChart = feesRaw?.revenue?.totalDataChart;
    if (Array.isArray(feeChart)) {
      const revMap = new Map<number, number>();
      if (Array.isArray(revChart)) {
        for (const [ts, val] of revChart) {
          revMap.set(ts, val);
        }
      }
      feeHistory = feeChart.map(([ts, val]: [number, number]) => ({
        date: ts,
        fees: val,
        revenue: revMap.get(ts) ?? 0,
      }));
    }

    const yields = (yieldsRaw ?? []).map((p: any) => ({
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

    const result: ProtocolDetail = {
      name: protocolRaw.name,
      slug: protocolRaw.slug,
      category: protocolRaw.category ?? "—",
      chains: protocolRaw.chains ?? [],
      tvl: protocolRaw.currentChainTvls
        ? Object.values(protocolRaw.currentChainTvls).reduce((a: number, b: any) => a + (typeof b === "number" ? b : 0), 0)
        : 0,
      fees24h: feesRaw?.fees?.total24h ?? null,
      revenue24h: feesRaw?.revenue?.total24h ?? null,
      tvlHistory,
      feeHistory,
      yields,
    };

    cache.set(cacheKey, result, CACHE_TTL.PROTOCOL);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] /crypto/protocol error:", error);
    return NextResponse.json({ error: "Failed to fetch protocol data" }, { status: 500 });
  }
}
