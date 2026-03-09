import { NextRequest, NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { cache } from "@/lib/cache";

const NEWS_TTL = 300_000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const symbols = request.nextUrl.searchParams.get("symbols");
    const cacheKey = `news:${symbols || "general"}`;
    const cached = cache.get<unknown[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const searchTerms = symbols
      ? symbols.split(",").map((s) => s.trim())
      : ["market", "stocks"];

    const allNews: {
      title: string;
      link: string;
      publisher: string;
      publishedAt: string;
      relatedTickers: string[];
    }[] = [];

    const seen = new Set<string>();

    for (const term of searchTerms) {
      try {
        const result = await yahooFinance.search(term);
        if (result.news) {
          for (const article of result.news) {
            // Deduplicate by title
            if (seen.has(article.title)) continue;
            seen.add(article.title);

            allNews.push({
              title: article.title,
              link: article.link,
              publisher: article.publisher ?? "Unknown",
              publishedAt: article.providerPublishTime
                ? new Date(
                    typeof article.providerPublishTime === "number"
                      ? article.providerPublishTime * 1000
                      : article.providerPublishTime
                  ).toISOString()
                : new Date().toISOString(),
              relatedTickers: article.relatedTickers ?? [],
            });
          }
        }
      } catch {
        // Skip failed search terms
      }
    }

    // Sort by publish date descending
    allNews.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    cache.set(cacheKey, allNews, NEWS_TTL);
    return NextResponse.json(allNews);
  } catch (error) {
    console.error("[API] /news error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
