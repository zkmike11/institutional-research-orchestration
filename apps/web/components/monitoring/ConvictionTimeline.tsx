'use client';

export interface ConvictionEntry {
  id: string;
  conviction: string;
  probThesis: number | null;
  reason: string;
  source: string | null;
  createdAt: string;
}

interface ConvictionTimelineProps {
  entries: ConvictionEntry[];
}

const CONVICTION_COLORS: Record<string, string> = {
  LOW: 'var(--accent-red)',
  MEDIUM: '#eab308',
  HIGH: 'var(--accent-green)',
};

export default function ConvictionTimeline({ entries }: ConvictionTimelineProps) {
  if (!entries.length) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Conviction Timeline</h3>
      <div style={styles.timeline}>
        {entries.map((entry, i) => (
          <div key={entry.id} style={styles.entry}>
            <div style={styles.dotCol}>
              <div style={{
                ...styles.dot,
                backgroundColor: CONVICTION_COLORS[entry.conviction] || 'var(--fg-secondary)',
              }} />
              {i < entries.length - 1 && <div style={styles.line} />}
            </div>
            <div style={styles.content}>
              <div style={styles.topRow}>
                <span style={{
                  ...styles.level,
                  color: CONVICTION_COLORS[entry.conviction] || 'var(--fg-secondary)',
                }}>
                  {entry.conviction}
                </span>
                {entry.probThesis !== null && (
                  <span style={styles.prob}>
                    P(thesis) = {(entry.probThesis * 100).toFixed(0)}%
                  </span>
                )}
                {entry.source && (
                  <span style={styles.source}>{entry.source}</span>
                )}
              </div>
              <p style={styles.reason}>{entry.reason}</p>
              <time style={styles.date}>
                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: 32,
  },
  heading: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    color: 'var(--fg-secondary)',
    marginBottom: 12,
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  entry: {
    display: 'flex',
    gap: 12,
  },
  dotCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    width: 16,
    flexShrink: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 4,
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: 'var(--border)',
    minHeight: 16,
  },
  content: {
    paddingBottom: 16,
    flex: 1,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  level: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
  },
  prob: {
    fontSize: '0.75rem',
    color: 'var(--fg-secondary)',
    fontFamily: 'monospace',
  },
  source: {
    fontSize: '0.6875rem',
    color: 'var(--fg-secondary)',
    padding: '1px 6px',
    border: '1px solid var(--border)',
    borderRadius: 3,
  },
  reason: {
    fontSize: '0.8125rem',
    color: 'var(--fg)',
    margin: 0,
    lineHeight: 1.5,
  },
  date: {
    fontSize: '0.6875rem',
    color: 'var(--fg-secondary)',
    marginTop: 2,
    display: 'block',
  },
};
