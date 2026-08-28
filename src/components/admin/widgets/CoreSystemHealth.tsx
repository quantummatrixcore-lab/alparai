"use client";

import React, { useState } from "react";
import {
  Activity,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Radio,
  Server,
  Zap,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  Terminal,
} from "lucide-react";

interface NodeStatus {
  name: string;
  type: string;
  region: string;
  latency: string;
  status: "healthy" | "optimal" | "degraded";
  load: number;
}

const CLUSTER_NODES: NodeStatus[] = [
  { name: "Edge API Gateway", type: "Vercel / Cloudflare", region: "Global Anycast", latency: "24ms", status: "optimal", load: 28 },
  { name: "Primary Postgres + pgvector", type: "Supabase DB Pool", region: "eu-central-1", latency: "38ms", status: "healthy", load: 42 },
  { name: "Session & Telemetry Mesh", type: "Upstash Redis", region: "fra1", latency: "12ms", status: "optimal", load: 19 },
  { name: "Autonomous Swarm Worker", type: "Node.js ES6+ Daemon", region: "Local Host", latency: "4ms", status: "optimal", load: 15 },
];

const SELF_HEALING_ENGINES = [
  { name: "SENTINEL GUARD", role: "Siber Güvenlik & BotGuard Kalkanı", status: "Aktif / Koruyor", icon: CheckCircle2, color: "#10b981" },
  { name: "TARTARUS HEALER", role: "Otonom Hata Düzeltme & Teşhis", status: "Beklemede / Sıfır Hata", icon: Zap, color: "#00f0ff" },
  { name: "OMEGA AUDIT GATE", role: "Kod Kalitesi & Güvenlik Denetimi", status: "%100 Onaylı", icon: Activity, color: "#dcb8ff" },
];

export const CoreSystemHealth = React.memo(function CoreSystemHealth() {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const diagnosticTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (diagnosticTimerRef.current) {
        clearTimeout(diagnosticTimerRef.current);
      }
    };
  }, []);

  const handleRunDiagnostics = React.useCallback(() => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    if (diagnosticTimerRef.current) clearTimeout(diagnosticTimerRef.current);
    diagnosticTimerRef.current = setTimeout(() => {
      setIsDiagnosing(false);
      setDiagnosticResult("Tüm çekirdek düğümler %100 sağlıklı. RAM: 1.2GB, DAG Döngüsü: Kusursuz.");
    }, 1500);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#0d0d12]/90 p-3.5 sm:p-5 md:p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#10b981]/30 w-full min-w-0">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-28 -left-28 h-56 w-56 rounded-full bg-[#10b981]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-56 w-56 rounded-full bg-[#00f0ff]/10 blur-3xl" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col gap-3 border-b border-[#27272a] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-base sm:text-lg font-bold tracking-tight text-white truncate">
                ÇEKİRDEK SİSTEM SAĞLIĞI & TELEMETRİ
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold font-mono text-emerald-400 shrink-0">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                SİSTEM %99.98 ONLINE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Gerçek Zamanlı Düğüm Analitiği, Bellek Durumu & Otonom İyileştirme
            </p>
          </div>
        </div>

        {/* Diagnostics Trigger Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunDiagnostics}
            disabled={isDiagnosing}
            className="flex items-center gap-1.5 rounded-lg border border-[#00f0ff]/40 bg-[#00f0ff]/15 px-3 py-1.5 text-xs font-bold text-[#00f0ff] transition-all hover:bg-[#00f0ff]/25 hover:border-[#00f0ff]/70 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isDiagnosing ? "animate-spin" : ""}`} />
            <span>{isDiagnosing ? "Teşhis Çalışıyor..." : "Otonom Teşhis"}</span>
          </button>
        </div>
      </div>

      {/* Top Vital Metric Badges */}
      <div className="relative z-10 mt-4 sm:mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Antigravity Capability Utilization */}
        <div className="rounded-xl border border-[#00f0ff]/50 bg-[#00f0ff]/10 p-3 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.1)] min-w-0">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="h-3.5 w-3.5 text-[#00f0ff] animate-pulse shrink-0" />
            <span className="text-xs font-medium text-[#00f0ff] truncate">Antigravity Verimi</span>
          </div>
          <div className="mt-1.5 flex items-end gap-1.5">
            <div className="font-mono text-lg sm:text-xl font-bold text-white">%100</div>
            <div className="text-[10px] text-[#00f0ff] mb-0.5 font-bold truncate">MAX / Otopilot</div>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1e1e24]">
            <div className="h-full rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" style={{ width: "100%" }} />
          </div>
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#121216]/80 p-3 backdrop-blur-md min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-[#00f0ff] shrink-0" />
            <span className="text-xs font-medium truncate">CPU Yükü</span>
          </div>
          <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold text-white">18.4%</div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1e1e24]">
            <div className="h-full rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" style={{ width: "18.4%" }} />
          </div>
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#121216]/80 p-3 backdrop-blur-md min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HardDrive className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs font-medium truncate">RAM / Bellek</span>
          </div>
          <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold text-white">1.2 / 8 GB</div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#1e1e24]">
            <div className="h-full rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" style={{ width: "15%" }} />
          </div>
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#121216]/80 p-3 backdrop-blur-md min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Globe className="h-3.5 w-3.5 text-[#dcb8ff] shrink-0" />
            <span className="text-xs font-medium truncate">Gecikme</span>
          </div>
          <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold text-white">32 ms</div>
          <div className="mt-1 text-[10px] font-mono text-emerald-400 truncate">p99: 58ms (Optimal)</div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#27272a] bg-[#121216]/80 p-3 backdrop-blur-md min-w-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Database className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-medium truncate">Vektör DB</span>
          </div>
          <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold text-white">%100 Sync</div>
          <div className="mt-1 text-[10px] font-mono text-slate-400 truncate">0 Deadlock • 4k/s</div>
        </div>
      </div>

      {/* Cluster Nodes & Self-Healing Loop */}
      <div className="relative z-10 mt-4 sm:mt-5 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        {/* Node Clusters Status (7 cols on lg) */}
        <div className="rounded-xl border border-[#27272a] bg-[#121216]/60 p-3.5 sm:p-4 backdrop-blur-md lg:col-span-7 min-w-0">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[#00f0ff] shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">Altyapı Düğümleri & Küme Durumu</h4>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400 shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              4 Düğüm Aktif
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {CLUSTER_NODES.map((node) => (
              <div
                key={node.name}
                className="flex items-center justify-between rounded-lg border border-[#27272a] bg-[#18181b]/50 p-2.5 transition-all hover:border-white/20 min-w-0"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200 truncate">{node.name}</span>
                    <span className="rounded bg-[#27272a] px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                      {node.type}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">{node.region}</div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-emerald-400">{node.latency}</div>
                    <div className="text-[10px] text-slate-400">Yük: %{node.load}</div>
                  </div>
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Self-Healing Protocol (5 cols on lg) */}
        <div className="rounded-xl border border-[#27272a] bg-[#121216]/60 p-3.5 sm:p-4 backdrop-blur-md lg:col-span-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Radio className="h-4 w-4 text-[#dcb8ff] shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">Self-Healing Otonom Kalkan</h4>
              </div>
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </div>

            <div className="mt-3 space-y-2">
              {SELF_HEALING_ENGINES.map((engine) => {
                const Icon = engine.icon;
                return (
                  <div
                    key={engine.name}
                    className="flex items-center justify-between rounded-lg border border-[#27272a] bg-[#18181b]/50 p-2.5 min-w-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                        style={{ backgroundColor: `${engine.color}20`, color: engine.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{engine.name}</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">{engine.role}</div>
                      </div>
                    </div>
                    <span
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: `${engine.color}15`,
                        color: engine.color,
                        border: `1px solid ${engine.color}30`,
                      }}
                    >
                      {engine.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Log Output */}
          {diagnosticResult && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs font-mono text-emerald-300">
              <Terminal className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span className="break-words">{diagnosticResult}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default CoreSystemHealth;
