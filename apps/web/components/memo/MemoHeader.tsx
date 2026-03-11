import type { Report } from "@/lib/api";

const recommendationColors: Record<string, { bg: string; color: string }> = {
  BUY: { bg: "rgba(34, 197, 94, 0.15)", color: "var(--accent-green)" },
  WATCH: { bg: "rgba(234, 179, 8, 0.15)", color: "var(--accent-yellow)" },
  HOLD: { bg: "rgba(151, 159, 167, 0.12)", color: "var(--fg-secondary)" },
  REDUCE: { bg: "rgba(249, 115, 22, 0.15)", color: "var(--accent-orange)" },
  EXIT: { bg: "rgba(239, 68, 68, 0.15)", color: "var(--accent-red)" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface MemoHeaderProps {
  report: Report;
}

export default function MemoHeader({ report }: MemoHeaderProps) {
  const rec = report.recommendation.toUpperCase();
  const colors = recommendationColors[rec] ?? {
    bg: "rgba(151, 159, 167, 0.12)",
    color: "var(--fg-secondary)",
  };

  const metrics: { label: string; value: string }[] = [
    { label: "Maturation Phase", value: report.maturationPhase ?? "--" },
    {
      label: "Activism Score",
      value:
        report.activismScore != null ? String(report.activismScore) : "--",
    },
    { label: "Position Size", value: report.positionSize ?? "--" },
    { label: "Conviction", value: report.conviction ?? "--" },
    { label: "Date", value: formatDate(report.createdAt) },
  ];

  return (
    <div style={{ marginBottom: "32px" }}>
      {/* Protocol name + badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 400,
            lineHeight: 1.2,
            fontFamily: "var(--font-heading), Georgia, 'Times New Roman', serif",
          }}
        >
          {report.protocolName}
        </h1>

        <span
          style={{
            display: "inline-block",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: "9999px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            backgroundColor: colors.bg,
            color: colors.color,
          }}
        >
          {report.recommendation}
        </span>

        {report.isDemo && (
          <span
            style={{
              display: "inline-block",
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: "9999px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              backgroundColor: "rgba(151, 159, 167, 0.12)",
              color: "var(--fg-secondary)",
            }}
          >
            Demo
          </span>
        )}
      </div>

      {report.isDemo && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--fg-secondary)",
            marginTop: "-12px",
            marginBottom: "16px",
          }}
        >
          Sample report with pre-loaded data. Run a real review via CLI for live analysis.
        </p>
      )}

      {/* Metrics table */}
      <table
        style={{
          width: "auto",
          borderCollapse: "collapse",
          fontSize: "0.875rem",
        }}
      >
        <tbody>
          {metrics.map((m) => (
            <tr key={m.label}>
              <td
                style={{
                  padding: "6px 24px 6px 0",
                  color: "var(--fg-secondary)",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {m.label}
              </td>
              <td style={{ padding: "6px 0", fontWeight: 500 }}>{m.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--border)",
          marginTop: "24px",
        }}
      />
    </div>
  );
}
