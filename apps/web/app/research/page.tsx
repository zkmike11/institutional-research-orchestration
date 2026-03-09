export default function ResearchPage() {
  return (
    <>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "4px" }}>
          Research & Knowledge Base
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
          Protocol knowledge base and version diffing. Coming soon.
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          This section will house protocol documentation, governance change tracking,
          and version diffs to support IC research workflows.
        </p>
      </div>
    </>
  );
}
