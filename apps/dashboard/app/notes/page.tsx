"use client";

import { useState, useEffect } from "react";
import styles from "./Notes.module.css";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("dashboard-notes");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem("dashboard-notes", JSON.stringify(notes));
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);
    if (loaded.length > 0) setActiveId(loaded[0].id);
    setMounted(true);
  }, []);

  const activeNote = notes.find((n) => n.id === activeId) ?? null;

  function handleCreate() {
    const newNote: Note = {
      id: generateId(),
      title: "Untitled",
      content: "",
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    setActiveId(newNote.id);
    saveNotes(updated);
  }

  function handleUpdate(field: "title" | "content", value: string) {
    if (!activeId) return;
    const updated = notes.map((n) =>
      n.id === activeId
        ? { ...n, [field]: value, updatedAt: new Date().toISOString() }
        : n
    );
    setNotes(updated);
    saveNotes(updated);
  }

  function handleDelete(id: string) {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null);
    }
  }

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Notes</span>
          <button onClick={handleCreate} className={styles.newBtn}>
            +
          </button>
        </div>
        <div className={styles.noteList}>
          {notes.map((note) => (
            <div
              key={note.id}
              className={`${styles.noteItem} ${note.id === activeId ? styles.active : ""}`}
              onClick={() => setActiveId(note.id)}
            >
              <span className={styles.noteItemTitle}>
                {note.title || "Untitled"}
              </span>
              <span className={styles.noteItemDate}>
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {notes.length === 0 && (
            <div className={styles.emptyList}>No notes yet</div>
          )}
        </div>
      </div>
      <div className={styles.editor}>
        {activeNote ? (
          <>
            <div className={styles.editorHeader}>
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdate("title", e.target.value)}
                className={styles.titleInput}
                placeholder="Note title..."
              />
              <button
                onClick={() => handleDelete(activeNote.id)}
                className={styles.deleteBtn}
              >
                Delete
              </button>
            </div>
            <textarea
              value={activeNote.content}
              onChange={(e) => handleUpdate("content", e.target.value)}
              className={styles.textarea}
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className={styles.noNote}>
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
