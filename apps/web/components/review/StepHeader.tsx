'use client';

interface StepHeaderProps {
  label: string;
  color: string;
}

export default function StepHeader({ label, color }: StepHeaderProps) {
  return (
    <div style={{
      padding: '6px 16px',
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      color,
      textTransform: 'uppercase' as const,
      borderTop: '1px solid var(--border)',
      marginTop: 4,
    }}>
      {label}
    </div>
  );
}
