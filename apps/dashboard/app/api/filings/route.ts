import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/cache";

const FILINGS_TTL = 3_600_000; // 1 hour

interface Filing {
  type: string;
  company: string;
  date: string;
  description: string;
  url: string;
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query");
    if (!query) {
      return NextResponse.json(
        { error: "Missing required query param: query" },
        { status: 400 }
      );
    }

    const cacheKey = `filings:${query}`;
    const cached = cache.get<Filing[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    const edgarUrl = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(query)}&forms=10-K,10-Q,8-K&dateRange=custom&startdt=${startStr}&enddt=${endStr}`;

    let filings: Filing[] = [];

    try {
      const res = await fetch(edgarUrl, {
        headers: {
          "User-Agent": "MarketsDashboard/1.0 (contact@example.com)",
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const hits = data.hits?.hits ?? data.hits ?? [];

        filings = hits.slice(0, 20).map(
          (hit: {
            _source?: {
              form_type?: string;
              entity_name?: string;
              file_date?: string;
              display_date_filed?: string;
              file_description?: string;
            };
            _id?: string;
          }) => {
            const source = hit._source ?? {};
            return {
              type: source.form_type ?? "Unknown",
              company: source.entity_name ?? query,
              date: source.file_date ?? source.display_date_filed ?? "",
              description: source.file_description ?? `${source.form_type ?? "Filing"} for ${source.entity_name ?? query}`,
              url: hit._id
                ? `https://www.sec.gov/Archives/edgar/data/${hit._id}`
                : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(query)}&type=&dateb=&owner=include&count=40&search_text=&action=getcompany`,
            };
          }
        );
      }
    } catch {
      // EDGAR API failed; try the full-text search endpoint as fallback
      try {
        const fallbackUrl = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(query)}&dateRange=custom&startdt=${startStr}&enddt=${endStr}&forms=10-K,10-Q,8-K`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: {
            "User-Agent": "MarketsDashboard/1.0 (contact@example.com)",
            Accept: "application/json",
          },
        });

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          const hits = data.hits?.hits ?? data.hits ?? [];
          filings = hits.slice(0, 20).map(
            (hit: {
              _source?: {
                form_type?: string;
                entity_name?: string;
                file_date?: string;
                file_description?: string;
              };
            }) => {
              const source = hit._source ?? {};
              return {
                type: source.form_type ?? "Unknown",
                company: source.entity_name ?? query,
                date: source.file_date ?? "",
                description: source.file_description ?? `Filing for ${query}`,
                url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(query)}&type=&dateb=&owner=include&count=40&search_text=&action=getcompany`,
              };
            }
          );
        }
      } catch {
        // Both attempts failed — return empty with a link to EDGAR search
        filings = [];
      }
    }

    cache.set(cacheKey, filings, FILINGS_TTL);
    return NextResponse.json(filings);
  } catch (error) {
    console.error("[API] /filings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filings" },
      { status: 500 }
    );
  }
}
