import { NextResponse } from "next/server";
import { getGlobal, getTopCoins } from "@/lib/coingecko";
import { getStablecoins } from "@/lib/defillama";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { CryptoMarketData } from "@/lib/types/crypto";

export async function GET() {
  try {
    const cacheKey = "crypto-market";
    const cached = cache.get<CryptoMarketData>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [globalRaw, stableRaw, topCoinsRaw] = await Promise.all([
      getGlobal(),
      getStablecoins().catch(() => null),
      getTopCoins(30),
    ]);

    const globalData = globalRaw?.data ?? {};
    const totalMarketCap = globalData.total_market_cap?.usd ?? 0;
    const btcDominance = globalData.market_cap_percentage?.btc ?? 0;

    // ETH/BTC ratio from top coins
    const btcPrice = topCoinsRaw?.find((c: any) => c.id === "bitcoin")?.current_price ?? 1;
    const ethPrice = topCoinsRaw?.find((c: any) => c.id === "ethereum")?.current_price ?? 0;
    const ethBtcRatio = btcPrice > 0 ? ethPrice / btcPrice : 0;

    // Stablecoin market cap
    let stablecoinMarketCap = 0;
    if (stableRaw?.peggedAssets) {
      stablecoinMarketCap = stableRaw.peggedAssets.reduce(
        (sum: number, s: any) => sum + (s.circulating?.peggedUSD ?? 0),
        0
      );
    }

    const topCoins = (topCoinsRaw ?? []).slice(0, 20).map((c: any) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      marketCap: c.market_cap ?? 0,
      priceChangePercent24h: c.price_change_percentage_24h ?? 0,
      currentPrice: c.current_price ?? 0,
    }));

    const result: CryptoMarketData = {
      totalMarketCap,
      btcDominance,
      ethBtcRatio,
      stablecoinMarketCap,
      topCoins,
    };

    cache.set(cacheKey, result, CACHE_TTL.CRYPTO_MARKET);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] /crypto/market error:", error);
    return NextResponse.json(
      { totalMarketCap: 0, btcDominance: 0, ethBtcRatio: 0, stablecoinMarketCap: 0, topCoins: [] },
      { status: 500 }
    );
  }
}
