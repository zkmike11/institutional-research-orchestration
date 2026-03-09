"use client";

import styles from "./QuadrantGrid.module.css";

interface QuadrantGridProps {
  children: React.ReactNode;
}

export default function QuadrantGrid({ children }: QuadrantGridProps) {
  return <div className={styles.grid}>{children}</div>;
}
