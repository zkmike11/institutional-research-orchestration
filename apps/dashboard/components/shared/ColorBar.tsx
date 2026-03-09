interface ColorBarProps {
  color?: string;
}

export default function ColorBar({ color = "var(--positive)" }: ColorBarProps) {
  return (
    <div
      style={{
        width: 3,
        height: "100%",
        minHeight: "inherit",
        borderRadius: 2,
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
  );
}
