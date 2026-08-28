"use client";

import React, { useState } from "react";
import {
  Crown,
  Activity,
  Wallet,
  Shield,
  Layers,
  Command,
} from "lucide-react";
import { FinancialOperations } from "./FinancialOperations";
import { CoreSystemHealth } from "./CoreSystemHealth";
import { CouncilOfSages } from "./CouncilOfSages";
import { SecurityMatrix } from "./SecurityMatrix";
import { AIEcosystemRadar } from "./AIEcosystemRadar";
import { VisitorAnalytics } from "./VisitorAnalytics";
import { SEOAnalytics } from "./SEOAnalytics";

export function BentoCommandCenter() {
  const [activeTab, setActiveTab] = useState<"ALL" | "SAGES" | "HEALTH" | "FINANCE" | "SECURITY">("ALL");

  return (
    <div className="relative min-h-screen w-full bg-[#09090b] p-3 sm:p-6 md:p-8 text-slate-100 font-sans selection:bg-[#00f0ff]/30 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-[#00f0ff]/10 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/2 -right-40 h-96 w-96 rounded-full bg-[#8a2be2]/10 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[#10b981]/10 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Top Header Banner */}
        <header className="flex flex-col gap-4 rounded-2xl border border-[#27272a] bg-[#121216]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/20 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-[#00f0ff]/40 bg-gradient-to-br from-[#00f0ff]/20 to-[#8a2be2]/20 text-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Command className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="bg-gradient-to-r from-white via-[#00f0ff] to-[#dcb8ff] bg-clip-text text-lg font-extrabold tracking-tight text-transparent sm:text-2xl truncate">
                  ALPAR AI COMMAND CENTER
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[11px] font-bold font-mono text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)] shrink-0">
                  <Crown className="h-3 w-3 text-red-400" />
                  ATATÜRK #1 TOP
                </span>
              </div>
              <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                Bento Grid • Cyber-SaaS Command • Dijital İkizler & Otonom Sürü Karargahı
              </p>
            </div>
          </div>

          {/* Quick Navigation Filter Tabs (Mobile Scrollable + Desktop Wrap) */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[#27272a] bg-[#18181b]/80 p-1.5 backdrop-blur-md overflow-x-auto no-scrollbar max-w-full sm:flex-wrap">
            {[
              { id: "ALL", label: "Tüm Bento", icon: Layers },
              { id: "SAGES", label: "Bilgeler Meclisi", icon: Crown },
              { id: "HEALTH", label: "Sistem Sağlığı", icon: Activity },
              { id: "FINANCE", label: "Finans & MRR", icon: Wallet },
              { id: "SECURITY", label: "Güvenlik", icon: Shield },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all ${
                    isCurrent
                      ? "border border-[#00f0ff]/40 bg-[#00f0ff]/15 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Bento Grid Content Container */}
        <main className="space-y-4 sm:space-y-6">
          {(activeTab === "ALL" || activeTab === "SAGES") && (
            <div className="w-full">
              <CouncilOfSages />
            </div>
          )}

          {activeTab === "ALL" && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="w-full"><AIEcosystemRadar /></div>
              <div className="w-full"><VisitorAnalytics /></div>
              <div className="w-full"><SEOAnalytics /></div>
            </div>
          )}

          {(activeTab === "ALL" || activeTab === "HEALTH") && (
            <div className="w-full">
              <CoreSystemHealth />
            </div>
          )}

          {(activeTab === "ALL" || activeTab === "FINANCE") && (
            <div className="w-full">
              <FinancialOperations />
            </div>
          )}

          {(activeTab === "ALL" || activeTab === "SECURITY") && (
            <div className="w-full">
              <SecurityMatrix />
            </div>
          )}
        </main>

        {/* Bottom Command Center Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[#27272a] bg-[#121216]/60 p-3.5 sm:p-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">Alparai Autonomous Swarm Engine • Veri Güvenliği & Şeffaflık</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
            <span className="hidden sm:inline">Stitch Project #3906261826915017353</span>
            <span className="text-[#00f0ff]">React 19 • Tailwind CSS 4 • Bento Dark</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default BentoCommandCenter;
