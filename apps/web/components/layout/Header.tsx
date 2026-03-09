"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Reports" },
  { href: "/learnings", label: "Learnings" },
  { href: "/research", label: "Research" },
  { href: "/review/new", label: "New Review" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-heading), Georgia, 'Times New Roman', serif",
            fontSize: "1.5rem",
            fontWeight: 400,
            textDecoration: "none",
            color: "var(--fg)",
            display: "block",
          }}
        >
          [Project Name]
        </Link>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--fg-secondary)",
            fontWeight: 400,
          }}
        >
          Investment Committee
        </span>
      </div>

      <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {navLinks.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: "var(--accent-blue)",
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
