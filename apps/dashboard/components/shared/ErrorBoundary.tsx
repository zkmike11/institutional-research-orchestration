"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "48px 32px",
            textAlign: "center",
            maxWidth: 480,
            margin: "40px auto",
          }}
        >
          <h2
            style={{
              color: "var(--fg)",
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              color: "var(--fg-secondary)",
              fontSize: "0.875rem",
              marginBottom: 24,
            }}
          >
            An unexpected error occurred. Try reloading the page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 6,
              padding: "8px 24px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
