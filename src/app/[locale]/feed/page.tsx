import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { FeedContainer } from "@/components/feed/feed-container";
import { toIncidentListItems } from "@/lib/mappers";
import { getWatchedProviders } from "@/actions/watches";
import type { IncidentListItem, LeaderboardEntry } from "@/types";
import type { SidebarNewsItem, SidebarPollData } from "@/components/feed/feed-sidebar";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("feed", { defaultValue: "Activity Feed" }) };
}

export default async function FeedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  const isLoggedIn = !!user;
  const watchedProviders = isLoggedIn ? await getWatchedProviders() : [];

  const supabase = await createServerClient();
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const [incidentsResult, providersResult, pollResult, newsResult] = await Promise.all([
    supabase
      .from("incidents")
      .select(
        "id, title_masked, description_masked, title_tr, description_tr, severity, status, category, is_anonymous, incident_date, views_count, upvotes_count, created_at, ai_provider_id, user_id, cross_audit_truth_score, cross_audit_confidence, comments_count, shares_count, affected_users_count",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("ai_providers")
      .select("id, slug, name, description, logo_url, website_url, is_verified, trust_score")
      .order("name"),
    supabase
      .from("ai_polls")
      .select("id, title, yes_count, no_count, unsure_count")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("ecosystem_news")
      .select("id, title_en, title_tr, source, severity, published_at")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  const providerMap = new Map(
    ((providersResult.data as Array<{ id: string; slug: string; name: string }>) ?? []).map((p) => [
      p.id,
      p,
    ]),
  );

  const incidents: IncidentListItem[] = toIncidentListItems(incidentsResult.data).map((item) => {
    const providerId = (incidentsResult.data as Array<Record<string, unknown>> | null)?.find(
      (r) => r["id"] === item.id,
    )?.["ai_provider_id"] as string | null;
    const provider = providerId ? providerMap.get(providerId) : null;
    return {
      ...item,
      provider_name: provider?.name ?? tCommon("unknown"),
      provider_slug: provider?.slug ?? "",
    };
  });

  const incidentCountsByProvider = new Map<string, number>();
  if (providersResult.data) {
    const { data: countData } = await supabase
      .from("incidents")
      .select("ai_provider_id")
      .eq("status", "published")
      .not("ai_provider_id", "is", null);
    if (countData) {
      for (const row of countData as Array<{ ai_provider_id: string }>) {
        incidentCountsByProvider.set(
          row.ai_provider_id,
          (incidentCountsByProvider.get(row.ai_provider_id) ?? 0) + 1,
        );
      }
    }
  }

  const leaderboard: LeaderboardEntry[] = (
    (providersResult.data as Array<Record<string, unknown>>) ?? []
  )
    .filter((p) => p["slug"] !== "alpar-autopilot")
    .map((p) => ({
      provider_id: p["id"] as string,
      provider_name: (p["name"] as string) ?? "",
      provider_slug: (p["slug"] as string) ?? "",
      incident_count: incidentCountsByProvider.get(p["id"] as string) ?? 0,
      resolved_count: 0,
      avg_severity: 0,
      trend: 0,
      trust_score: (p["trust_score"] as number) ?? 70,
    }))
    .sort((a, b) => {
      const scoreA = a.trust_score ?? 70;
      const scoreB = b.trust_score ?? 70;
      if (scoreB !== scoreA) return scoreB - scoreA;
      if (a.incident_count !== b.incident_count) return a.incident_count - b.incident_count;
      return a.provider_name.localeCompare(b.provider_name);
    });

  const activePoll = (pollResult.data?.[0] as SidebarPollData) ?? null;
  const latestNews = (newsResult.data ?? []) as SidebarNewsItem[];

  return (
    <FeedContainer
      initialIncidents={incidents}
      leaderboard={leaderboard}
      news={latestNews}
      poll={activePoll}
      isLoggedIn={isLoggedIn}
      initialWatchedProviders={watchedProviders}
    />
  );
}
