"use client";

import { useState, useEffect } from "react";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import styles from "./Filings.module.css";

interface Filing {
  type: string;
  company: string;
  date: string;
  description: string;
  url: string;
}

export default function FilingsPage() {
  const [query, setQuery] = useState("AAPL");
  const [searchInput, setSearchInput] = useState("AAPL");
  const [filings, setFilings] = useState<Filing[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    const fetchFilings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/filings?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setFilings(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFilings();
    return () => { cancelled = true; };
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) setQuery(searchInput.trim().toUpperCase());
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>SEC Filings</h1>
          <p className={styles.subtitle}>Recent 10-K, 10-Q, and 8-K filings from EDGAR</p>
        </div>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search company or ticker"
            className={styles.input}
          />
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>
      </div>
      {loading && !filings ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className={styles.list}>
          {filings?.map((filing, i) => (
            <a
              key={i}
              href={filing.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.filingRow}
            >
              <span className={styles.filingType}>{filing.type}</span>
              <div className={styles.filingInfo}>
                <span className={styles.company}>{filing.company}</span>
                <span className={styles.description}>{filing.description}</span>
              </div>
              <span className={styles.date}>{filing.date}</span>
            </a>
          ))}
          {filings?.length === 0 && (
            <div className="empty-state">No filings found for &ldquo;{query}&rdquo;</div>
          )}
        </div>
      )}
    </div>
  );
}
