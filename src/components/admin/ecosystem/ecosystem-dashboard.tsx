"use client";

import { useTranslations } from "next-intl";
import { StatsCards } from "./stats-cards";
import { ApprovalQueue } from "./approval-queue";
import { LiveFeed } from "./live-feed";
import { PositiveDevelopments } from "./positive-developments";
import { ManualFetchButton } from "./manual-fetch-button";
import { LivePulseRing } from "@/components/admin/premium/live-pulse-ring";
import { Info, Bot, Rss, ShieldCheck } from "lucide-react";
import type { Database } from "@/types/database";

type QueueItem = Database["public"]["Tables"]["external_incidents_queue"]["Row"];
type EcosystemNews = Database["public"]["Tables"]["ecosystem_news"]["Row"];

interface DashboardData {
  queue: QueueItem[];
  feed: EcosystemNews[];
  positive: EcosystemNews[];
  stats: {
    total: number;
    incidents: number;
    positive: number;
    queue: number;
    sourceCount: number;
  };
}

export function EcosystemDashboard({ data }: { data: DashboardData }) {
  const t = useTranslations("admin");

  return (
    <div className="animate-fade-in space-y-8">
      {/* Top Banner Header */}
      <div className="border-brand-500/20 to-brand-950/30 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-zinc-950 via-zinc-900 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <LivePulseRing status="healthy" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                  {t("ecosystem_hub_title") || "Ecosystem Intelligence Hub"}
                </h1>
                <span className="border-brand-500/30 bg-brand-500/20 text-brand-300 rounded-full border px-3 py-0.5 text-xs font-extrabold">
                  {t("crawler_active") || "CRAWLER ACTIVE"}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {t("ecosystem_hub_subtitle") ||
                  "Küresel yapay zeka ekosistem haberlerini izleyin, dış kaynaklardan çekilen otomatik olay taslaklarını onaylayın."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ManualFetchButton />
          </div>
        </div>
      </div>

      {/* Review Queue Explanation Glass Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-zinc-950/60 to-transparent p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-start space-x-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/20">
            <Info className="h-4 w-4 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-300 uppercase">
              <span>{t("review_queue_guidance") || "İnceleme Kuyruğu Rehberi"}</span>
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-300">
              {t("review_queue_guidance_desc") ||
                "Kuyruktaki kayıtlar; OECD AI Observatory, AI Incident Database (AIID) ve küresel RSS haber akışlarından ALPAR AI otonom tarayıcıları tarafından otomatik çekilen potansiyel olay taslaklarıdır."}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Bot className="text-brand-400 h-3.5 w-3.5" />
                {t("oecd_aiid_active") || "OECD AI & AIID Integration Active"}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Rss className="h-3.5 w-3.5 text-sky-400" />
                {t("global_rss_feeds") || "Global RSS News Feeds"}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                {t("human_moderator_gatekeeping") || "Human Moderator Gatekeeping"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <StatsCards stats={data.stats} />

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <ApprovalQueue items={data.queue} />
          <LiveFeed items={data.feed} />
        </div>
        <div className="lg:col-span-2">
          <PositiveDevelopments items={data.positive} />
        </div>
      </div>
    </div>
  );
}
