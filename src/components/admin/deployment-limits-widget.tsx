"use client";

import { Activity, Server, Database, Cloud } from "lucide-react";

export function DeploymentLimitsWidget() {
  return (
    <div className="group border-border-subtle bg-bg-secondary rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-emerald-400">
        <Server className="h-5 w-5 text-emerald-500" />
        Platform Kapasite Sınırları
      </h2>

      <div className="space-y-4">
        {/* Vercel Limits */}
        <div className="border-border-subtle border-b pb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-fg-primary flex items-center gap-2 text-sm font-semibold">
              <Cloud className="h-4 w-4" /> Vercel (Pro)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border-border-subtle rounded border bg-black/40 p-2">
              <span className="text-fg-muted mb-1 block">Max RAM</span>
              <span className="font-mono text-emerald-400">8192 MB</span>
            </div>
            <div className="border-border-subtle rounded border bg-black/40 p-2">
              <span className="text-fg-muted mb-1 block">Timeout</span>
              <span className="font-mono text-emerald-400">Ölçülmedi</span>
            </div>
          </div>
        </div>

        {/* Supabase Limits */}
        <div className="border-border-subtle border-b pb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-fg-primary flex items-center gap-2 text-sm font-semibold">
              <Database className="h-4 w-4" /> Supabase
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border-border-subtle rounded border bg-black/40 p-2">
              <span className="text-fg-muted mb-1 block">Bağlantı (Pool)</span>
              <span className="font-mono text-blue-400">API (Serverless)</span>
            </div>
            <div className="border-border-subtle rounded border bg-black/40 p-2">
              <span className="text-fg-muted mb-1 block">Veritabanı Boyutu</span>
              <span className="font-mono text-blue-400">8GB Limit</span>
            </div>
          </div>
        </div>

        {/* GitHub Limits */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-fg-primary flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4" /> GitHub Actions
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border-border-subtle rounded border bg-black/40 p-2">
              <span className="text-fg-muted mb-1 block">Runner RAM</span>
              <span className="font-mono text-purple-400">7 GB</span>
            </div>
            <div className="border-border-subtle rounded border bg-black/40 p-2">
              <span className="text-fg-muted mb-1 block">CPU Cores</span>
              <span className="font-mono text-purple-400">2 Çekirdek</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
