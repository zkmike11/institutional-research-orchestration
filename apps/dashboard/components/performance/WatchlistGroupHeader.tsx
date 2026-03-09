interface WatchlistGroupHeaderProps {
  name: string;
  colSpan?: number;
}

export default function WatchlistGroupHeader({
  name,
  colSpan = 11,
}: WatchlistGroupHeaderProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          textTransform: "uppercase",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "var(--fg-secondary)",
          padding: "16px 12px 8px",
          borderBottom: "none",
        }}
      >
        {name}
      </td>
    </tr>
  );
}
