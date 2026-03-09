import type { ReactNode } from "react";

interface MemoSectionProps {
  children: ReactNode;
}

export default function MemoSection({ children }: MemoSectionProps) {
  return <div className="memo-body">{children}</div>;
}
