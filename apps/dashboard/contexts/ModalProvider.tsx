"use client";

import { useState, useCallback, type ReactNode } from "react";
import { ModalContext } from "./ModalContext";

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalProps, setModalProps] = useState<Record<string, unknown>>({});

  const openModal = useCallback(
    (id: string, props: Record<string, unknown> = {}) => {
      setActiveModal(id);
      setModalProps(props);
    },
    []
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalProps({});
  }, []);

  return (
    <ModalContext.Provider
      value={{ activeModal, modalProps, openModal, closeModal }}
    >
      {children}
    </ModalContext.Provider>
  );
}
