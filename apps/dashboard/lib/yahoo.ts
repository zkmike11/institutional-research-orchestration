import yahooFinance from "yahoo-finance2";

export async function getQuotes(symbols: string[]) {
  const results = await Promise.allSettled(
    symbols.map((symbol) => yahooFinance.quote(symbol))
  );

  return results
    .map((result, i) => {
      if (result.status === "fulfilled" && result.value) {
        const q = result.value;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = q as any;
        return {
          symbol: symbols[i],
          shortName: q.shortName ?? symbols[i],
          longName: q.longName,
          regularMarketPrice: q.regularMarketPrice ?? 0,
          regularMarketChange: q.regularMarketChange ?? 0,
          regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
          regularMarketPreviousClose: q.regularMarketPreviousClose ?? 0,
          marketCap: q.marketCap,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow,
          currency: q.currency,
          sector: raw.sector,
          industry: raw.industry,
        };
      }
      return null;
    })
    .filter(Boolean);
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
    const result = await yahooFinance.historical(symbol, {
      period1: opts.period1,
      interval: "1d",
    });

    return result.map((d) => ({
      date: d.date.toISOString().split("T")[0],
      close: d.close ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getCompanyInfo(symbol: string) {
  try {
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ["price", "summaryProfile", "defaultKeyStatistics"],
    });

    const price = result.price;
    const profile = result.summaryProfile;

    return {
      symbol,
      shortName: price?.shortName ?? symbol,
      longName: price?.longName ?? symbol,
      sector: profile?.sector ?? "Unknown",
      industry: profile?.industry ?? "Unknown",
      marketCap: price?.marketCap ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getFundamentals(symbol: string) {
  try {
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ["price", "defaultKeyStatistics", "financialData", "summaryProfile", "summaryDetail"],
    });

    const stats = result.defaultKeyStatistics;
    const financial = result.financialData;
    const price = result.price;
    const detail = result.summaryDetail;

    return {
      symbol,
      shortName: price?.shortName ?? symbol,
      sector: result.summaryProfile?.sector ?? "Unknown",
      pe: detail?.trailingPE ?? null,
      forwardPe: stats?.forwardPE ?? null,
      ps: detail?.priceToSalesTrailing12Months ?? null,
      eps: financial?.earningsGrowth ?? null,
      revenue: financial?.totalRevenue ?? null,
      grossMargin: financial?.grossMargins ?? null,
      netMargin: financial?.profitMargins ?? null,
      dividendYield: detail?.dividendYield ?? null,
    };
  } catch {
    return null;
  }
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function startOfYear(): Date {
  return new Date(new Date().getFullYear(), 0, 1);
}
