'use client';

import { useState, useCallback } from 'react';

interface MemoSearchProps {
  onSearch: (query: string) => void;
}

export default function MemoSearch({ onSearch }: MemoSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputWrapper}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="var(--fg-secondary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={styles.searchIcon}
        >
          <circle cx="7" cy="7" r="4.5" />
          <line x1="10.5" y1="10.5" x2="14" y2="14" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memos..."
          style={styles.input}
        />
        {query && (
          <button type="button" onClick={handleClear} style={styles.clearBtn}>
            &times;
          </button>
        )}
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 36px 10px 36px',
    fontSize: '0.875rem',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--fg)',
    outline: 'none',
  },
  clearBtn: {
    position: 'absolute',
    right: 8,
    background: 'none',
    border: 'none',
    color: 'var(--fg-secondary)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  },
};
