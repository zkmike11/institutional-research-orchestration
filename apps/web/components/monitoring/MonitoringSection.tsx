'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import SignpostList from './SignpostList';
import KillCriteria from './KillCriteria';
import ConvictionTimeline from './ConvictionTimeline';
import type { Signpost } from './SignpostList';
import type { KillCriterion } from './KillCriteria';
import type { ConvictionEntry } from './ConvictionTimeline';

interface MonitoringSectionProps {
  reportId: string;
}

export default function MonitoringSection({ reportId }: MonitoringSectionProps) {
  const [signposts, setSignposts] = useState<Signpost[]>([]);
  const [killCriteria, setKillCriteria] = useState<KillCriterion[]>([]);
  const [convictionEntries, setConvictionEntries] = useState<ConvictionEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getSignposts(reportId).catch(() => []),
      api.getKillCriteria(reportId).catch(() => []),
      api.getConvictionTimeline(reportId).catch(() => []),
    ]).then(([sp, kc, ct]) => {
      setSignposts(sp as Signpost[]);
      setKillCriteria(kc as KillCriterion[]);
      setConvictionEntries(ct as ConvictionEntry[]);
      setLoaded(true);
    });
  }, [reportId]);

  if (!loaded) return null;

  const hasData = signposts.length > 0 || killCriteria.length > 0 || convictionEntries.length > 0;
  if (!hasData) return null;

  return (
    <div style={styles.container}>
      <div style={styles.divider} />
      <h2 style={styles.sectionTitle}>Continuous Monitoring</h2>
      <SignpostList signposts={signposts} />
      <KillCriteria criteria={killCriteria} />
      <ConvictionTimeline entries={convictionEntries} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: 40,
  },
  divider: {
    height: 1,
    backgroundColor: 'var(--border)',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    color: 'var(--fg-secondary)',
    marginBottom: 8,
  },
};
