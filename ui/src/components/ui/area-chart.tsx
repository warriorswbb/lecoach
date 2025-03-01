"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AreaChartProps {
  data: {
    name: string;
    [key: string]: number | string;
  }[];
  categories: {
    name: string;
    color: string;
  }[];
  index: string;
  labelKey?: string;
  valueFormatter?: string;
  colors?: string[];
  startColor?: string;
  endColor?: string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisWidth?: number;
  showAnimation?: boolean;
  showTooltip?: boolean;
  showGradient?: boolean;
  showLegend?: boolean;
  height?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  stacked?: boolean;
  chartMargin?: {
    top: number;
    right: number;
    left: number;
    bottom: number;
  };
  yAxisTicks?: number[];
}

export function AreaChartComponent({
  data,
  categories,
  index,
  labelKey,
  valueFormatter,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 40,
  showAnimation = true,
  showTooltip = true,
  showGradient = true,
  height = 300,
  title,
  subtitle,
  className,
  stacked = false,
  chartMargin = { top: 10, right: 10, left: 0, bottom: 10 },
  yAxisTicks,
}: AreaChartProps) {
  // Default formatter just returns the value as a string
  const formatValue = (value: number) => value.toString();

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <div className="mb-2">
          <h3 className="text-lg font-medium">{title}</h3>
          {subtitle && <p className="text-sm text-neutral-400">{subtitle}</p>}
        </div>
      )}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={chartMargin}>
            {showXAxis && (
              <XAxis
                dataKey={labelKey || index}
                tick={{ fill: "#888888" }}
                axisLine={{ stroke: "#444444" }}
                tickLine={{ stroke: "#444444" }}
                interval="preserveStartEnd"
              />
            )}
            {showYAxis && (
              <YAxis
                width={yAxisWidth}
                tick={{ fill: "#888888" }}
                axisLine={{ stroke: "#444444" }}
                tickLine={{ stroke: "#444444" }}
                tickFormatter={formatValue}
                domain={stacked ? [0, 100] : ["auto", "auto"]}
                ticks={yAxisTicks}
              />
            )}
            {showTooltip && (
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="rounded-lg border border-neutral-800 bg-[#121212] p-2 shadow-md">
                      <div className="text-xs text-neutral-400">{label}</div>
                      <div className="mt-1 space-y-1">
                        {payload.map((category, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-xs font-medium">
                              {category.name}:{" "}
                              {formatValue(category.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
            )}
            {categories.map((category, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={category.name}
                stackId={stacked ? "1" : undefined}
                stroke={category.color}
                strokeWidth={2}
                fill={category.color}
                fillOpacity={0.4}
                isAnimationActive={showAnimation}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
