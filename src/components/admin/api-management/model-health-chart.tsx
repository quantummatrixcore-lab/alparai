"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LatencyData {
  date: string;
  openai: number;
  anthropic: number;
  google: number;
  supabase: number;
}

export function ModelHealthChart({ data }: { data: LatencyData[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            style={{ fontSize: 12 }}
            label={{ value: "ms", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            cursor={false}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="openai"
            stroke="#f59e0b"
            strokeWidth={2}
            name="OpenAI"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="anthropic"
            stroke="#6366f1"
            strokeWidth={2}
            name="Anthropic"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="google"
            stroke="#10b981"
            strokeWidth={2}
            name="Google"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="supabase"
            stroke="#ec4899"
            strokeWidth={2}
            name="Supabase"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
