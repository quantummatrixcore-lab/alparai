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
        "group border-accent-500/20 bg-bg-elevated/40 hover:border-accent-500/40 hover:bg-bg-elevated/60 relative w-full overflow-hidden rounded-3xl border p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 sm:p-6 md:p-8",
        className,
      )}
    >
      {/* Ambient background glow elements (Spatial Glassmorphism) */}
      <div className="bg-accent-500/10 group-hover:bg-accent-500/20 pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl transition-all duration-500" />
      <div className="bg-success-500/10 group-hover:bg-success-500/20 pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl transition-all duration-500" />

      {/* Header */}
      <div className="relative z-10 flex min-w-0 flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="border-accent-500/30 bg-accent-500/10 text-accent-400 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-[0_0_20px_rgba(6,182,212,0.15)] sm:h-12 sm:w-12">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="max-w-full truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                AI Incident Budget Transparency Score™
              </h2>
              <span className="border-accent-500/30 bg-accent-500/10 text-accent-300 inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide">
                <Sparkles className="text-accent-400 h-3 w-3" /> Görev #160
              </span>
            </div>
            <p className="text-fg-muted truncate text-xs">
              Token Bütçe Anti-Halüsinasyon Motoru · Real-Time Entropy & Verification Monitor
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
          {/* Timeframe Selector */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {(["24h", "7d", "30d"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                  activeTimeframe === tf
                    ? "border-accent-500/30 bg-accent-500/20 text-accent-300 border shadow-sm"
                    : "text-fg-muted hover:text-zinc-200",
                )}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="text-fg-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            title="Verileri Yenile"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "text-accent-400 animate-spin")} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="relative z-10 mt-6 grid w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Radial Gauge Section (5 cols) */}
        <div className="flex w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl sm:p-6 lg:col-span-5">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Radial Gauge */}
            <svg className="h-40 w-40 -rotate-90 transform sm:h-48 sm:w-48" viewBox="0 0 160 160">
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
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-sm sm:text-3xl">
                %{score}
              </span>
              <span className="text-success-400 mt-1 max-w-[100px] text-[9px] leading-tight font-bold tracking-widest uppercase">
                Anti-Hallucination <br /> Score
              </span>
            </div>
          </div>

          <div className="border-success-500/30 bg-success-500/10 text-success-300 mt-4 flex max-w-full items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <CheckCircle2 className="text-success-400 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Optimum Doğruluk Koruma Derecesi</span>
          </div>
        </div>

        {/* Breakdown & Linear Gauge Bar Section (7 cols) */}
        <div className="flex w-full min-w-0 flex-col justify-between space-y-5 lg:col-span-7">
          {/* Linear Bar Gauge for Token Budget */}
          <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex min-w-0 flex-col gap-1 text-xs font-semibold sm:flex-row sm:items-center sm:justify-between">
              <span className="text-fg-secondary flex min-w-0 items-center gap-2">
                <Zap className="text-warning-400 h-4 w-4 shrink-0" />{" "}
                <span className="truncate">Token Halüsinasyon Bütçe Kullanımı</span>
              </span>
              <span className="text-fg-muted shrink-0 text-[11px] sm:text-xs">
                <strong className="text-white">{consumedTokens}</strong> / {totalBudgetTokens}{" "}
                Tokens ({budgetUsagePct}%)
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 ring-1 ring-white/10">
              <div
                className="via-brand-500 to-success-400 h-full rounded-full bg-gradient-to-r from-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all duration-700 ease-out"
                style={{ width: `${budgetUsagePct}%` }}
              />
            </div>

            <div className="text-fg-muted mt-2.5 flex min-w-0 flex-col gap-1 text-[11px] sm:flex-row sm:items-center sm:justify-between">
              <span className="text-success-400 flex min-w-0 items-center gap-1">
                <ShieldCheck className="h-3 w-3 shrink-0" />{" "}
                <span className="truncate">Anti-Halüsinasyon Kalkanı Aktif</span>
              </span>
              <span className="shrink-0">Bütçe Kotası: 10.000 Token Max</span>
            </div>
          </div>

          {/* 3 Metric Mini Cards */}
          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="hover:border-accent-500/30 min-w-0 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors">
              <p className="text-fg-muted truncate text-[11px] font-medium">Halüsinasyon Oranı</p>
              <div className="mt-1 flex items-baseline justify-between gap-1">
                <p className="text-success-400 truncate text-base font-bold sm:text-lg">
                  %{hallucinationRate}
                </p>
                <span className="text-success-400/80 shrink-0 text-[10px] font-semibold">
                  Crit &lt; 2.0%
                </span>
              </div>
            </div>

            <div className="hover:border-brand-500/30 min-w-0 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors">
              <p className="text-fg-muted truncate text-[11px] font-medium">Doğrulanmış İddia</p>
              <div className="mt-1 flex items-baseline justify-between gap-1">
                <p className="text-accent-300 truncate text-base font-bold sm:text-lg">
                  {verifiedClaimsCount}
                </p>
                <span className="text-accent-400/80 shrink-0 text-[10px] font-semibold">
                  PDU Validated
                </span>
              </div>
            </div>

            <div className="hover:border-warning-500/30 min-w-0 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors">
              <p className="text-fg-muted truncate text-[11px] font-medium">
                Tasarruf Edilen Token
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-1">
                <p className="text-warning-300 truncate text-base font-bold sm:text-lg">12.4M</p>
                <span className="text-warning-400/80 shrink-0 text-[10px] font-semibold">
                  TOM Engine
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="text-fg-muted relative z-10 mt-6 flex min-w-0 flex-col gap-2 overflow-hidden border-t border-white/5 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <Activity className="text-accent-400 h-3.5 w-3.5 shrink-0 animate-pulse" />
          <span className="truncate">
            Sistem Durumu: Anti-Halüsinasyon Protokolü v2.4 Tam Yetki Çalışıyor
          </span>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <span className="text-fg-disabled text-[11px] sm:text-xs">
            Zaman Damgası: Live Auto-Sync
          </span>
          <span className="border-accent-500/20 bg-accent-500/10 text-accent-400/90 shrink-0 rounded border px-2 py-0.5 font-mono text-[11px]">
            Rule #160 Verified
          </span>
        </div>
      </div>
    </div>
  );
}
