export function formatPrice(value: number, currency?: string): string {
  if (value >= 10000) return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 100) return value.toFixed(2);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

export function formatMarketCap(value: number | undefined): string {
  if (!value) return "-";
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatBps(value: number): string {
  return `${Math.round(value)} bps`;
}

export function formatSigma(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}σ`;
}

export function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function formatYield(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatCompact(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatTvl(value: number): string {
  return `$${formatCompact(value)}`;
}

export function formatApy(value: number): string {
  return `${value.toFixed(2)}%`;
}
