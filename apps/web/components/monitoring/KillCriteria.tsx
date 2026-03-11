'use client';

export interface KillCriterion {
  id: string;
  criteria: string;
  status: 'active' | 'triggered' | 'retired';
  monitoringSource: string | null;
  checkFrequency: string | null;
  triggerThreshold: string | null;
  lastChecked: string | null;
  triggeredAt: string | null;
}

interface KillCriteriaProps {
  criteria: KillCriterion[];
}

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  active: { color: 'var(--accent-green)', bg: 'rgba(34,197,94,0.08)' },
  triggered: { color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.08)' },
  retired: { color: 'var(--fg-secondary)', bg: 'rgba(255,255,255,0.02)' },
};

export default function KillCriteria({ criteria }: KillCriteriaProps) {
  if (!criteria.length) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Kill Criteria</h3>
      <div style={styles.list}>
        {criteria.map((kc) => {
          const st = STATUS_STYLES[kc.status] || STATUS_STYLES.active;
          return (
            <div key={kc.id} style={{ ...styles.item, borderLeftColor: st.color, backgroundColor: st.bg }}>
              <div style={styles.topRow}>
                <span style={{ ...styles.status, color: st.color }}>
                  {kc.status.toUpperCase()}
                </span>
                {kc.checkFrequency && (
                  <span style={styles.freq}>
                    Check: {kc.checkFrequency}
                  </span>
                )}
              </div>
              <p style={styles.text}>{kc.criteria}</p>
              {kc.triggerThreshold && (
                <p style={styles.threshold}>Threshold: {kc.triggerThreshold}</p>
              )}
            </div>
          );
        })}
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
    borderLeft: '2px solid',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  status: {
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  freq: {
    fontSize: '0.6875rem',
    color: 'var(--fg-secondary)',
  },
  text: {
    fontSize: '0.875rem',
    color: 'var(--fg)',
    margin: 0,
    lineHeight: 1.5,
  },
  threshold: {
    fontSize: '0.8125rem',
    color: 'var(--fg-secondary)',
    margin: '4px 0 0',
  },
};
