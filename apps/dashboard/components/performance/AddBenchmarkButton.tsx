"use client";

import { useState, useRef, useCallback } from "react";

interface AddBenchmarkButtonProps {
  onAdd: (symbol: string) => void;
}

export default function AddBenchmarkButton({ onAdd }: AddBenchmarkButtonProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(() => {
    const trimmed = value.trim().toUpperCase();
    if (trimmed) {
      onAdd(trimmed);
    }
    setValue("");
    setEditing(false);
  }, [value, onAdd]);

  const handleClick = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "Escape") {
      setValue("");
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={submit}
        onKeyDown={handleKeyDown}
        placeholder="Enter ticker..."
        style={{
          width: 120,
          padding: "4px 8px",
          fontSize: "0.8125rem",
          border: "1px solid var(--border)",
          borderRadius: 4,
          backgroundColor: "var(--bg-card)",
          color: "var(--fg)",
          outline: "none",
        }}
      />
    );
  }

  return (
    <button
      onClick={handleClick}
      style={{
        width: 28,
        height: 28,
        padding: 0,
        fontSize: "1rem",
        color: "var(--fg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        backgroundColor: "transparent",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      +
    </button>
  );
}
