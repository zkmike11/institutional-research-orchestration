"use client";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  filled?: boolean;
  strokeWidth?: number;
}

export default function Sparkline({
  data,
  color = "var(--sparkline-green)",
  width = 120,
  height = 40,
  filled = false,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = strokeWidth;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((value - min) / range) * innerHeight;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(" ");

  const polygonPoints = filled
    ? `${padding},${height - padding} ${polylinePoints} ${padding + innerWidth},${height - padding}`
    : "";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      {filled && (
        <polygon
          points={polygonPoints}
          fill={color}
          opacity={0.1}
        />
      )}
      <polyline
        points={polylinePoints}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
