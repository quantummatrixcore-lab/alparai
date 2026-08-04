"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DualChannelChartProps {
  wAudit: number;
  wIncident: number;
}

export function DualChannelChart({ wAudit, wIncident }: DualChannelChartProps) {
  const data = [
    { name: "Audit Pipeline", value: wAudit * 100 },
    { name: "Public Incidents", value: wIncident * 100 },
  ];

  const COLORS = ["#06b6d4", "#fb7185"]; // cyan-400 and rose-400

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
            }}
            itemStyle={{ color: "#e4e4e7" }}
            formatter={(value: unknown) => [`${value}%`, "Weight"]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
