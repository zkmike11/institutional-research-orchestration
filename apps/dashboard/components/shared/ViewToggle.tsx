"use client";

import styles from "./ViewToggle.module.css";

interface ViewToggleProps {
  mode: "bars" | "lines";
  onChange: (mode: "bars" | "lines") => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.btn} ${mode === "bars" ? styles.active : ""}`}
        onClick={() => onChange("bars")}
        aria-label="Bar chart view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="3" y1="4" x2="13" y2="4" />
          <line x1="3" y1="8" x2="10" y2="8" />
          <line x1="3" y1="12" x2="12" y2="12" />
        </svg>
      </button>
      <button
        className={`${styles.btn} ${mode === "lines" ? styles.active : ""}`}
        onClick={() => onChange("lines")}
        aria-label="Line chart view"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2 12 5.5 6 9 9 14 3" />
        </svg>
      </button>
    </div>
  );
}
