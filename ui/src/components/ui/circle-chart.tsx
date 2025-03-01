"use client";

import { useEffect, useState } from "react";

interface CircleChartProps {
  value: number; // Value (0-100)
  label: string; // Metric name
  color: string; // Circle color
  size?: number; // Size in pixels
  animate?: boolean; // Whether to animate value changes
}

export function CircleChart({ 
  value, 
  label, 
  color, 
  size = 140, 
  animate = false 
}: CircleChartProps) {
  // State for animated value
  const [animatedValue, setAnimatedValue] = useState(animate ? 0 : value);
  
  // Calculate circle values
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;
  
  // Handle animation
  useEffect(() => {
    if (!animate) {
      setAnimatedValue(value);
      return;
    }
    
    // Animate from current to target value
    const animationDuration = 1000; // ms
    const steps = 60;
    const stepDuration = animationDuration / steps;
    const increment = (value - animatedValue) / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedValue(value);
        clearInterval(timer);
      } else {
        setAnimatedValue(prev => Math.min(value, prev + increment));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [value, animate]);
  
  // Extract color components for gradient
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const rgb = hexToRgb(color);
  const gradientId = `circleGradient-${label.replace(/\s+/g, '')}`;
  
  return (
    <div className="flex flex-col items-center" style={{ width: `${size}px` }}>
      <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
        {/* Multiple shadow circles for depth */}
        <svg width={size} height={size} viewBox="0 0 100 100" className="absolute inset-0 transform -rotate-90">
          {/* Outer darker shadow */}
          <circle
            cx="50"
            cy="50"
            r={radius + 6}
            fill="#0c0c0c"
            stroke="#0c0c0c"
            strokeWidth="1"
          />
          {/* Inner shadow */}
          <circle
            cx="50"
            cy="50"
            r={radius + 3}
            fill="#1a1a1a"
            stroke="#1a1a1a"
            strokeWidth="1"
          />
        </svg>
        
        {/* Background circle */}
        <svg width={size} height={size} viewBox="0 0 100 100" className="absolute inset-0 transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#333"
            strokeWidth="8"
          />
        </svg>
        
        {/* Foreground circle with gradient */}
        <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={`rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 1)`} />
              <stop offset="100%" stopColor={`rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.7)`} />
            </linearGradient>
          </defs>
          
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: animate ? "stroke-dashoffset 0.8s ease-in-out" : "none" }}
          />
        </svg>
        
        {/* Value text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold transition-opacity duration-300"
                style={{ opacity: animatedValue > 0 ? 1 : 0 }}>
            {Math.round(animatedValue)}
          </span>
          <span className="text-xs text-neutral-400 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
} 