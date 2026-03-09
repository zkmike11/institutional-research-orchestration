"use client";

import { useState } from "react";
import styles from "./DateRangePicker.module.css";

interface DateRangePickerProps {
  onApply: (startDate: string, endDate: string) => void;
}

export default function DateRangePicker({ onApply }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function handleApply() {
    if (startDate && endDate) {
      onApply(startDate, endDate);
    }
  }

  return (
    <div className={styles.container}>
      <input
        type="date"
        className={styles.dateInput}
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <span className={styles.separator}>—</span>
      <input
        type="date"
        className={styles.dateInput}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button
        className={styles.applyButton}
        onClick={handleApply}
        disabled={!startDate || !endDate}
      >
        Apply
      </button>
    </div>
  );
}
