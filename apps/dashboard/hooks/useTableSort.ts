"use client";

import { useState, useMemo, useCallback } from "react";

export type SortDir = "asc" | "desc" | null;

export function useTableSort<T>(
  data: T[],
  accessor: (item: T, key: string) => number | null | undefined
) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const onSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        if (sortDir === "asc") {
          setSortDir("desc");
        } else if (sortDir === "desc") {
          setSortKey(null);
          setSortDir(null);
        } else {
          setSortDir("asc");
        }
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey, sortDir]
  );

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = accessor(a, sortKey) ?? -Infinity;
      const bVal = accessor(b, sortKey) ?? -Infinity;
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDir, accessor]);

  return { sorted, sortKey, sortDir, onSort };
}
