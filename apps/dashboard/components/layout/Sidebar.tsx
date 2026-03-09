"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

/* ── Dean's original 8 sidebar items ────────────────────── */
const primaryItems: NavItem[] = [
  {
    label: "Performance",
    href: "/performance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 13 6 8 10 11 16 4" />
        <polyline points="12 4 16 4 16 8" />
      </svg>
    ),
  },
  {
    label: "Risk / Reward",
    href: "/risk-reward",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1.5l1.5 3.5 3.5.5-2.5 2.5.5 3.5L9 10l-3 1.5.5-3.5L4 5.5l3.5-.5z" />
        <path d="M3 15l2-2" />
        <path d="M15 15l-2-2" />
        <path d="M9 14v2.5" />
      </svg>
    ),
  },
  {
    label: "Heatmap",
    href: "/heatmap",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="5" height="5" rx="0.5" />
        <rect x="11" y="2" width="5" height="5" rx="0.5" />
        <rect x="2" y="11" width="5" height="5" rx="0.5" />
        <rect x="11" y="11" width="5" height="5" rx="0.5" />
      </svg>
    ),
  },
  {
    label: "Fundamentals",
    href: "/fundamentals",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="7" />
        <line x1="9" y1="5.5" x2="9" y2="12.5" />
        <line x1="5.5" y1="9" x2="12.5" y2="9" />
      </svg>
    ),
  },
  {
    label: "News",
    href: "/news",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="14" height="12" rx="1.5" />
        <line x1="5" y1="7" x2="13" y2="7" />
        <line x1="5" y1="10" x2="10" y2="10" />
        <line x1="5" y1="13" x2="8" y2="13" />
      </svg>
    ),
  },
  {
    label: "Events",
    href: "/events",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3.5" width="14" height="12" rx="1.5" />
        <line x1="2" y1="7.5" x2="16" y2="7.5" />
        <line x1="6" y1="2" x2="6" y2="5" />
        <line x1="12" y1="2" x2="12" y2="5" />
      </svg>
    ),
  },
  {
    label: "Filings",
    href: "/filings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 2H5a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 005 16h8a1.5 1.5 0 001.5-1.5V6L10.5 2z" />
        <polyline points="10.5 2 10.5 6 14.5 6" />
        <line x1="6.5" y1="9.5" x2="11.5" y2="9.5" />
        <line x1="6.5" y1="12" x2="11.5" y2="12" />
      </svg>
    ),
  },
  {
    label: "Notes",
    href: "/notes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 2.5l3 3L6 15H3v-3L12.5 2.5z" />
        <line x1="10.5" y1="4.5" x2="13.5" y2="7.5" />
      </svg>
    ),
  },
];

/* ── Analysis views (not in Dean's sidebar) ─────────────── */
const analysisItems: NavItem[] = [
  {
    label: "Scanner",
    href: "/scanner",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="5.5" />
        <line x1="12.5" y1="12.5" x2="16" y2="16" />
      </svg>
    ),
  },
  {
    label: "Sectors",
    href: "/sectors",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="5" x2="15" y2="5" />
        <line x1="3" y1="9" x2="12" y2="9" />
        <line x1="3" y1="13" x2="14" y2="13" />
      </svg>
    ),
  },
  {
    label: "Deep Dive",
    href: "/deep-dive",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 14 5 8 8 10 11 5 14 9 16 4" />
      </svg>
    ),
  },
  {
    label: "Volatility",
    href: "/volatility",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 9 4 5 6 12 8 3 10 15 12 7 14 11 16 9" />
      </svg>
    ),
  },
  {
    label: "Top Movers",
    href: "/top-movers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5 12 9 4 13 12" />
        <line x1="6.5" y1="9.5" x2="11.5" y2="9.5" />
      </svg>
    ),
  },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <li>
      <Link
        href={item.href}
        className={`${styles.navItem} ${isActive ? styles.active : ""}`}
      >
        <span className={styles.icon}>{item.icon}</span>
        <span className={styles.label}>{item.label}</span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar}>
      <ul className={styles.navList}>
        {primaryItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname.startsWith(item.href)} />
        ))}
        <li className={styles.sectionDivider} />
        <li className={styles.sectionLabel}>Analysis</li>
        {analysisItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname.startsWith(item.href)} />
        ))}
      </ul>
    </nav>
  );
}
