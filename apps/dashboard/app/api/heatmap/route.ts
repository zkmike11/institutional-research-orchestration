import { NextRequest, NextResponse } from "next/server";
import { getQuotes, getHistoricalRange } from "@/lib/yahoo";
import { cache, CACHE_TTL } from "@/lib/cache";
import { SUB_INDUSTRY_MAP } from "@/lib/constants/sub-industries";
import type { TreemapNode } from "@/lib/types/heatmap";

// Hardcoded sector ETF → constituent stock mappings (expanded to ~30-60 per sector)
const SECTOR_CONSTITUENTS: Record<string, string[]> = {
  XLU: [
    "CEG", "SO", "DUK", "NEE", "SRE", "AEP", "D", "EXC", "XEL", "WEC",
    "ED", "PEG", "ES", "AEE", "CMS", "PPL", "ETR", "FE", "NRG", "EIX", "DTE",
    "VST", "FTS", "CNP", "NI", "PCG", "EMA", "PNW", "AES", "OGE", "AWK",
    "EVRG", "LNT", "ATO", "RSG", "WMB", "EPD", "TRGP", "KMI", "OKE",
    "ET", "AM", "SREA", "DTM", "KNTK", "AROC", "WES", "CWEN", "BKH",
    "ORA", "IDA", "POR", "VG", "NFG", "WTRG", "CIEN", "SJW",
  ],
  XLK: [
    "AAPL", "MSFT", "NVDA", "AVGO", "CRM", "AMD", "ADBE", "CSCO", "ACN",
    "ORCL", "INTC", "QCOM", "IBM", "TXN", "AMAT", "LRCX", "MU", "KLAC",
    "ADI", "SNPS", "CDNS", "MRVL", "FTNT", "PANW", "MSI", "APH", "NXPI",
    "ON", "MPWR", "MCHP", "TEL", "KEYS", "CDW", "GLW", "TYL", "ZBRA",
    "TRMB", "EPAM", "ENPH", "SMCI", "FSLR", "ANET", "NOW", "PLTR", "CRWD",
    "GDDY", "GEN", "JNPR", "HPE", "HPQ", "WDC", "STX",
  ],
  XLE: [
    "XOM", "CVX", "COP", "EOG", "SLB", "MPC", "PSX", "VLO", "OXY",
    "HES", "DVN", "BKR", "FANG", "HAL", "TRGP", "WMB", "KMI", "OKE", "CTRA",
    "MRO", "APA", "EQT", "CHRD", "PR", "SM", "RRC", "AR", "SWN",
    "MGY", "MTDR", "DINO", "PBF", "DK", "HFC", "PARR", "CVI",
    "NOV", "FTI", "WFRD", "RIG", "HP", "PTEN", "LBRT",
  ],
  XLF: [
    "BRK-B", "JPM", "V", "MA", "BAC", "WFC", "GS", "MS", "SPGI", "AXP",
    "C", "BLK", "SCHW", "CB", "MMC", "PGR", "CME", "ICE", "AON", "MCO",
    "MET", "AIG", "PRU", "TRV", "AFL", "ALL", "HIG", "WRB", "GL", "RGA",
    "FITB", "MTB", "HBAN", "KEY", "CFG", "RF", "ZION", "CMA", "FHN", "SBNY",
    "TROW", "NTRS", "STT", "BEN", "IVZ", "COIN", "HOOD",
  ],
  XLV: [
    "UNH", "LLY", "JNJ", "ABBV", "MRK", "TMO", "ABT", "DHR", "PFE", "AMGN",
    "ISRG", "SYK", "GILD", "VRTX", "MDT", "ELV", "REGN", "BDX", "BSX", "ZTS",
    "DXCM", "IQV", "IDXX", "A", "WAT", "MTD", "BAX", "EW", "HOLX", "ALGN",
    "RMD", "TFX", "COO", "HCA", "CNC", "MOH", "CI", "CVS",
    "BIIB", "MRNA", "JAZZ", "SGEN", "NBIX", "INCY", "ALNY",
  ],
  XLY: [
    "AMZN", "TSLA", "HD", "MCD", "NKE", "LOW", "BKNG", "SBUX", "TJX", "CMG",
    "ORLY", "MAR", "HLT", "AZO", "ROST", "DHI", "LEN", "YUM", "EBAY", "LULU",
    "GM", "F", "APTV", "GRMN", "BBY", "DPZ", "WYNN", "LVS", "MGM", "CZR",
    "RCL", "CCL", "NCLH", "HAS", "POOL", "WSM", "DECK", "BURL", "KMX",
    "GPC", "AAP", "DRI", "TXRH", "EAT", "WING",
  ],
  XLC: [
    "META", "GOOGL", "GOOG", "NFLX", "DIS", "CMCSA", "TMUS", "VZ", "T",
    "CHTR", "EA", "TTWO", "OMC", "IPG", "WBD", "PARA", "FOXA", "FOX", "LYV", "MTCH",
    "RBLX", "ZM", "SPOT", "PINS", "SNAP", "ROKU", "TTD", "BILL",
    "NWSA", "NWS", "MSGS", "IMAX",
  ],
  XLI: [
    "CAT", "RTX", "UNP", "HON", "DE", "BA", "LMT", "GE", "UPS", "ADP",
    "WM", "ETN", "MMM", "NOC", "GD", "CSX", "ITW", "EMR", "NSC", "TDG",
    "FDX", "LHX", "CARR", "OTIS", "PH", "ROK", "SWK", "CMI", "FAST",
    "PCAR", "JCI", "GWW", "IR", "DOV", "AME", "NDSN", "RHI", "VRSK",
    "CPRT", "DAL", "UAL", "LUV", "AAL", "JBLU", "ALK",
  ],
  XLP: [
    "PG", "COST", "KO", "PEP", "WMT", "PM", "MDLZ", "MO", "CL", "STZ",
    "KMB", "GIS", "SYY", "KHC", "HSY", "MKC", "TSN", "K", "HRL", "SJM",
    "ADM", "BG", "CAG", "CPB", "MNST", "KDP", "EL", "CHD", "CLX",
    "KVUE", "TAP", "SAM", "LW", "WBA", "KR", "CASY",
  ],
  XLB: [
    "LIN", "SHW", "APD", "ECL", "NUE", "FCX", "DD", "DOW", "VMC", "MLM",
    "NEM", "PPG", "CTVA", "ALB", "CE", "EMN", "IP", "PKG", "FMC", "CF",
    "RPM", "AVY", "SEE", "SON", "WRK", "HUN", "OLN", "CC", "RGLD",
    "GOLD", "AEM", "KGC", "WPM", "FNV", "STLD", "RS", "CLF",
  ],
  XLRE: [
    "PLD", "AMT", "CCI", "EQIX", "PSA", "SPG", "O", "DLR", "WELL", "VICI",
    "AVB", "EQR", "ARE", "MAA", "ESS", "UDR", "CPT", "VTR", "HST", "KIM",
    "REG", "FRT", "BXP", "SLG", "VNO", "HIW", "CBRE", "JLL", "CSGP",
    "IRM", "CUBE", "EXR", "INVH", "SUI", "ELS", "MPW", "OHI", "PEAK",
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
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");

    const cacheKey = startDate && endDate
      ? `heatmap:${sector}:${startDate}:${endDate}`
      : `heatmap:${sector}:${period}`;
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

    // Always fetch quotes for market cap and names
    const quotes = await getQuotes(constituents);

    // For 1D, use real-time quote data; for other periods/date ranges, compute from historical
    const useHistorical = (startDate && endDate) || period.toUpperCase() !== "1D";

    let historicalChanges: Map<string, number> | null = null;
    if (useHistorical) {
      historicalChanges = new Map();
      const start = startDate ?? periodToStartDate(period);
      const end = endDate ?? new Date().toISOString().split("T")[0];

      const results = await Promise.allSettled(
        constituents.map(async (symbol) => {
          const data = await getHistoricalRange(symbol, start, end);
          if (data.length >= 2) {
            const first = data[0].close;
            const last = data[data.length - 1].close;
            return { symbol, change: first > 0 ? ((last - first) / first) * 100 : 0 };
          }
          return { symbol, change: 0 };
        })
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          historicalChanges.set(result.value.symbol, result.value.change);
        }
      }
    }

    const sectorFallback = SECTOR_NAMES[sector.toUpperCase()] ?? "Unknown";
    const nodes: TreemapNode[] = quotes
      .filter((q) => q !== null)
      .map((q) => {
        const sym = q!.symbol;
        // Use static sub-industry map first, then Yahoo industry, then sector fallback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yahooIndustry = (q as any)?.industry as string | undefined;
        const subIndustry = SUB_INDUSTRY_MAP[sym] || yahooIndustry || sectorFallback;
        return {
          symbol: sym,
          name: q!.shortName ?? sym,
          subIndustry,
          marketCap: q!.marketCap ?? 0,
          changePercent: historicalChanges
            ? (historicalChanges.get(sym) ?? 0)
            : (q!.regularMarketChangePercent ?? 0),
        };
      });

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

function periodToStartDate(period: string): string {
  const d = new Date();
  const map: Record<string, number> = {
    "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365,
  };
  const upper = period.toUpperCase();
  if (upper === "YTD") {
    return `${d.getFullYear()}-01-01`;
  }
  d.setDate(d.getDate() - (map[upper] ?? 30));
  return d.toISOString().split("T")[0];
}
