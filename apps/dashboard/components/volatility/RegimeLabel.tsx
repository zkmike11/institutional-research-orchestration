"use client";

import styles from "./RegimeLabel.module.css";

interface RegimeLabelProps {
  label: string;
  level: "calm" | "elevated" | "fear" | "extreme";
}

export default function RegimeLabel({ label, level }: RegimeLabelProps) {
  return (
    <span className={`${styles.badge} ${styles[level]}`}>
      {label}
    </span>
  );
}
