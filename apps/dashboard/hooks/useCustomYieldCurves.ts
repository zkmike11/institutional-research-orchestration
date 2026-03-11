"use client";

import { useState, useEffect } from "react";
import type { YieldCurveSnapshot } from "@/lib/types/yield-curve";

export function useCustomYieldCurves(dates: string[]) {
  const [snapshots, setSnapshots] = useState<YieldCurveSnapshot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dates.length === 0) {
      setSnapshots([]);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ dates: dates.join(",") });
        const res = await fetch(`/api/yield-curve?${params}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json: YieldCurveSnapshot[] = await res.json();
        // API returns defaults + custom — extract only the custom ones (after the first 5)
        if (!cancelled) setSnapshots(json.slice(5));
      } catch {
        if (!cancelled) setSnapshots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [dates.join(",")]);

  return { snapshots, loading };
}
