"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { api, type Report } from "@/lib/api";
import MemoHeader from "@/components/memo/MemoHeader";
import MemoTOC from "@/components/memo/MemoTOC";
import MemoSection from "@/components/memo/MemoSection";
import MemoErrorBoundary from "@/components/memo/MemoErrorBoundary";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function renderCitations(text: string): (string | React.ReactElement)[] {
  const parts: (string | React.ReactElement)[] = [];
  const regex = /\[([^\]]+?,\s*\d{4}-\d{2}-\d{2})\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="memo-citation">
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function processChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string") {
    const result = renderCitations(children);
    return result.length === 1 && typeof result[0] === "string"
      ? children
      : result;
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        const result = renderCitations(child);
        return result.length === 1 && typeof result[0] === "string"
          ? child
          : <span key={i}>{result}</span>;
      }
      return child;
    });
  }

  return children;
}

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .getReport(params.id)
      .then(setReport)
      .catch((err) => setError(err.message));
  }, [params.id]);

  const handleDelete = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await api.deleteReport(params.id);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }, [params.id, router]);

  const markdownComponents = useMemo<Components>(
    () => ({
      h2: ({ children }) => {
        const text =
          typeof children === "string"
            ? children
            : String(children ?? "");
        const id = slugify(text);
        return <h2 id={id}>{children}</h2>;
      },
      p: ({ children }) => {
        const processed = processChildren(children);
        return <p>{processed}</p>;
      },
      li: ({ children }) => {
        const processed = processChildren(children);
        return <li>{processed}</li>;
      },
      td: ({ children }) => {
        const processed = processChildren(children);
        return <td>{processed}</td>;
      },
    }),
    []
  );

  if (error) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <p style={{ color: "var(--accent-red)", marginBottom: "16px" }}>
          {error}
        </p>
        <Link href="/" style={{ color: "var(--accent-purple)", fontSize: "0.875rem" }}>
          Back to Memo Library
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--fg-secondary)" }}>
        Loading report...
      </div>
    );
  }

  return (
    <div>
      {/* Top bar: back link + delete button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "0.875rem",
            color: "var(--accent-purple)",
            textDecoration: "none",
          }}
        >
          &larr; Back to Memo Library
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            backgroundColor: "transparent",
            color: "var(--accent-red)",
            fontSize: "0.8rem",
            padding: "6px 14px",
            border: "1px solid var(--accent-red)",
            borderRadius: "6px",
          }}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Memo header */}
      <MemoHeader report={report} />

      {/* Two-column layout: body + TOC sidebar */}
      <div
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "flex-start",
        }}
      >
        {/* Left column: memo body */}
        <div style={{ flex: "1 1 0%", minWidth: 0 }}>
          <MemoErrorBoundary fallbackContent={report.content.raw}>
            <MemoSection>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {report.content.raw}
              </ReactMarkdown>
            </MemoSection>
          </MemoErrorBoundary>
        </div>

        {/* Right column: TOC sidebar */}
        <aside
          style={{
            width: "240px",
            flexShrink: 0,
            position: "sticky",
            top: "80px",
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            alignSelf: "flex-start",
          }}
        >
          <MemoTOC content={report.content.raw} />
        </aside>
      </div>
    </div>
  );
}
