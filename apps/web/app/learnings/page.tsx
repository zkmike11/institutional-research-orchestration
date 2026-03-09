"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Learning } from "@/lib/api";

const CATEGORIES = ["sector", "protocol", "data_quality", "methodology"] as const;

const categoryColors: Record<string, { bg: string; fg: string }> = {
  sector: { bg: "#dbeafe", fg: "#2563eb" },
  protocol: { bg: "#dcfce7", fg: "#16a34a" },
  data_quality: { bg: "#fef9c3", fg: "#ca8a04" },
  methodology: { bg: "#f3e8ff", fg: "#9333ea" },
};

function CategoryBadge({ category }: { category: string }) {
  const colors = categoryColors[category] ?? { bg: "#f5f5f5", fg: "#737373" };
  return (
    <span
      className="badge"
      style={{ backgroundColor: colors.bg, color: colors.fg }}
    >
      {category.replace("_", " ")}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LearningCard({ learning }: { learning: Learning }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <CategoryBadge category={learning.category} />
        <span style={{ fontSize: "0.75rem", color: "var(--fg-secondary)" }}>
          {formatDate(learning.createdAt)}
        </span>
      </div>

      <p style={{ fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "8px" }}>
        {learning.content}
      </p>

      <div style={{ display: "flex", gap: "16px" }}>
        {learning.protocol && (
          <span style={{ fontSize: "0.75rem", color: "var(--fg-secondary)" }}>
            Protocol: <strong>{learning.protocol}</strong>
          </span>
        )}
        {learning.source && (
          <span style={{ fontSize: "0.75rem", color: "var(--fg-secondary)" }}>
            Source: <strong>{learning.source}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

function AddLearningForm({ onAdded }: { onAdded: () => void }) {
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [protocol, setProtocol] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.addLearning({
        category,
        content: content.trim(),
        protocol: protocol.trim() || undefined,
        source: source.trim() || undefined,
      });
      setContent("");
      setProtocol("");
      setSource("");
      setCategory(CATEGORIES[0]);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add learning");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <label
          htmlFor="category"
          style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label
          htmlFor="content"
          style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Content
        </label>
        <textarea
          id="content"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the learning or insight..."
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label
            htmlFor="protocol"
            style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Protocol (optional)
          </label>
          <input
            id="protocol"
            type="text"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            placeholder="e.g. Aave, Uniswap"
          />
        </div>
        <div>
          <label
            htmlFor="source"
            style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--fg-secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Source (optional)
          </label>
          <input
            id="source"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. IC meeting, analyst review"
          />
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--accent-red)", fontSize: "0.875rem", marginBottom: "12px" }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting || !content.trim()}>
        {submitting ? "Saving..." : "Save Learning"}
      </button>
    </form>
  );
}

export default function LearningsPage() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchLearnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = search.trim()
        ? await api.searchLearnings(search.trim())
        : await api.getLearnings();
      setLearnings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load learnings");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchLearnings, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchLearnings, search]);

  return (
    <>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "4px" }}>
          Institutional Memory
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--fg-secondary)" }}>
          Learnings and insights from past reviews and IC discussions.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--fg-secondary)",
              fontSize: "0.875rem",
              pointerEvents: "none",
            }}
          >
            &#x1F50D;
          </span>
          <input
            type="search"
            placeholder="Search learnings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          style={{
            whiteSpace: "nowrap",
            backgroundColor: showForm ? "var(--bg-hover)" : "var(--accent)",
            color: showForm ? "var(--fg)" : "#fff",
          }}
        >
          {showForm ? "Cancel" : "Add Learning"}
        </button>
      </div>

      {showForm && (
        <AddLearningForm
          onAdded={() => {
            setShowForm(false);
            fetchLearnings();
          }}
        />
      )}

      {loading ? (
        <p style={{ color: "var(--fg-secondary)", fontSize: "0.875rem" }}>
          Loading learnings...
        </p>
      ) : error ? (
        <p style={{ color: "var(--accent-red)", fontSize: "0.875rem" }}>
          {error}
        </p>
      ) : learnings.length === 0 ? (
        <p style={{ color: "var(--fg-secondary)", fontSize: "0.875rem" }}>
          {search
            ? "No learnings match your search."
            : "No learnings recorded yet. Add one to get started."}
        </p>
      ) : (
        <div>
          {learnings.map((learning) => (
            <LearningCard key={learning.id} learning={learning} />
          ))}
        </div>
      )}
    </>
  );
}
