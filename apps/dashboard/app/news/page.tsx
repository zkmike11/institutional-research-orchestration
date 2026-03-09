"use client";

import { useState, useEffect } from "react";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import styles from "./News.module.css";

interface NewsItem {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string;
  relatedTickers: string[];
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchNews = async () => {
      setLoading(true);
      try {
        const params = filter ? `?symbols=${encodeURIComponent(filter)}` : "";
        const res = await fetch(`/api/news${params}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setNews(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchNews();
    return () => { cancelled = true; };
  }, [filter]);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>News</h1>
          <p className={styles.subtitle}>Market headlines</p>
        </div>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by ticker (e.g. AAPL,MSFT)"
          className={styles.filterInput}
        />
      </div>
      {loading && !news ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className={styles.feed}>
          {news?.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.article}
            >
              <div className={styles.articleContent}>
                <span className={styles.articleTitle}>{item.title}</span>
                <div className={styles.meta}>
                  <span className={styles.publisher}>{item.publisher}</span>
                  <span className={styles.dot}>&middot;</span>
                  <span className={styles.time}>{timeAgo(item.publishedAt)}</span>
                  {item.relatedTickers.length > 0 && (
                    <>
                      <span className={styles.dot}>&middot;</span>
                      <span className={styles.tickers}>
                        {item.relatedTickers.slice(0, 3).join(", ")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </a>
          ))}
          {news?.length === 0 && (
            <div className="empty-state">No news articles found</div>
          )}
        </div>
      )}
    </div>
  );
}
