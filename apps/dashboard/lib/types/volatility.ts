export type RegimeLevel = "calm" | "elevated" | "fear" | "extreme";

export interface RegimeClassification {
  label: string;
  level: RegimeLevel;
}

export interface VolatilityMetric {
  name: string;
  symbol: string;
  value: number;
  change: number;
  regime: RegimeClassification;
  sparklineData: number[];
  description?: string;
}
