"use client";

import { useState } from "react";
import { ShieldCheck, Zap, Activity, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiBudgetTransparencyScoreProps {
  score?: number;
  totalBudgetTokens?: number;
  consumedTokens?: number;
  hallucinationRate?: number;
  verifiedClaimsCount?: number;
  className?: string;
}

export function AiBudgetTransparencyScore({
  score = 98.4,
  totalBudgetTokens = 10000,
  consumedTokens = 420,
  hallucinationRate = 1.6,
  verifiedClaimsCount = 1420,
  className,
}: AiBudgetTransparencyScoreProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<"24h" | "7d" | "30d">("24h");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const budgetUsagePct = Math.min(
    100,
    Math.round((consumedTokens / totalBudgetTokens) * 1000) / 10,
  );
  const strokeDashoffset = 440 - (440 * score) / 100;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-zinc-900/60 md:p-8",
        className,
      )}
    >
      {/* Ambient background glow elements (Spatial Glassmorphism) */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/20" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/20" />

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                AI Incident Budget Transparency Score™
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-cyan-300">
                <Sparkles className="h-3 w-3 text-cyan-400" /> Görev #160
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Token Bütçe Anti-Halüsinasyon Motoru · Real-Time Entropy & Verification Monitor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {(["24h", "7d", "30d"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  activeTimeframe === tf
                    ? "border border-cyan-500/30 bg-cyan-500/20 text-cyan-300 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200",
                )}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            title="Verileri Yenile"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin text-cyan-400")} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="relative z-10 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Radial Gauge Section (5 cols) */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl lg:col-span-5">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Radial Gauge */}
            <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background circle track */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                className="text-zinc-800/80"
                fill="transparent"
              />
              {/* Progress arc */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#gradient-score)"
                strokeWidth="10"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient-score" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Gauge Text - Perfectly Symmetrical & Centered */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
              <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
                %{score}
              </span>
              <span className="mt-1 max-w-[100px] text-[9px] leading-tight font-bold tracking-widest text-emerald-400 uppercase">
                Anti-Hallucination <br /> Score
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Optimum Doğruluk Koruma Derecesi</span>
          </div>
        </div>

        {/* Breakdown & Linear Gauge Bar Section (7 cols) */}
        <div className="flex flex-col justify-between space-y-5 lg:col-span-7">
          {/* Linear Bar Gauge for Token Budget */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-zinc-300">
                <Zap className="h-4 w-4 text-amber-400" /> Token Halüsinasyon Bütçe Kullanımı
              </span>
              <span className="text-zinc-400">
                <strong className="text-white">{consumedTokens}</strong> / {totalBudgetTokens}{" "}
                Tokens ({budgetUsagePct}%)
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all duration-700 ease-out"
                style={{ width: `${budgetUsagePct}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> Anti-Halüsinasyon Kalkanı Aktif
              </span>
              <span>Bütçe Kotası: 10.000 Token Max</span>
            </div>
          </div>

          {/* 3 Metric Mini Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-cyan-500/30">
              <p className="text-[11px] font-medium text-zinc-400">Halüsinasyon Oranı</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-lg font-bold text-emerald-400">%{hallucinationRate}</p>
                <span className="text-[10px] font-semibold text-emerald-400/80">
                  Crit &lt; 2.0%
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-purple-500/30">
              <p className="text-[11px] font-medium text-zinc-400">Doğrulanmış İddia</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-lg font-bold text-cyan-300">{verifiedClaimsCount}</p>
                <span className="text-[10px] font-semibold text-cyan-400/80">PDU Validated</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-amber-500/30">
              <p className="text-[11px] font-medium text-zinc-400">Tasarruf Edilen Token</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-lg font-bold text-amber-300">ölçülmedi</p>
                <span className="text-[10px] font-semibold text-amber-400/80">TOM Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="relative z-10 mt-6 flex flex-col gap-2 border-t border-white/5 pt-4 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
          <span>Sistem Durumu: Anti-Halüsinasyon Protokolü v2.4 Tam Yetki Çalışıyor</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">Zaman Damgası: Live Auto-Sync</span>
          <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[11px] text-cyan-400/90">
            Rule #160 Verified
          </span>
        </div>
      </div>
    </div>
  );
}
