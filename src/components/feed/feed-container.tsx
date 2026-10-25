"use client";

import * as React from "react";
import { Container } from "@/components/ui/layout";
import { FeedTabs, type FeedTabType } from "./feed-tabs";
import { FeedCard } from "./feed-card";
import { FeedSidebar, type SidebarNewsItem, type SidebarPollData } from "./feed-sidebar";
import type { IncidentListItem, LeaderboardEntry } from "@/types";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dehost } from "@/lib/dehost/client";
import { watchProvider, unwatchProvider } from "@/actions/watches";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

interface FeedContainerProps {
  initialIncidents: IncidentListItem[];
  leaderboard: LeaderboardEntry[];
  news: SidebarNewsItem[];
  poll: SidebarPollData | null;
  isLoggedIn: boolean;
  initialWatchedProviders?: string[];
}

const SEVERITY_WEIGHTS: Record<string, number> = {
  low: 1.0,
  medium: 1.5,
  high: 2.0,
  critical: 3.0,
};

export function FeedContainer({
  initialIncidents,
  leaderboard,
  news,
  poll,
  isLoggedIn,
  initialWatchedProviders = [],
}: FeedContainerProps) {
  const [activeTab, setActiveTab] = React.useState<FeedTabType>("for-you");
  const [incidents, setIncidents] = React.useState<IncidentListItem[]>(initialIncidents);
  const [watchedProviders, setWatchedProviders] = React.useState<string[]>(initialWatchedProviders);
  const [newIncidents, setNewIncidents] = React.useState<IncidentListItem[]>([]);

  const providerMap = React.useMemo(() => {
    return new Map(leaderboard.map((p) => [p.provider_id, p]));
  }, [leaderboard]);

  // DeHost Realtime updates
  React.useEffect(() => {
    const channel = dehost
      .channel("feed-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "incidents",
          filter: "status=eq.published",
        },
        (payload: { new: Record<string, unknown> & { id: string } }) => {
          const newRow = payload.new as Record<string, unknown>;
          const providerId = (newRow.ai_provider_id as string | undefined) ?? null;
          const provider = providerId ? providerMap.get(providerId) : null;
          const newIncident: IncidentListItem = {
            id: payload.new.id,
            title_masked: (newRow.title_masked as string | undefined) ?? "",
            description_masked: (newRow.description_masked as string | undefined) ?? "",
            title_tr: (newRow.title_tr as string | null | undefined) ?? null,
            description_tr: (newRow.description_tr as string | null | undefined) ?? null,
            translated_title: null,
            translated_description: null,
            machine_translated: (newRow.machine_translated as boolean | undefined) ?? false,
            severity: (newRow.severity as IncidentListItem["severity"] | undefined) ?? "medium",
            status: (newRow.status as IncidentListItem["status"] | undefined) ?? "published",
            category: (newRow.category as IncidentListItem["category"] | undefined) ?? "other",
            is_anonymous: (newRow.is_anonymous as boolean | undefined) ?? false,
            incident_date: (newRow.incident_date as string | undefined) ?? new Date().toISOString(),
            view_count: (newRow.views_count as number | undefined) ?? 0,
            vote_count: (newRow.upvotes_count as number | undefined) ?? 0,
            created_at: (newRow.created_at as string | undefined) ?? new Date().toISOString(),
            provider_name: provider?.provider_name ?? "Unknown",
            provider_slug: provider?.provider_slug ?? "",
            evidence_count: (newRow.comments_count as number | undefined) ?? 0,
            affected_count: (newRow.affected_users_count as number | undefined) ?? 0,
            cross_audit_truth_score: (newRow.cross_audit_truth_score as number | null | undefined) ?? null,
            cross_audit_confidence: (newRow.cross_audit_confidence as number | null | undefined) ?? null,
            shares_count: (newRow.shares_count as number | undefined) ?? 0,
            author_name: null,
          };
          setNewIncidents((prev) => [newIncident, ...prev]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "incidents",
        },
        (payload: { new: Record<string, unknown> & { id: string } }) => {
          const updatedRow = payload.new as Record<string, unknown>;
          setIncidents((prev) =>
            prev.map((item) => {
              if (item.id === payload.new.id) {
                return {
                  ...item,
                  view_count: (updatedRow.views_count as number | undefined) ?? item.view_count,
                  vote_count: (updatedRow.upvotes_count as number | undefined) ?? item.vote_count,
                  evidence_count: (updatedRow.comments_count as number | undefined) ?? item.evidence_count,
                  affected_count: (updatedRow.affected_users_count as number | undefined) ?? item.affected_count,
                  cross_audit_truth_score:
                    (payload.new.cross_audit_truth_score as number | null | undefined) ?? item.cross_audit_truth_score,
                  cross_audit_confidence:
                    (payload.new.cross_audit_confidence as number | null | undefined) ?? item.cross_audit_confidence,
                };
              }
              return item;
            }),
          );
        },
      )
      .subscribe();

    return () => {
      dehost.removeChannel(channel);
    };
  }, [providerMap]);

  const handleRefresh = () => {
    setIncidents((prev) => [...newIncidents, ...prev]);
    setNewIncidents([]);
  };

  const handleToggleWatch = async (providerId: string) => {
    if (!isLoggedIn) {
      toast.error(
        locale === "tr" ? "Takip etmek için giriş yapmalısınız" : "Sign in to follow providers",
      );
      return;
    }
    const isWatched = watchedProviders.includes(providerId);
    try {
      if (isWatched) {
        await unwatchProvider(providerId);
        setWatchedProviders((prev) => prev.filter((id) => id !== providerId));
        toast.success(locale === "tr" ? "Takip bırakıldı" : "Unfollowed successfully");
      } else {
        await watchProvider(providerId);
        setWatchedProviders((prev) => [...prev, providerId]);
        toast.success(locale === "tr" ? "Takip ediliyor" : "Following successfully");
      }
    } catch (err) {
      logger.error(
        "Failed to toggle watch status",
        undefined,
        err instanceof Error ? err : undefined,
      );
      toast.error(locale === "tr" ? "İşlem başarısız oldu" : "Action failed");
    }
  };

  // Calculate engagement & recency score client-side for "For You"
  const scoredIncidents = React.useMemo(() => {
    const now = new Date().getTime();

    return incidents.map((incident) => {
      const upvotes = incident.vote_count ?? 0;
      const comments = incident.evidence_count ?? 0;
      const affected = incident.affected_count ?? 0;
      const views = incident.view_count ?? 0;

      const engagementScore = upvotes * 3 + comments * 2 + affected * 4 + views / 50;

      const publishedTime = new Date(incident.created_at || incident.incident_date).getTime();
      const hoursSince = Math.max(0, (now - publishedTime) / (1000 * 60 * 60));
      const recencyWeight = 1.0 / (hoursSince + 1.0);

      const severityWeight = SEVERITY_WEIGHTS[incident.severity] || 1.0;

      const forYouScore = engagementScore * recencyWeight * severityWeight;

      return {
        ...incident,
        forYouScore,
        engagementScore,
        hoursSince,
      };
    });
  }, [incidents]);

  const filteredIncidents = React.useMemo(() => {
    const sorted = [...scoredIncidents];

    if (activeTab === "for-you") {
      return sorted.sort((a, b) => b.forYouScore - a.forYouScore);
    }

    if (activeTab === "latest") {
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at || b.incident_date).getTime() -
          new Date(a.created_at || a.incident_date).getTime(),
      );
    }

    if (activeTab === "trending") {
      const sevenDaysAgo = 7 * 24;
      let trending = sorted.filter((i) => i.hoursSince <= sevenDaysAgo);
      if (trending.length === 0) {
        trending = sorted;
      }
      return trending.sort((a, b) => b.engagementScore - a.engagementScore);
    }

    if (activeTab === "following") {
      // Find incidents matching watched provider IDs
      return sorted.filter((i) => {
        const providerId = (initialIncidents as { id: string; ai_provider_id?: string }[]).find(
          (orig) => orig.id === i.id,
        )?.ai_provider_id;
        return providerId && watchedProviders.includes(providerId);
      });
    }

    return sorted;
  }, [scoredIncidents, activeTab, watchedProviders, initialIncidents]);

  return (
    <Container className="pt-4 pb-12 md:pt-6 md:pb-16">
      <header className="mb-8">
        <h1 className="text-fg-primary text-3xl font-extrabold tracking-tight sm:text-4xl">
          {activeTab === "for-you" && (locale === "tr" ? "Sizin İçin Akış" : "For You Feed")}
          {activeTab === "latest" && (locale === "tr" ? "Son Olaylar" : "Latest Incidents")}
          {activeTab === "trending" && (locale === "tr" ? "Trend Olaylar" : "Trending Incidents")}
          {activeTab === "following" && (locale === "tr" ? "Takip Ettikleriniz" : "Following")}
        </h1>
        <p className="text-fg-muted mt-2 text-sm">
          {locale === "tr"
            ? "Yapay zeka sistemlerindeki bağımsız kamu denetim raporlarının canlı sosyal akışı."
            : "Real-time activity feed of independent AI system audit reports."}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main Feed Content */}
        <div>
          <FeedTabs activeTab={activeTab} onChange={setActiveTab} isLoggedIn={isLoggedIn} />

          <div className="min-h-[400px]">
            <AnimatePresence>
              {newIncidents.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onClick={handleRefresh}
                  className="bg-brand-500 hover:bg-brand-600 text-bg-primary mb-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold shadow-lg transition-colors"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {locale === "tr"
                      ? `${newIncidents.length} yeni olay raporu yayınlandı — yenilemek için tıklayın`
                      : `${newIncidents.length} new AI incident reports published — tap to refresh`}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => {
                  const providerId = (
                    initialIncidents as { id: string; ai_provider_id?: string }[]
                  ).find((i) => i.id === incident.id)?.ai_provider_id;
                  return (
                    <FeedCard
                      key={incident.id}
                      incident={incident}
                      isLoggedIn={isLoggedIn}
                      isWatched={providerId ? watchedProviders.includes(providerId) : false}
                      onToggleWatch={providerId ? () => handleToggleWatch(providerId) : undefined}
                    />
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-bg-secondary/10 border-border-subtle/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-20"
                >
                  <AlertCircle className="text-fg-disabled mb-4 h-10 w-10" />
                  <p className="text-fg-secondary text-sm font-semibold">
                    {locale === "tr" ? "Henüz içerik bulunmuyor" : "No incidents found"}
                  </p>
                  <p className="text-fg-muted mt-1 max-w-xs text-center text-xs">
                    {locale === "tr"
                      ? "Seçilen kategori veya filtrede doğrulanmış rapor bulunmamaktadır."
                      : "There are no verified reports matching this tab currently."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <FeedSidebar leaderboard={leaderboard} news={news} poll={poll} />
      </div>
    </Container>
  );
}

const locale = typeof window !== "undefined" ? document.documentElement.lang || "en" : "en";
