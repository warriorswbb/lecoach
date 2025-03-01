"use client";

interface CircleChartProps {
  value: number; // Percentage value (0-100)
  label: string; // Metric name
  color: string; // Circle color
  size?: number; // Size in pixels
}

export function CircleChart({ value, label, color, size = 120 }: CircleChartProps) {
  // Calculate circle values
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center" style={{ width: `${size}px` }}>
      <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
        {/* Background circle */}
        <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#333"
            strokeWidth="8"
          />
          {/* Foreground circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
          <span className="text-xs text-neutral-400 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
} 