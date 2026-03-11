'use client';

export interface Signpost {
  id: string;
  description: string;
  status: 'intact' | 'at_risk' | 'triggered';
  convictionImpact: number | null;
  lastChecked: string | null;
  triggeredAt: string | null;
  evidence: string | null;
}

interface SignpostListProps {
  signposts: Signpost[];
}

const STATUS_COLORS: Record<string, string> = {
  intact: 'var(--accent-green)',
  at_risk: '#eab308',
  triggered: 'var(--accent-red)',
};

const STATUS_LABELS: Record<string, string> = {
  intact: 'INTACT',
  at_risk: 'AT RISK',
  triggered: 'TRIGGERED',
};

export default function SignpostList({ signposts }: SignpostListProps) {
  if (!signposts.length) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Monitoring Signposts</h3>
      <div style={styles.list}>
        {signposts.map((sp) => (
          <div key={sp.id} style={styles.item}>
            <div style={styles.row}>
              <span style={{
                ...styles.badge,
                color: STATUS_COLORS[sp.status],
                borderColor: STATUS_COLORS[sp.status],
              }}>
                {STATUS_LABELS[sp.status]}
              </span>
              {sp.convictionImpact !== null && (
                <span style={{
                  ...styles.impact,
                  color: sp.convictionImpact > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                }}>
                  {sp.convictionImpact > 0 ? '+' : ''}{sp.convictionImpact} conviction
                </span>
              )}
            </div>
            <p style={styles.description}>{sp.description}</p>
            {sp.evidence && (
              <p style={styles.evidence}>{sp.evidence}</p>
            )}
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
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  item: {
    padding: '12px 16px',
    borderLeft: '2px solid var(--border)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  badge: {
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '2px 8px',
    border: '1px solid',
    borderRadius: 3,
  },
  impact: {
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  description: {
    fontSize: '0.875rem',
    color: 'var(--fg)',
    margin: 0,
    lineHeight: 1.5,
  },
  evidence: {
    fontSize: '0.8125rem',
    color: 'var(--fg-secondary)',
    margin: '4px 0 0',
    fontStyle: 'italic',
  },
};
