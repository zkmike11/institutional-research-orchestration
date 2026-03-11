import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

/** Small delay to avoid Yahoo rate limits */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry a function with exponential backoff on rate limit errors */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries: number = 2,
  baseDelayMs: number = 2000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimit = msg.includes("Too Many Requests") || msg.includes("429");

      if (isRateLimit && attempt < maxRetries) {
        const waitMs = baseDelayMs * Math.pow(2, attempt);
        console.warn(`[Yahoo] Rate limited on ${label}, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await delay(waitMs);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unreachable");
}

export async function getQuotes(symbols: string[]) {
  if (symbols.length === 0) return [];

  try {
    // Use batch quote — single API call for all symbols
    const results = await withRetry(
      () => yahooFinance.quote(symbols),
      `quotes(${symbols.length} symbols)`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotesArray: any[] = Array.isArray(results) ? results : [results];

    return quotesArray
      .map((q) => {
        if (!q) return null;
        return {
          symbol: q.symbol as string,
          shortName: (q.shortName ?? q.symbol) as string,
          longName: q.longName as string | undefined,
          regularMarketPrice: (q.regularMarketPrice ?? 0) as number,
          regularMarketChange: (q.regularMarketChange ?? 0) as number,
          regularMarketChangePercent: (q.regularMarketChangePercent ?? 0) as number,
          regularMarketPreviousClose: (q.regularMarketPreviousClose ?? 0) as number,
          marketCap: q.marketCap as number | undefined,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh as number | undefined,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow as number | undefined,
          currency: q.currency as string | undefined,
          sector: q.sector as string | undefined,
          industry: q.industry as string | undefined,
        };
      })
      .filter(Boolean);
  } catch (err) {
    console.warn(`[Yahoo] Batch quote failed:`, err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getHistorical(
  symbol: string,
  period: string = "1y"
): Promise<{ date: string; close: number }[]> {
  const periodMap: Record<string, { period1: Date }> = {
    "5d": { period1: daysAgo(5) },
    "1w": { period1: daysAgo(7) },
    "1m": { period1: daysAgo(30) },
    "3m": { period1: daysAgo(90) },
    "6m": { period1: daysAgo(180) },
    "ytd": { period1: startOfYear() },
    "1y": { period1: daysAgo(365) },
    "3y": { period1: daysAgo(1095) },
    "5y": { period1: daysAgo(1825) },
  };

  const opts = periodMap[period.toLowerCase()] ?? periodMap["1y"];

  try {
    const result = await withRetry(
      () => yahooFinance.chart(symbol, {
        period1: opts.period1.toISOString().split("T")[0],
        interval: "1d" as const,
      }),
      `historical(${symbol})`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = (result as any).quotes ?? [];
    return quotes.map((d: any) => ({
      date: d.date instanceof Date ? d.date.toISOString().split("T")[0] : String(d.date).split("T")[0],
      close: (d.close ?? d.adjclose ?? 0) as number,
    }));
  } catch (err) {
    console.warn(`[Yahoo] Historical failed for ${symbol} (${period}):`, err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getCompanyInfo(symbol: string) {
  try {
    const result = await withRetry(
      () => yahooFinance.quoteSummary(symbol, {
        modules: ["price", "summaryProfile", "defaultKeyStatistics"],
      }),
      `companyInfo(${symbol})`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = result as any;
    const price = r.price;
    const profile = r.summaryProfile;

    return {
      symbol,
      shortName: (price?.shortName ?? symbol) as string,
      longName: (price?.longName ?? symbol) as string,
      sector: (profile?.sector ?? "Unknown") as string,
      industry: (profile?.industry ?? "Unknown") as string,
      marketCap: (price?.marketCap ?? 0) as number,
    };
  } catch (err) {
    console.warn(`[Yahoo] CompanyInfo failed for ${symbol}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function getFundamentals(symbol: string) {
  try {
    const result = await withRetry(
      () => yahooFinance.quoteSummary(symbol, {
        modules: ["price", "defaultKeyStatistics", "financialData", "summaryProfile", "summaryDetail"],
      }),
      `fundamentals(${symbol})`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = result as any;
    const stats = r.defaultKeyStatistics;
    const financial = r.financialData;
    const price = r.price;
    const detail = r.summaryDetail;

    return {
      symbol,
      shortName: (price?.shortName ?? symbol) as string,
      sector: (r.summaryProfile?.sector ?? "Unknown") as string,
      pe: (detail?.trailingPE ?? null) as number | null,
      forwardPe: (stats?.forwardPE ?? null) as number | null,
      ps: (detail?.priceToSalesTrailing12Months ?? null) as number | null,
      eps: (financial?.earningsGrowth ?? null) as number | null,
      revenue: (financial?.totalRevenue ?? null) as number | null,
      grossMargin: (financial?.grossMargins ?? null) as number | null,
      netMargin: (financial?.profitMargins ?? null) as number | null,
      dividendYield: (detail?.dividendYield ?? null) as number | null,
    };
  } catch (err) {
    console.warn(`[Yahoo] Fundamentals failed for ${symbol}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function getHistoricalRange(
  symbol: string,
  startDate: string,
  endDate: string
): Promise<{ date: string; close: number }[]> {
  try {
    const result = await withRetry(
      () => yahooFinance.chart(symbol, {
        period1: startDate,
        period2: endDate,
        interval: "1d" as const,
      }),
      `historicalRange(${symbol})`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = (result as any).quotes ?? [];
    return quotes.map((d: any) => ({
      date: d.date instanceof Date ? d.date.toISOString().split("T")[0] : String(d.date).split("T")[0],
      close: (d.close ?? d.adjclose ?? 0) as number,
    }));
  } catch (err) {
    console.warn(`[Yahoo] HistoricalRange failed for ${symbol} (${startDate}→${endDate}):`, err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getEarningsData(
  symbols: string[]
): Promise<
  {
    symbol: string;
    name: string;
    earningsDate: string | null;
    epsEstimate: number | null;
    revenueEstimate: number | null;
    marketCap: number;
  }[]
> {
  if (symbols.length === 0) return [];

  // First get names + marketCap via batch quote
  const quotes = await getQuotes(symbols);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quoteMap = new Map<string, any>();
  for (const q of quotes) {
    if (q) quoteMap.set(q.symbol, q);
  }

  // Then fetch calendarEvents per symbol for earnings dates + estimates
  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      try {
        const summary = await withRetry(
          () =>
            yahooFinance.quoteSummary(symbol, {
              modules: ["calendarEvents", "earnings"] as any,
            }),
          `earnings(${symbol})`
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = summary as any;
        const cal = r.calendarEvents;
        const quote = quoteMap.get(symbol);

        // Extract earnings date — calendarEvents.earnings.earningsDate is an array of Date
        let earningsDate: string | null = null;
        if (cal?.earnings?.earningsDate?.length > 0) {
          const d = cal.earnings.earningsDate[0];
          earningsDate =
            d instanceof Date
              ? d.toISOString().split("T")[0]
              : String(d).split("T")[0];
        }

        return {
          symbol,
          name: (quote?.longName ?? quote?.shortName ?? symbol) as string,
          earningsDate,
          epsEstimate: (cal?.earnings?.earningsAverage ?? null) as number | null,
          revenueEstimate: (cal?.earnings?.revenueAverage ?? null) as number | null,
          marketCap: (quote?.marketCap ?? 0) as number,
        };
      } catch (err) {
        console.warn(
          `[Yahoo] Earnings failed for ${symbol}:`,
          err instanceof Error ? err.message : err
        );
        const quote = quoteMap.get(symbol);
        // Fallback: return entry with what we have from the quote
        return {
          symbol,
          name: (quote?.longName ?? quote?.shortName ?? symbol) as string,
          earningsDate: null,
          epsEstimate: null,
          revenueEstimate: null,
          marketCap: (quote?.marketCap ?? 0) as number,
        };
      }
    })
  );

  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(Boolean) as {
    symbol: string;
    name: string;
    earningsDate: string | null;
    epsEstimate: number | null;
    revenueEstimate: number | null;
    marketCap: number;
  }[];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function startOfYear(): Date {
  return new Date(new Date().getFullYear(), 0, 1);
}
