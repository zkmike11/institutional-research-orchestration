"use client";

import React from "react";

interface MemoErrorBoundaryProps {
  fallbackContent?: string;
  children: React.ReactNode;
}

interface MemoErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class MemoErrorBoundary extends React.Component<
  MemoErrorBoundaryProps,
  MemoErrorBoundaryState
> {
  constructor(props: MemoErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): MemoErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "16px",
              backgroundColor: "#fef2f2",
              border: "1px solid var(--accent-red)",
              borderRadius: "6px",
              color: "var(--accent-red)",
              fontSize: "0.85rem",
            }}
          >
            Something went wrong rendering this memo. Showing raw content
            below.
          </div>

          {this.props.fallbackContent && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                color: "var(--fg)",
              }}
            >
              {this.props.fallbackContent}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
