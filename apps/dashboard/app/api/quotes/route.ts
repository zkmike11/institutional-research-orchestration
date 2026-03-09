import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const symbols = request.nextUrl.searchParams.get("symbols");
    if (!symbols) {
      return NextResponse.json(
        { error: "Missing required query param: symbols" },
        { status: 400 }
      );
    }

    const cacheKey = `quotes:${symbols}`;
    const cached = cache.get<Awaited<ReturnType<typeof getQuotes>>>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const symbolsArray = symbols.split(",").map((s) => s.trim());
    const data = await getQuotes(symbolsArray);

    cache.set(cacheKey, data, CACHE_TTL.QUOTES);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /quotes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
