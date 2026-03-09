export interface YieldCurvePoint {
  maturity: string;
  yield: number;
}

export interface YieldCurveSnapshot {
  label: string;
  color: string;
  dashed: boolean;
  points: YieldCurvePoint[];
}

export interface SpreadData {
  date: string;
  spread: number;
}

export type SpreadPair = "3M/10Y" | "2Y/5Y" | "5Y/30Y" | "10Y/30Y";
