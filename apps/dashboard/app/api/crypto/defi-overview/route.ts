import { NextResponse } from "next/server";
import { getChains, getProtocols, getOverviewFees } from "@/lib/defillama";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { DefiOverviewData, ChainTvl, ProtocolTvlEntry, ProtocolFeeEntry } from "@/lib/types/crypto";

export async function GET() {
  try {
    const cacheKey = "defi-overview";
    const cached = cache.get<DefiOverviewData>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [chainsRaw, protocolsRaw, feesRaw] = await Promise.all([
      getChains(),
      getProtocols(),
      getOverviewFees().catch(() => null),
    ]);

    const chains: ChainTvl[] = chainsRaw
      .sort((a: any, b: any) => (b.tvl ?? 0) - (a.tvl ?? 0))
      .slice(0, 10)
      .map((c: any) => ({
        name: c.name,
        tvl: c.tvl ?? 0,
        tokenSymbol: c.tokenSymbol,
      }));

    const tvlLeaders: ProtocolTvlEntry[] = protocolsRaw
      .sort((a: any, b: any) => (b.tvl ?? 0) - (a.tvl ?? 0))
      .slice(0, 15)
      .map((p: any) => ({
        name: p.name,
        slug: p.slug,
        category: p.category ?? "—",
        tvl: p.tvl ?? 0,
        change1d: p.change_1d ?? 0,
        change7d: p.change_7d ?? 0,
        chains: p.chains ?? [],
        logo: p.logo ?? "",
      }));

    let feeLeaders: ProtocolFeeEntry[] = [];
    if (feesRaw?.protocols) {
      feeLeaders = feesRaw.protocols
        .filter((p: any) => (p.total24h ?? 0) > 0)
        .sort((a: any, b: any) => (b.total24h ?? 0) - (a.total24h ?? 0))
        .slice(0, 15)
        .map((p: any) => ({
          name: p.name,
          slug: p.slug ?? p.name.toLowerCase().replace(/\s/g, "-"),
          category: p.category ?? "—",
          fees24h: p.total24h ?? 0,
          revenue24h: p.totalRevenue24h ?? p.revenue24h ?? 0,
          fees7dAvg: p.total7d ? p.total7d / 7 : 0,
          chains: p.chains ?? [],
        }));
    }

    const result: DefiOverviewData = { chains, feeLeaders, tvlLeaders };
    cache.set(cacheKey, result, CACHE_TTL.DEFI_OVERVIEW);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] /crypto/defi-overview error:", error);
    return NextResponse.json({ chains: [], feeLeaders: [], tvlLeaders: [] }, { status: 500 });
  }
}
