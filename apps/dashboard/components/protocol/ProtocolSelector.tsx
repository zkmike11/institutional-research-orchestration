"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ProtocolTvlEntry } from "@/lib/types/crypto";
import styles from "./ProtocolSelector.module.css";

const DEFAULT_SLUGS = [
  "aave",
  "uniswap",
  "lido",
  "maker",
  "compound",
  "curve-dex",
  "eigenlayer",
  "ethena",
  "morpho",
];

interface ProtocolSelectorProps {
  selected: string | null;
  onSelect: (slug: string) => void;
}

export default function ProtocolSelector({
  selected,
  onSelect,
}: ProtocolSelectorProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [protocols, setProtocols] = useState<ProtocolTvlEntry[]>([]);
  const [fetched, setFetched] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch protocol list on first interaction
  const ensureFetched = useCallback(async () => {
    if (fetched) return;
    setFetched(true);
    try {
      const res = await fetch("/api/crypto/defi-overview");
      if (!res.ok) return;
      const data = await res.json();
      if (data.tvlLeaders) setProtocols(data.tvlLeaders);
    } catch {
      // silently fail
    }
  }, [fetched]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Build filtered list
  const lowerQuery = query.toLowerCase();
  let filtered: { name: string; slug: string }[];

  if (protocols.length > 0) {
    filtered = protocols
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.slug.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 20)
      .map((p) => ({ name: p.name, slug: p.slug }));
  } else {
    // Before data loads, show defaults
    filtered = DEFAULT_SLUGS.filter((s) => s.includes(lowerQuery)).map(
      (s) => ({
        name: s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "),
        slug: s,
      })
    );
  }

  // Find display name for selected
  const selectedName =
    protocols.find((p) => p.slug === selected)?.name ??
    selected?.charAt(0).toUpperCase() + (selected?.slice(1) ?? "");

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrap}>
        <span className={styles.searchIcon}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="4.5" />
            <line x1="9.5" y1="9.5" x2="13" y2="13" />
          </svg>
        </span>
        <input
          type="text"
          className={styles.input}
          placeholder="Search protocols..."
          value={open ? query : selectedName || ""}
          onFocus={() => {
            setOpen(true);
            setQuery("");
            ensureFetched();
          }}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {open && (
        <div className={styles.dropdown}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No protocols found</div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.slug}
                className={`${styles.item} ${p.slug === selected ? styles.itemActive : ""}`}
                onClick={() => {
                  onSelect(p.slug);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {p.name}
                <span className={styles.itemSlug}>{p.slug}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
