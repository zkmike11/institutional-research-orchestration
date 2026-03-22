export const SECTOR_ETFS = [
  { name: "Energy", ticker: "XLE", icon: "⚡" },
  { name: "Technology", ticker: "XLK", icon: "💻" },
  { name: "Communication", ticker: "XLC", icon: "📡" },
  { name: "Cons. Disc.", ticker: "XLY", icon: "🛒" },
  { name: "Financials", ticker: "XLF", icon: "🏦" },
  { name: "Utilities", ticker: "XLU", icon: "💡" },
  { name: "Real Estate", ticker: "XLRE", icon: "🏠" },
  { name: "Materials", ticker: "XLB", icon: "⛏️" },
  { name: "Cons. Staples", ticker: "XLP", icon: "🛍️" },
  { name: "Industrials", ticker: "XLI", icon: "🏭" },
  { name: "Health Care", ticker: "XLV", icon: "🏥" },
] as const;

export const INDUSTRY_ETFS = [
  { name: "Software", ticker: "IGV" },
  { name: "Oil & Gas E&P", ticker: "XOP" },
  { name: "Cybersecurity", ticker: "HACK" },
  { name: "Gold Miners", ticker: "GDX" },
  { name: "Semiconductors", ticker: "SMH" },
  { name: "Airlines", ticker: "JETS" },
  { name: "Insurance", ticker: "KIE" },
  { name: "Solar Energy", ticker: "TAN" },
  { name: "Oil Services", ticker: "OIH" },
  { name: "REITs", ticker: "VNQ" },
  { name: "Regional Banks", ticker: "KRE" },
  { name: "Banks", ticker: "KBE" },
  { name: "Clean Energy", ticker: "ICLN" },
] as const;

export const FACTOR_ETFS = [
  { name: "Growth", ticker: "IVW" },
  { name: "Low Vol", ticker: "USMV" },
  { name: "Value", ticker: "IVE" },
  { name: "Momentum", ticker: "MTUM" },
  { name: "Small Cap", ticker: "IWM" },
] as const;

export const ROTATION_PAIRS = [
  { name: "Software / Nasdaq", numerator: "IGV", denominator: "QQQ", color: "#22c55e" },
  { name: "Tech / Consumer St...", numerator: "XLK", denominator: "XLP", color: "#f59e0b" },
  { name: "Russell / Nasdaq", numerator: "IWM", denominator: "QQQ", color: "#14b8a6" },
  { name: "Bitcoin / Nasdaq", numerator: "IBIT", denominator: "QQQ", color: "#0d9488" },
  { name: "Semis / Software", numerator: "SMH", denominator: "IGV", color: "#ef4444" },
] as const;
