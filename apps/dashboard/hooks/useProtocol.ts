"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProtocolDetail, GovernanceSummary } from "@/lib/types/crypto";

export function useProtocol(slug: string | null, snapshotSpace?: string) {
  const [protocol, setProtocol] = useState<ProtocolDetail | null>(null);
  const [governance, setGovernance] = useState<GovernanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const fetches: Promise<any>[] = [
        fetch(`/api/crypto/protocol?slug=${encodeURIComponent(slug)}`).then((r) => {
          if (!r.ok) throw new Error(`Protocol fetch failed: ${r.status}`);
          return r.json();
        }),
      ];

      if (snapshotSpace) {
        fetches.push(
          fetch(`/api/crypto/governance?space=${encodeURIComponent(snapshotSpace)}`).then((r) => {
            if (!r.ok) return null;
            return r.json();
          })
        );
      }

      const [protocolData, govData] = await Promise.all(fetches);
      setProtocol(protocolData);
      setGovernance(govData ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [slug, snapshotSpace]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { protocol, governance, loading, error, refresh };
}
