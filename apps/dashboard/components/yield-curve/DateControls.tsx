"use client";

import { useState } from "react";
import styles from "./DateControls.module.css";

interface DateControlsProps {
  onAdd?: (date: string) => void;
  onRemove?: () => void;
}

export default function DateControls({ onAdd, onRemove }: DateControlsProps) {
  const [dateValue, setDateValue] = useState("");

  return (
    <div className={styles.row}>
      <button
        className={styles.minusBtn}
        onClick={onRemove}
        aria-label="Remove comparison date"
      >
        −
      </button>
      <input
        type="date"
        className={styles.dateInput}
        value={dateValue}
        onChange={(e) => setDateValue(e.target.value)}
        placeholder="mm/dd/yyyy"
      />
      <button
        className={styles.plusBtn}
        onClick={() => {
          if (dateValue && onAdd) {
            onAdd(dateValue);
            setDateValue("");
          }
        }}
        aria-label="Add comparison date"
      >
        +
      </button>
    </div>
  );
}
