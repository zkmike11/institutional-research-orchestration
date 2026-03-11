'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, type Review, type ToolCallEntry } from '@/lib/api';
import ToolCallTracker from '@/components/review/ToolCallTracker';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<Review | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCallEntry[]>([]);
  const [expectedTotal, setExpectedTotal] = useState(65);
  const [status, setStatus] = useState<string>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial review state (renders immediately, doesn't depend on SSE)
  useEffect(() => {
    api
      .getReview(id)
      .then((data) => {
        setReview(data);
        setToolCalls(data.toolCalls ?? []);
        setStatus(data.status);
      })
      .catch((err) => {
        setStatus('failed');
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load review',
        );
      });
  }, [id]);

  // Connect to SSE stream directly to API (bypasses Next.js proxy which buffers SSE)
  useEffect(() => {
    const sseBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const es = new EventSource(`${sseBase}/api/reviews/${id}/stream`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'init': {
            if (data.review) {
              setStatus(data.review.status);
              setReview(data.review);
              setToolCalls(data.review.toolCalls ?? []);
              // If already complete, close the stream
              if (data.review.status === 'complete' || data.review.status === 'failed') {
                es.close();
              }
            }
            break;
          }

          case 'tool_call': {
            setToolCalls((prev) => {
              const updated = [...prev];
              updated[data.index - 1] = {
                name: data.name,
                args: data.args,
                status: data.status,
              };
              return updated;
            });
            break;
          }

          case 'tool_complete': {
            setToolCalls((prev) => {
              const updated = [...prev];
              updated[data.index - 1] = {
                name: data.name,
                args: data.args,
                status: data.status,
                latency_ms: data.latency_ms,
              };
              return updated;
            });
            break;
          }

          case 'complete': {
            setStatus('complete');
            setExpectedTotal(data.tool_calls_count ?? 35);
            api.getReview(id).then((updated) => {
              setReview(updated);
              setToolCalls(updated.toolCalls ?? []);
            });
            es.close();
            break;
          }

          case 'error': {
            setStatus('failed');
            setErrorMessage(data.message ?? 'An error occurred');
            es.close();
            break;
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setStatus((prev) => {
        if (prev === 'complete' || prev === 'failed') return prev;
        setErrorMessage('Lost connection to server');
        return 'failed';
      });
      es.close();
    };

    return () => {
      es.close();
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div style={styles.wrapper}>
        <p style={styles.loadingText}>Loading review...</p>
      </div>
    );
  }

  const protocolDisplay = review?.protocolName ?? 'Protocol';
  const completedCount = toolCalls.filter((tc) => tc?.status === 'complete').length;

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.heading}>Reviewing {protocolDisplay}</h1>

      {status === 'running' && (
        <p style={styles.subtitle}>Committee review in progress...</p>
      )}

      {status === 'complete' && (
        <div style={styles.successBox}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
            Review Complete
          </div>
          <p style={{ margin: '4px 0' }}>
            The committee review for <strong>{protocolDisplay}</strong> has been saved.
          </p>
          <p style={{ margin: '4px 0', color: 'var(--accent-green)', fontSize: '0.875rem' }}>
            {completedCount} tool calls completed.
          </p>
          <div style={styles.actions}>
            {review?.reportId && (
              <Link href={`/reports/${review.reportId}`} style={styles.btnPrimary}>
                View Memo
              </Link>
            )}
            <Link href="/" style={styles.btnSecondary}>
              Back to Library
            </Link>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div style={styles.errorBox}>
          <strong>Review Failed</strong>
          {errorMessage && <p style={{ marginTop: 4 }}>{errorMessage}</p>}
        </div>
      )}

      <ToolCallTracker
        toolCalls={toolCalls}
        expectedTotal={expectedTotal}
        status={status}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '48px 24px',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 400,
    fontFamily: "var(--font-heading), Georgia, 'Times New Roman', serif",
    marginBottom: 8,
  },
  subtitle: {
    color: 'var(--fg-secondary)',
    fontSize: '0.9375rem',
    marginBottom: 8,
  },
  loadingText: {
    color: 'var(--fg-secondary)',
    fontSize: '0.9375rem',
  },
  successBox: {
    padding: '16px 20px',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderLeft: '3px solid var(--accent-green)',
    borderRadius: 0,
    color: 'var(--fg)',
    marginTop: 16,
  },
  errorBox: {
    padding: '16px 20px',
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: 'var(--accent-red)',
    marginTop: 16,
  },
  actions: {
    display: 'flex',
    gap: 12,
    marginTop: 12,
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: 'var(--accent)',
    borderRadius: 6,
    textDecoration: 'none',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--fg)',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 6,
    textDecoration: 'none',
  },
};
