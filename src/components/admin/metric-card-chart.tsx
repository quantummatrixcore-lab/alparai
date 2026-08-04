"use client";

import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";

interface SparkPoint {
  value: number;
}

interface MetricCardChartProps {
  sparkData: SparkPoint[];
  chartType: "line" | "bar";
  accentColor: string;
}

export function MetricCardChart({ sparkData, chartType, accentColor }: MetricCardChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === "bar" ? (
        <BarChart data={sparkData}>
          <Bar dataKey="value" fill={accentColor} radius={[2, 2, 0, 0]} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "none", fontSize: 10 }}
            cursor={false}
          />
        </BarChart>
      ) : (
        <LineChart data={sparkData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={accentColor}
            strokeWidth={1.5}
            dot={false}
          />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "none", fontSize: 10 }}
            cursor={false}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
