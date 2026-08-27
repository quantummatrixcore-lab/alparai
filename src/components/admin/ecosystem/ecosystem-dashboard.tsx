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
                <h1 className="sm:text-fg-secondaryxl text-xl font-black tracking-tight text-white">
                  {t("ecosystem_hub_title") || "Ecosystem Intelligence Hub"}
                </h1>
                <span className="border-brand-500/30 bg-brand-500/20 text-brand-300 rounded-full border px-3 py-0.5 text-xs font-extrabold">
                  {t("crawler_active") || "CRAWLER ACTIVE"}
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-xs">
                {t("ecosystem_hub_subtitle") ||
                  "Monitor AI ecosystem news, review external incident submissions, and track positive developments."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ManualFetchButton />
          </div>
        </div>
      </div>

      {/* Review Queue Explanation Glass Banner */}
      <div className="border-warning-500/20 from-warning-500/10 rounded-2xl border bg-gradient-to-r via-zinc-950/60 to-transparent p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-start space-x-3">
          <div className="border-warning-500/30 bg-warning-500/20 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border">
            <Info className="text-warning-400 h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-warning-300 flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <span>{t("review_queue_guidance") || "Review Queue Guidance"}</span>
            </h4>
            <p className="text-fg-secondary mt-1 text-xs leading-relaxed">
              {t("review_queue_guidance_desc") ||
                "Entries in the queue are potential incident drafts automatically fetched by ALPAR AI autonomous crawlers from OECD AI Observatory, AI Incident Database (AIID), and global RSS feeds."}
            </p>
            <div className="text-fg-muted mt-3 flex flex-wrap gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium">
                <Bot className="text-brand-400 h-3.5 w-3.5" />
                {t("oecd_aiid_active") || "OECD AI & AIID Integration Active"}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Rss className="h-3.5 w-3.5 text-sky-400" />
                {t("global_rss_feeds") || "Global RSS News Feeds"}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="text-success-400 h-3.5 w-3.5" />
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
