"use client";

import styles from "./DropdownSelect.module.css";

interface DropdownSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export default function DropdownSelect({
  options,
  value,
  onChange,
}: DropdownSelectProps) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
