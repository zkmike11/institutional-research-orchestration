import { NextRequest, NextResponse } from "next/server";
import { getMarkets } from "@/lib/coingecko";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { CryptoMeta } from "@/lib/types/crypto";

export async function GET(request: NextRequest) {
  try {
    const ids = request.nextUrl.searchParams.get("ids") ?? "bitcoin,ethereum";
    const cacheKey = `crypto-quotes:${ids}`;
    const cached = cache.get<CryptoMeta[]>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const raw = await getMarkets(ids.split(","));

    const result: CryptoMeta[] = raw.map((c: any) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      image: c.image,
      marketCap: c.market_cap ?? 0,
      fullyDilutedValuation: c.fully_diluted_valuation ?? null,
      totalVolume: c.total_volume ?? 0,
      ath: c.ath ?? 0,
      athChangePercentage: c.ath_change_percentage ?? 0,
      priceChangePercentage24h: c.price_change_percentage_24h ?? 0,
      currentPrice: c.current_price ?? 0,
    }));

    cache.set(cacheKey, result, CACHE_TTL.QUOTES);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] /crypto/quotes error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
