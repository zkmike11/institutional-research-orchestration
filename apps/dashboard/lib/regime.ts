import type { RegimeClassification, RegimeLevel } from "./types/volatility";

function classify(
  value: number,
  thresholds: [number, string, RegimeLevel][]
): RegimeClassification {
  for (const [threshold, label, level] of thresholds) {
    if (value < threshold) return { label, level };
  }
  const last = thresholds[thresholds.length - 1];
  return { label: last[1], level: last[2] };
}

export function classifyVIX(value: number): RegimeClassification {
  if (value < 15) return { label: "Calm", level: "calm" };
  if (value < 20) return { label: "Normal", level: "calm" };
  if (value < 25) return { label: "Elevated fear", level: "elevated" };
  if (value < 30) return { label: "High fear", level: "fear" };
  return { label: "Extreme fear", level: "extreme" };
}

export function classifyVIXRatio(value: number): RegimeClassification {
  if (value < 0.85) return { label: "Normal contango", level: "calm" };
  if (value < 0.95) return { label: "Mild caution", level: "calm" };
  if (value < 1.0) return { label: "Elevated — Caution", level: "elevated" };
  if (value < 1.1) return { label: "Backwardation — Panic", level: "fear" };
  return { label: "Extreme backwardation", level: "extreme" };
}

export function classifyVXN(value: number, vix: number): RegimeClassification {
  const spread = value - vix;
  if (value < 18) return { label: "Calm", level: "calm" };
  if (value < 25) return { label: `Elevated (+${spread.toFixed(1)} vs VIX)`, level: "elevated" };
  if (value < 35) return { label: `High (+${spread.toFixed(1)} vs VIX)`, level: "fear" };
  return { label: `Extreme (+${spread.toFixed(1)} vs VIX)`, level: "extreme" };
}

export function classifyMOVE(value: number): RegimeClassification {
  if (value < 80) return { label: "Calm", level: "calm" };
  if (value < 100) return { label: "Mild stress", level: "elevated" };
  if (value < 120) return { label: "Elevated", level: "fear" };
  return { label: "Bond stress", level: "extreme" };
}

export function classifySKEW(value: number): RegimeClassification {
  if (value < 120) return { label: "Low tail risk", level: "calm" };
  if (value < 135) return { label: "Normal", level: "calm" };
  if (value < 150) return { label: "Elevated tail risk", level: "elevated" };
  return { label: "Extreme crash fear", level: "extreme" };
}

export function classifyVVIX(value: number): RegimeClassification {
  if (value < 85) return { label: "Calm", level: "calm" };
  if (value < 100) return { label: "Normal", level: "calm" };
  if (value < 120) return { label: "Elevated", level: "elevated" };
  return { label: "Vol-of-vol stress", level: "extreme" };
}

export function classifyImpliedCorrelation(value: number): RegimeClassification {
  if (value < 20) return { label: "Healthy rotation", level: "calm" };
  if (value < 35) return { label: "Moderate", level: "elevated" };
  if (value < 50) return { label: "High correlation", level: "fear" };
  return { label: "Correlation spike", level: "extreme" };
}
