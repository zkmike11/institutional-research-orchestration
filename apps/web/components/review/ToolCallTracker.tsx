'use client';

import { useEffect, useRef } from 'react';
import type { ToolCallEntry } from '@/lib/api';
import { getStepForTool } from './stepMapping';
import StepHeader from './StepHeader';

interface ToolCallTrackerProps {
  toolCalls: ToolCallEntry[];
  expectedTotal?: number;
  status?: string;
}

function humanizeToolName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ToolCallTracker({
  toolCalls,
  expectedTotal = 65,
  status,
}: ToolCallTrackerProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const completedCount = toolCalls.filter(
    (tc) => tc?.status === 'complete',
  ).length;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [toolCalls.length]);

  const isRunning = status !== 'complete' && status !== 'failed';

  // Group tool calls by step and insert step headers
  let lastStepLabel = '';
  const rows: React.ReactNode[] = [];

  toolCalls.forEach((tc, i) => {
    if (!tc) return;
    const step = getStepForTool(tc.name);
    if (step.label !== lastStepLabel) {
      lastStepLabel = step.label;
      rows.push(
        <StepHeader key={`step-${i}`} label={step.label} color={step.color} />
      );
    }
    rows.push(
      <div key={i} style={styles.row}>
        <span style={styles.icon}>
          {tc.status === 'complete' && (
            <span style={{ color: 'var(--accent-green)' }}>&#10003;</span>
          )}
          {tc.status === 'running' && (
            <span style={styles.spinner}>&#10227;</span>
          )}
          {tc.status === 'error' && (
            <span style={{ color: 'var(--accent-red)' }}>&#10007;</span>
          )}
        </span>
        <span style={styles.name}>{humanizeToolName(tc.name)}</span>
        {tc.args && (
          <span style={styles.args}> &mdash; {tc.args}</span>
        )}
      </div>
    );
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        TOOL CALLS ({completedCount}/{expectedTotal})
      </div>

      <div ref={listRef} style={styles.list}>
        {isRunning && (
          <div style={styles.row}>
            <span style={styles.icon}>
              <span style={styles.spinner}>&#10227;</span>
            </span>
            <span style={styles.name}>Thinking...</span>
          </div>
        )}

        {toolCalls.length === 0 && !isRunning && (
          <p style={styles.empty}>No tool calls recorded.</p>
        )}

        {rows}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderLeft: '1px solid var(--border)',
    marginTop: 24,
  },
  header: {
    padding: '10px 16px',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: 'var(--fg-secondary)',
    textTransform: 'uppercase' as const,
  },
  list: {
    maxHeight: 600,
    overflowY: 'auto' as const,
  },
  empty: {
    padding: '24px 16px',
    color: 'var(--fg-secondary)',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 16px',
    fontSize: '0.8125rem',
  },
  icon: {
    width: 20,
    textAlign: 'center' as const,
    fontSize: '1rem',
    flexShrink: 0,
  },
  spinner: {
    display: 'inline-block',
    color: 'var(--accent-purple)',
    animation: 'spin 1s linear infinite',
  },
  name: {
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  args: {
    color: 'var(--fg-secondary)',
    fontSize: '0.75rem',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};
