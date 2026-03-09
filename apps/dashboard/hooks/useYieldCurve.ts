"use client";

import { useState, useEffect } from "react";
import type { YieldCurveSnapshot } from "@/lib/types/yield-curve";

export function useYieldCurve() {
  const [data, setData] = useState<YieldCurveSnapshot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/yield-curve");
        if (!res.ok)
          throw new Error(`Failed to fetch yield curve: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
