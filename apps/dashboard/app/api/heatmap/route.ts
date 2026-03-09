import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";
import type { TreemapNode } from "@/lib/types/heatmap";

// Hardcoded sector ETF → constituent stock mappings
const SECTOR_CONSTITUENTS: Record<string, string[]> = {
  XLU: [
    "CEG", "SO", "DUK", "NEE", "SRE", "AEP", "D", "EXC", "XEL", "WEC",
    "ED", "PEG", "ES", "AEE", "CMS", "PPL", "ETR", "FE", "NRG", "EIX", "DTE",
  ],
  XLK: [
    "AAPL", "MSFT", "NVDA", "AVGO", "CRM", "AMD", "ADBE", "CSCO", "ACN",
    "ORCL", "INTC", "QCOM", "IBM", "TXN", "AMAT", "LRCX", "MU", "KLAC",
    "ADI", "SNPS", "CDNS",
  ],
  XLE: [
    "XOM", "CVX", "COP", "EOG", "SLB", "MPC", "PSX", "VLO", "PXD", "OXY",
    "HES", "DVN", "BKR", "FANG", "HAL", "TRGP", "WMB", "KMI", "OKE", "CTRA",
  ],
  XLF: [
    "BRK-B", "JPM", "V", "MA", "BAC", "WFC", "GS", "MS", "SPGI", "AXP",
    "C", "BLK", "SCHW", "CB", "MMC", "PGR", "CME", "ICE", "AON", "MCO",
  ],
  XLV: [
    "UNH", "LLY", "JNJ", "ABBV", "MRK", "TMO", "ABT", "DHR", "PFE", "AMGN",
    "ISRG", "SYK", "GILD", "VRTX", "MDT", "ELV", "REGN", "BDX", "BSX", "ZTS",
  ],
  XLY: [
    "AMZN", "TSLA", "HD", "MCD", "NKE", "LOW", "BKNG", "SBUX", "TJX", "CMG",
    "ORLY", "MAR", "HLT", "AZO", "ROST", "DHI", "LEN", "YUM", "EBAY", "LULU",
  ],
  XLC: [
    "META", "GOOGL", "GOOG", "NFLX", "DIS", "CMCSA", "TMUS", "VZ", "T",
    "CHTR", "EA", "TTWO", "OMC", "IPG", "WBD", "PARA", "FOXA", "FOX", "LYV", "MTCH",
  ],
  XLI: [
    "CAT", "RTX", "UNP", "HON", "DE", "BA", "LMT", "GE", "UPS", "ADP",
    "WM", "ETN", "MMM", "NOC", "GD", "CSX", "ITW", "EMR", "NSC", "TDG",
  ],
  XLP: [
    "PG", "COST", "KO", "PEP", "WMT", "PM", "MDLZ", "MO", "CL", "STZ",
    "KMB", "GIS", "SYY", "KHC", "HSY", "MKC", "TSN", "K", "HRL", "SJM",
  ],
  XLB: [
    "LIN", "SHW", "APD", "ECL", "NUE", "FCX", "DD", "DOW", "VMC", "MLM",
    "NEM", "PPG", "CTVA", "ALB", "CE", "EMN", "IP", "PKG", "FMC", "CF",
  ],
  XLRE: [
    "PLD", "AMT", "CCI", "EQIX", "PSA", "SPG", "O", "DLR", "WELL", "VICI",
    "AVB", "EQR", "ARE", "MAA", "ESS", "UDR", "CPT", "VTR", "HST", "KIM",
  ],
};

// Sector name mapping for ETF tickers
const SECTOR_NAMES: Record<string, string> = {
  XLU: "Utilities",
  XLK: "Technology",
  XLE: "Energy",
  XLF: "Financials",
  XLV: "Health Care",
  XLY: "Consumer Discretionary",
  XLC: "Communication Services",
  XLI: "Industrials",
  XLP: "Consumer Staples",
  XLB: "Materials",
  XLRE: "Real Estate",
};

export async function GET(request: NextRequest) {
  try {
    const sector = request.nextUrl.searchParams.get("sector");
    if (!sector) {
      return NextResponse.json(
        { error: "Missing required query param: sector" },
        { status: 400 }
      );
    }

    const period = request.nextUrl.searchParams.get("period") ?? "1D";
    const cacheKey = `heatmap:${sector}:${period}`;
    const cached = cache.get<TreemapNode[]>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const constituents = SECTOR_CONSTITUENTS[sector.toUpperCase()];
    if (!constituents) {
      return NextResponse.json(
        {
          error: `No constituent data available for sector: ${sector}. Supported: ${Object.keys(SECTOR_CONSTITUENTS).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const quotes = await getQuotes(constituents);

    const nodes: TreemapNode[] = quotes
      .filter((q) => q !== null)
      .map((q) => ({
        symbol: q!.symbol,
        name: q!.shortName ?? q!.symbol,
        subIndustry: SECTOR_NAMES[sector.toUpperCase()] ?? "Unknown",
        marketCap: q!.marketCap ?? 0,
        changePercent: q!.regularMarketChangePercent ?? 0,
      }));

    cache.set(cacheKey, nodes, CACHE_TTL.QUOTES);
    return NextResponse.json(nodes);
  } catch (error) {
    console.error("[API] /heatmap error:", error);
    return NextResponse.json(
      { error: "Failed to fetch heatmap data" },
      { status: 500 }
    );
  }
}
