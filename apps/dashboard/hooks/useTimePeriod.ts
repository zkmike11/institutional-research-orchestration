"use client";

import { useState, useCallback } from "react";

const PERIOD_TO_RANGE_MAP: Record<string, string> = {
  "1D": "5d",
  "1W": "1w",
  "1M": "1m",
  "3M": "3m",
  "6M": "6m",
  YTD: "ytd",
  "1Y": "1y",
  "3Y": "3y",
};

export function useTimePeriod(defaultPeriod: string = "1D") {
  const [period, setPeriod] = useState(defaultPeriod);

  const periodToRange = useCallback((): string => {
    return PERIOD_TO_RANGE_MAP[period] ?? "1y";
  }, [period]);

  return { period, setPeriod, periodToRange };
}
