"use client";

import { createContext, useContext } from "react";

export interface ModalContextValue {
  activeModal: string | null;
  modalProps: Record<string, unknown>;
  openModal: (id: string, props?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | undefined>(
  undefined
);

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return ctx;
}
