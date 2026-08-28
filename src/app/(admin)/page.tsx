"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { BentoGrid, BentoGridItem } from "@/components/admin/bento-grid";
import { Wallet, Bot, ShieldAlert, Coins, Activity, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const t = useTranslations("Admin");

  return (
    <div className="w-full space-y-8">
      <header className="mb-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          {t("dashboard_title") || "Command Center"}
        </h1>
        <p className="text-zinc-400 mt-2">
          {t("dashboard_subtitle") || "Real-time AI Trust Infrastructure Monitor"}
        </p>
      </header>

      <BentoGrid className="max-w-6xl">
        <BentoGridItem
          title={t("finance_overview") || "Finance & Operations"}
          description={t("finance_desc") || "Real-time liquidity, tokens, and capital flow."}
          icon={<Wallet className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
          className="md:col-span-2"
          neonColor="emerald"
          header={<div className="h-32 w-full rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 flex items-center justify-center"><TrendingUp className="text-emerald-500/50 w-24 h-24" /></div>}
        />
        <BentoGridItem
          title={t("autopilot") || "Autopilot Systems"}
          description={t("autopilot_desc") || "AI Agents coordination and swarm metrics."}
          icon={<Bot className="h-8 w-8 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
          className="md:col-span-1"
          neonColor="purple"
          header={<div className="h-32 w-full rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 flex items-center justify-center"><Activity className="text-purple-500/50 w-24 h-24" /></div>}
        />
        <BentoGridItem
          title={t("security_threats") || "Security & Threats"}
          description={t("security_desc") || "Incident reports, vulnerabilities, and trust limits."}
          icon={<ShieldAlert className="h-8 w-8 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />}
          className="md:col-span-1"
          neonColor="rose"
          header={<div className="h-32 w-full rounded-xl bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20" />}
        />
        <BentoGridItem
          title={t("grant_programs") || "Grant & Bounties"}
          description={t("grant_desc") || "Community funding and open-source bounties."}
          icon={<Coins className="h-8 w-8 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />}
          className="md:col-span-2"
          neonColor="amber"
          header={<div className="h-32 w-full rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20" />}
        />
      </BentoGrid>
    </div>
  );
}
