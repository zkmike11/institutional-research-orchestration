import styles from "./PercentBadge.module.css";

interface PercentBadgeProps {
  value: number;
  size?: "sm" | "md";
}

function percentBg(value: number): string {
  const clamped = Math.min(Math.abs(value), 50);
  const opacity = 0.08 + (clamped / 50) * 0.2;
  if (value >= 0) return `rgba(34, 197, 94, ${opacity.toFixed(2)})`;
  return `rgba(239, 68, 68, ${opacity.toFixed(2)})`;
}

export default function PercentBadge({ value, size = "md" }: PercentBadgeProps) {
  const isPositive = value >= 0;
  const formatted = `${isPositive ? "+" : ""}${value.toFixed(2)}%`;

  return (
    <span
      className={`${styles.badge} ${isPositive ? styles.positive : styles.negative} ${
        size === "sm" ? styles.sm : styles.md
      }`}
      style={{ backgroundColor: percentBg(value) }}
    >
      {formatted}
    </span>
  );
}
