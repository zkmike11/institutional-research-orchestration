import { NextRequest, NextResponse } from "next/server";
import { getCompanyInfo } from "@/lib/yahoo";
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

    const cacheKey = `company-info:${symbols}`;
    const cached = cache.get<unknown[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const symbolsArray = symbols.split(",").map((s) => s.trim());
    const results = await Promise.allSettled(
      symbolsArray.map((symbol) => getCompanyInfo(symbol))
    );

    const data = results
      .map((result, i) => {
        if (result.status === "rejected") {
          console.warn(`[API] /company-info failed for ${symbolsArray[i]}:`, result.reason?.message ?? result.reason);
        }
        return result.status === "fulfilled" ? result.value : null;
      })
      .filter(Boolean);

    cache.set(cacheKey, data, CACHE_TTL.COMPANY_INFO);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /company-info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company info" },
      { status: 500 }
    );
  }
}
