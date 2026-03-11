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

  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#1a1a2e", color: "#ef4444", padding: 40, fontFamily: "monospace" }}>
          <h2 style={{ marginBottom: 16 }}>Runtime Error</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
            {this.state.error.message}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#888", marginTop: 12 }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
