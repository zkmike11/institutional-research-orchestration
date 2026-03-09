"use client";

import { useState, useEffect } from "react";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import styles from "./Events.module.css";

interface MacroEvent {
  date: string;
  type: string;
  description: string;
  impact: "high" | "medium" | "low";
}

const IMPACT_COLORS: Record<string, string> = {
  high: "var(--negative)",
  medium: "var(--regime-elevated)",
  low: "var(--fg-secondary)",
};

const TYPE_COLORS: Record<string, string> = {
  FOMC: "var(--accent-purple)",
  CPI: "var(--accent-orange)",
  PPI: "var(--accent-yellow)",
  NFP: "var(--accent-blue)",
  GDP: "var(--accent-green)",
  EARNINGS: "var(--fg-secondary)",
  OTHER: "var(--fg-muted)",
};

export default function EventsPage() {
  const [events, setEvents] = useState<MacroEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        if (!cancelled) setEvents(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => { cancelled = true; };
  }, []);

  function formatDate(dateStr: string): string {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function daysUntil(dateStr: string): number {
    const target = new Date(dateStr + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / 86400000);
  }

  if (loading && !events) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Economic Calendar</h1>
          <p className={styles.subtitle}>Upcoming macro events</p>
        </div>
      </div>
      <div className={styles.list}>
        {events?.map((event, i) => {
          const days = daysUntil(event.date);
          return (
            <div key={i} className={styles.eventRow}>
              <div className={styles.dateCol}>
                <span className={styles.date}>{formatDate(event.date)}</span>
                <span className={styles.daysUntil}>
                  {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                </span>
              </div>
              <span
                className={styles.typeBadge}
                style={{ color: TYPE_COLORS[event.type] ?? "var(--fg-secondary)" }}
              >
                {event.type}
              </span>
              <span className={styles.description}>{event.description}</span>
              <span
                className={styles.impact}
                style={{ color: IMPACT_COLORS[event.impact] }}
              >
                {event.impact.toUpperCase()}
              </span>
            </div>
          );
        })}
        {events?.length === 0 && (
          <div className="empty-state">No upcoming events</div>
        )}
      </div>
    </div>
  );
}
