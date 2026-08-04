"use client";

import { useState, useEffect, useTransition } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Pulse, TrendUp, Cpu, Lightning, Sparkle } from "@phosphor-icons/react";
import { scoutNewAIIncidents } from "@/actions/scout";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const INITIAL_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}s`,
  throughput: 0,
  latency: 0,
}));

export function AIPulseVisualizer() {
  const t = useTranslations("admin");
  const [data, _setData] = useState(INITIAL_DATA);
  const [isPending, startTransition] = useTransition();

  const handleScout = () => {
    startTransition(async () => {
      const result = await scoutNewAIIncidents();
      if (result.success) {
        toast.success(`Vertex AI: Scouted ${result.count} new incidents`);
      } else {
        toast.error(`Vertex Scout Failed: ${result.error}`);
      }
    });
  };

  useEffect(() => {
    // Real data would come from a WebSocket or polling endpoint
    // Currently showing empty state until monitoring backend is connected
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-950/80 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="inline-flex items-center gap-2 font-mono text-lg font-bold tracking-widest text-white uppercase">
            <Pulse weight="duotone" className="text-brand-400 h-6 w-6" />
            {t("ai_pulse_ecosystem")}
          </h2>
          <button
            onClick={handleScout}
            disabled={isPending}
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-md border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 font-mono text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-900/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending && <span className="absolute inset-0 block animate-pulse bg-cyan-400/20" />}
            <Sparkle weight="duotone" className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Scouting..." : "Vertex Scout"}
          </button>
        </div>
        <div className="flex gap-4">
          <div className="text-brand-300 flex items-center gap-2 font-mono text-xs">
            <Lightning weight="duotone" className="h-4 w-4" /> {t("throughput")}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
            <Cpu weight="duotone" className="h-4 w-4" /> {t("latency")}
          </div>
        </div>
      </div>

      <div className="min-h-[300px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.2)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.9)",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="throughput"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorThroughput)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="latency"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLatency)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-white/50 uppercase">
            {t("avg_throughput")}
          </span>
          <span className="text-brand-300 font-mono text-lg font-bold">{t("94_2_req_s")}</span>
        </div>
        <div className="flex flex-col gap-1 border-l border-white/5 pl-4">
          <span className="font-mono text-[10px] text-white/50 uppercase">{t("p99_latency")}</span>
          <span className="font-mono text-lg font-bold text-cyan-400">{t("24ms")}</span>
        </div>
        <div className="flex flex-col gap-1 border-l border-white/5 pl-4">
          <span className="font-mono text-[10px] text-white/50 uppercase">
            {t("network_health")}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-lg font-bold text-green-400">
            <TrendUp className="h-4 w-4" /> 99.9%
          </span>
        </div>
      </div>
    </div>
  );
}
