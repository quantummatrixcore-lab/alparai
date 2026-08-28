"use client";

import { Activity, Server, Database, Cloud } from "lucide-react";

export function DeploymentLimitsWidget() {
  return (
    <div className="group border-border-subtle bg-bg-secondary rounded-2xl border p-4 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-success-500/50 min-w-0">
      <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold text-success-400">
        <Server className="h-5 w-5 text-success-500 shrink-0" />
        <span className="truncate">Platform Kapasite Sınırları</span>
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {/* Vercel Limits */}
        <div className="border-border-subtle border-b pb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-fg-primary flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <Cloud className="h-4 w-4 shrink-0" /> Vercel (Pro)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border-border-subtle rounded border bg-black/40 p-2 min-w-0">
              <span className="text-fg-muted mb-0.5 block text-[10px] sm:text-xs">Max RAM</span>
              <span className="font-mono text-success-400 font-bold truncate block">8192 MB</span>
            </div>
            <div className="border-border-subtle rounded border bg-black/40 p-2 min-w-0">
              <span className="text-fg-muted mb-0.5 block text-[10px] sm:text-xs">Timeout</span>
              <span className="font-mono text-success-400 font-bold truncate block">Ölçülmedi</span>
            </div>
          </div>
        </div>

        {/* Supabase Limits */}
        <div className="border-border-subtle border-b pb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-fg-primary flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <Database className="h-4 w-4 shrink-0" /> Supabase
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border-border-subtle rounded border bg-black/40 p-2 min-w-0">
              <span className="text-fg-muted mb-0.5 block text-[10px] sm:text-xs">Bağlantı (Pool)</span>
              <span className="font-mono text-brand-400 font-bold truncate block">API (Serverless)</span>
            </div>
            <div className="border-border-subtle rounded border bg-black/40 p-2 min-w-0">
              <span className="text-fg-muted mb-0.5 block text-[10px] sm:text-xs">Veritabanı</span>
              <span className="font-mono text-brand-400 font-bold truncate block">8GB Limit</span>
            </div>
          </div>
        </div>

        {/* GitHub Limits */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-fg-primary flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <Activity className="h-4 w-4 shrink-0" /> GitHub Actions
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border-border-subtle rounded border bg-black/40 p-2 min-w-0">
              <span className="text-fg-muted mb-0.5 block text-[10px] sm:text-xs">Runner RAM</span>
              <span className="font-mono text-accent-400 font-bold truncate block">7 GB</span>
            </div>
            <div className="border-border-subtle rounded border bg-black/40 p-2 min-w-0">
              <span className="text-fg-muted mb-0.5 block text-[10px] sm:text-xs">CPU Cores</span>
              <span className="font-mono text-accent-400 font-bold truncate block">2 Çekirdek</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
