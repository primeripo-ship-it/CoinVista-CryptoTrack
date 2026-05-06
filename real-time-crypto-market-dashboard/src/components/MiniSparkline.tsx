/**
 * MiniSparkline Component
 * Renders a tiny line chart using SVG for the 7-day price trend
 * Lightweight alternative to full chart libraries for table cells
 */
import React, { useMemo } from 'react';

interface MiniSparklineProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  isPositive,
  width = 120,
  height = 40,
}) => {
  const pathData = useMemo(() => {
    if (!data || data.length < 2) return '';

    // Sample ~30 points for performance
    const sampleRate = Math.max(1, Math.floor(data.length / 30));
    const sampled = data.filter((_, i) => i % sampleRate === 0);

    const min = Math.min(...sampled);
    const max = Math.max(...sampled);
    const range = max - min || 1;

    const points = sampled.map((val, i) => {
      const x = (i / (sampled.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });

    return `M${points.join('L')}`;
  }, [data, width, height]);

  const color = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = `spark-${isPositive ? 'up' : 'down'}-${Math.random().toString(36).substr(2, 5)}`;

  // Create area path for fill
  const areaPath = pathData ? `${pathData}L${width},${height}L0,${height}Z` : '';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {areaPath && (
        <path d={areaPath} fill={`url(#${gradientId})`} />
      )}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
