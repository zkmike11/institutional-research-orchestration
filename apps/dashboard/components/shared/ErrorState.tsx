interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="error-banner">
      <p style={{ fontSize: "1rem", fontWeight: 600, marginBottom: message ? 8 : 0 }}>
        Something went wrong
      </p>
      {message && (
        <p style={{ fontSize: "0.8125rem", color: "var(--fg-secondary)" }}>
          {message}
        </p>
      )}
    </div>
  );
}
