"use client";

import { useState, useEffect } from "react";
import type { TreemapNode } from "@/lib/types/heatmap";

export function useHeatmap(sector: string, period: string) {
  const [data, setData] = useState<TreemapNode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sector) {
      setData(null);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/heatmap?sector=${encodeURIComponent(sector)}&period=${encodeURIComponent(period)}`
        );
        if (!res.ok) throw new Error(`Failed to fetch heatmap: ${res.status}`);
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
  }, [sector, period]);

  return { data, loading, error };
}
