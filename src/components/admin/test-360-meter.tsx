"use client";

import { useState } from "react";
import { run360ExpertAudit, type AiAuditMetrics } from "@/actions/admin-360-evaluation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Activity,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Test360Meter() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [metrics, setMetrics] = useState<AiAuditMetrics | null>(null);

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await run360ExpertAudit();
      if (res.ok && res.data) {
        setMetrics(res.data);
        toast.success("360° AI Audit completed successfully.");
      } else {
        toast.error(res.error || "Failed to complete AI Audit");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("An unexpected error occurred during the audit");
    } finally {
      setIsAuditing(false);
    }
  };

  const getRingColor = (score: number) => {
    if (score >= 98) return "text-emerald-400";
    if (score >= 90) return "text-cyan-400";
    return "text-amber-400";
  };

  return (
    <section className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-indigo-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/60 md:p-8">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 group-hover:bg-indigo-500/20" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-400">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                360° Expert AI Audit Meter
              </h2>
              <p className="text-xs text-zinc-400">Swarm-based autonomous system validation</p>
            </div>
          </div>
          <Button
            onClick={handleAudit}
            disabled={isAuditing}
            className="rounded-full border border-indigo-500/50 bg-indigo-500/20 px-4 py-2 text-xs font-semibold text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all hover:bg-indigo-500/30 hover:text-white"
          >
            {isAuditing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Swarm Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Network className="h-4 w-4" /> Run 360° Audit
              </span>
            )}
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Data Integrity", score: metrics?.integrityScore, icon: ShieldCheck },
            { label: "BotGuard Evasion", score: metrics?.botGuardScore, icon: Zap },
            { label: "Resilience", score: metrics?.resilienceScore, icon: Activity },
            { label: "Swarm Consensus", score: metrics?.consensusScore, icon: Network },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="relative h-20 w-20">
                {/* SVG Ring Background */}
                <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                  <path
                    className="stroke-white/10"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    strokeWidth="3"
                  />
                  {item.score !== undefined && (
                    <path
                      className={cn(
                        "transition-all duration-1000 ease-out",
                        getRingColor(item.score),
                      )}
                      strokeDasharray={`${item.score}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3"
                      stroke="currentColor"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  {item.score !== undefined ? (
                    <span className="text-lg font-bold text-white">{item.score}%</span>
                  ) : (
                    <item.icon className="h-6 w-6 text-zinc-500" />
                  )}
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-zinc-400">{item.label}</p>
            </div>
          ))}
        </div>

        {/* AI Insights Panel */}
        {metrics && (
          <div className="mt-4 rounded-xl border border-white/5 bg-black/40 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              AI Swarm Insights
            </h3>
            <div className="space-y-2">
              {metrics.aiInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="mt-0.5 text-indigo-400/50">›</span>
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
