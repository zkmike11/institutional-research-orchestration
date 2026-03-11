"use client";

import type { SortDir } from "@/hooks/useTableSort";
import styles from "./SortableHeader.module.css";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  activeSortKey: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
  className?: string;
}

export default function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = activeSortKey === sortKey;

  return (
    <th
      className={`${styles.header} ${className ?? ""}`}
      onClick={() => onSort(sortKey)}
    >
      <span className={styles.inner}>
        {label}
        {isActive && sortDir && (
          <span className={styles.arrow}>
            {sortDir === "asc" ? "\u25B2" : "\u25BC"}
          </span>
        )}
      </span>
    </th>
  );
}
