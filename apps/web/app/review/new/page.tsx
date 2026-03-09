'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function NewReviewPage() {
  const router = useRouter();
  const [protocolName, setProtocolName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!protocolName.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const review = await api.startReview(
        protocolName.trim(),
        notes.trim() || undefined,
      );
      router.push(`/review/${review.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start review');
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.heading}>New Committee Review</h1>
      <p style={styles.subtitle}>
        Run a full 7-step investment committee review on a DeFi protocol.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label htmlFor="protocolName" style={styles.label}>
            Protocol Name
          </label>
          <input
            id="protocolName"
            type="text"
            value={protocolName}
            onChange={(e) => setProtocolName(e.target.value)}
            placeholder="e.g. Aave, Uniswap, Morpho"
            required
            disabled={submitting}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="notes" style={styles.label}>
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific focus areas or context for the review..."
            rows={4}
            disabled={submitting}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={submitting || !protocolName.trim()}>
          {submitting ? 'Starting...' : 'Start Review'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '48px 24px',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    color: 'var(--muted)',
    fontSize: '0.9375rem',
    marginBottom: 32,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  error: {
    color: 'var(--accent-red)',
    fontSize: '0.875rem',
  },
};
