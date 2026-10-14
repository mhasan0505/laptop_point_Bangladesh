"use client";

import { useId } from "react";
import type { SparklinePoint } from "@/lib/admin-dashboard";

interface SparklineProps {
  data: SparklinePoint[];
  color?: string;
  fillColor?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = "var(--color-primary)",
  fillColor,
  height = 36,
  width = 120,
  className,
}: SparklineProps) {
  const gradientId = useId();

  if (!data || data.length < 2) {
    return <div style={{ height, width }} className={className} />;
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const paddingX = 4;
  const paddingY = 4;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * usableWidth;
    const y = paddingY + usableHeight - ((d.value - minVal) / range) * usableHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor || color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={fillColor || color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  );
}
