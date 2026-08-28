"use client";

import { useEffect, useState } from "react";
import { DeploymentLimitsWidget } from "./deployment-limits-widget";

// Founder Admin Panel v2 - Agent-OS Premium UI
export default function FounderAdminPanel() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <div className="relative flex flex-col items-center">
          <div className="border-success-500/20 h-16 w-16 animate-spin rounded-full border-4 border-t-emerald-500"></div>
          <p className="mt-4 font-mono text-sm tracking-widest text-emerald-400 uppercase">
            Agent-OS Karargahı Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-fg-primary min-h-screen bg-[#050505] p-3.5 sm:p-6 md:p-8 font-sans selection:bg-emerald-500/30">
      {/* Header Bar */}
      <header className="border-border-subtle bg-bg-secondary mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border p-4 shadow-2xl shadow-emerald-900/10 backdrop-blur-md transition-all hover:border-emerald-500/30">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-lg sm:text-xl font-bold text-transparent truncate">
              ALPAR AI COMMAND CENTER
            </h1>
            <p className="text-fg-muted font-mono text-[11px] sm:text-xs truncate">
              Kurucu İrade: Ercüment Erden • Founder Admin Panel v2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-auto">
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-mono text-xs sm:text-sm text-emerald-400 font-bold">SÜRÜ OTOPİLOT: AKTİF</span>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sürü Yönetim & RAM */}
        <div className="group border-border-subtle bg-bg-secondary rounded-2xl border p-4 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/50 min-w-0">
          <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold text-blue-400">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            <span className="truncate">Sürü Yönetimi (Gazi)</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="border-border-subtle flex items-end justify-between border-b pb-2">
              <span className="text-fg-muted text-xs sm:text-sm">Aktif Ajanlar</span>
              <span className="text-xl sm:text-2xl font-bold text-white transition-colors group-hover:text-blue-400 font-mono">
                4 Sürü
              </span>
            </div>
            <div className="border-border-subtle flex items-end justify-between border-b pb-2">
              <span className="text-fg-muted text-xs sm:text-sm">Auto-Kill Çöp Toplayıcı</span>
              <span className="rounded bg-emerald-400/10 px-2 py-0.5 sm:py-1 font-mono text-xs sm:text-sm text-emerald-400 font-bold">
                Devrede
              </span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-fg-muted text-xs sm:text-sm">RAM Tüketimi</span>
              <span className="text-fg-primary font-mono text-xs sm:text-sm">Stabil (1.2 GB)</span>
            </div>
          </div>
        </div>

        {/* Deploy Agent Limits Monitor */}
        <DeploymentLimitsWidget />

        {/* Ana Zeka (Gemini & Oracle) */}
        <div className="group border-border-subtle bg-bg-secondary rounded-2xl border p-4 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 min-w-0">
          <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold text-purple-400">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              ></path>
            </svg>
            <span className="truncate">Omni-Hafıza & Zeka</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="border-border-subtle flex items-end justify-between border-b pb-2">
              <span className="text-fg-muted text-xs sm:text-sm">Google AI Studio</span>
              <span className="font-mono text-xs sm:text-sm text-emerald-400 truncate">Gemini 1.5 Pro</span>
            </div>
            <div className="border-border-subtle flex items-end justify-between border-b pb-2">
              <span className="text-fg-muted text-xs sm:text-sm">Oracle (NotebookLM)</span>
              <span className="font-mono text-xs sm:text-sm text-purple-400 truncate">Senkronize</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-fg-muted text-xs sm:text-sm">Zeka Rotatörü</span>
              <span className="text-fg-primary font-mono text-xs sm:text-sm truncate">Standby (Groq)</span>
            </div>
          </div>
        </div>

        {/* Stripe Bütçe Kilidi */}
        <div className="group border-border-subtle bg-bg-secondary rounded-2xl border p-4 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/50 min-w-0">
          <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold text-amber-400">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="truncate">Stripe Bütçe Kilidi</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs sm:text-sm">
                <span className="text-fg-muted truncate">Günlük Harcama Limit</span>
                <span className="font-mono text-white shrink-0">Ölçülmedi</span>
              </div>
              <div className="bg-bg-secondary h-1.5 w-full rounded-full">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  style={{ width: "17%" }}
                ></div>
              </div>
            </div>
            <div className="border-border-subtle mt-3 flex items-end justify-between border-b pb-2">
              <span className="text-fg-muted text-xs sm:text-sm">Hard-Stop Devresi</span>
              <span className="font-mono text-xs sm:text-sm text-emerald-400 truncate">Aktif (Zero-Cost)</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-fg-muted text-xs sm:text-sm">Kalan Bütçe</span>
              <span className="font-mono text-xs sm:text-sm text-amber-400">Ölçülmedi</span>
            </div>
          </div>
        </div>

        {/* Siber Güvenlik (Cloudflare & Hunter) */}
        <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-4 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-red-500/50 md:col-span-2 lg:col-span-2 min-w-0">
          <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold text-red-400">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
            <span className="truncate">Hunter Agent & WAF Surları</span>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="border-border-subtle rounded-xl border bg-black/40 p-3.5 sm:p-4 min-w-0">
              <p className="text-fg-muted mb-1 text-xs">Cloudflare WAF</p>
              <p className="text-fg-primary text-lg sm:text-xl font-bold truncate">Kalkanlar Nöbette</p>
              <div className="mt-2.5 flex gap-2 text-xs">
                <span className="rounded border border-green-800/50 bg-green-900/30 px-2 py-0.5 sm:py-1 text-green-400 text-[11px] sm:text-xs">
                  Under Attack: Kapalı
                </span>
              </div>
            </div>
            <div className="border-border-subtle rounded-xl border bg-black/40 p-3.5 sm:p-4 min-w-0">
              <p className="text-fg-muted mb-1 text-xs">Avcı Ajan (OSINT)</p>
              <p className="text-lg sm:text-xl font-bold text-red-400 truncate">HackerOne Devriyesi</p>
              <div className="mt-2.5 flex gap-2 text-xs">
                <span className="rounded border border-red-800/50 bg-red-900/30 px-2 py-0.5 sm:py-1 text-red-400 text-[11px] sm:text-xs">
                  Zero-Day Alarmı Yok
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kurucu İrade CDP */}
        <div className="group border-border-subtle rounded-2xl border bg-gradient-to-br from-gray-900/50 to-gray-900/20 p-4 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/50 min-w-0">
          <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-semibold text-cyan-400">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="truncate">Kurucu CDP Sync</span>
          </h2>
          <div className="flex h-28 sm:h-32 flex-col items-center justify-center gap-2.5 sm:gap-3">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-cyan-700/50 bg-cyan-900/30 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <span className="text-lg sm:text-xl font-bold text-cyan-400">EE</span>
            </div>
            <div className="text-center min-w-0">
              <p className="font-semibold text-white text-sm sm:text-base truncate">Ercüment Erden</p>
              <p className="mt-0.5 text-[11px] sm:text-xs text-cyan-400 truncate">Google Dev Expert • ALPAR Kurucu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

