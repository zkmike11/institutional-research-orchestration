export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function zScore(
  current: number,
  data: number[]
): number {
  if (data.length < 2) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return (current - mean) / stdDev;
}

export function computeRatio(
  numerator: { date: string; close: number }[],
  denominator: { date: string; close: number }[]
): { time: string; value: number }[] {
  const denomMap = new Map(denominator.map((d) => [d.date, d.close]));

  return numerator
    .filter((n) => denomMap.has(n.date))
    .map((n) => ({
      time: n.date,
      value: denomMap.get(n.date)! !== 0 ? n.close / denomMap.get(n.date)! : 0,
    }));
}

export function rollingStdDev(
  data: number[],
  window: number
): number[] {
  const result: number[] = [];
  for (let i = window - 1; i < data.length; i++) {
    const slice = data.slice(i - window + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / slice.length;
    result.push(Math.sqrt(variance));
  }
  return result;
}

export function dailyReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

export function annualizedVolatility(dailyReturns: number[]): number {
  if (dailyReturns.length === 0) return 0;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyReturns.length;
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}
