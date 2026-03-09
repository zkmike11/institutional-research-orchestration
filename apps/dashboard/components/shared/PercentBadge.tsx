import styles from "./PercentBadge.module.css";

interface PercentBadgeProps {
  value: number;
  size?: "sm" | "md";
}

export default function PercentBadge({ value, size = "md" }: PercentBadgeProps) {
  const isPositive = value >= 0;
  const formatted = `${isPositive ? "+" : ""}${value.toFixed(2)}%`;

  return (
    <span
      className={`${styles.badge} ${isPositive ? styles.positive : styles.negative} ${
        size === "sm" ? styles.sm : styles.md
      }`}
    >
      {formatted}
    </span>
  );
}
