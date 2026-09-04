export const revalidate = 60;

import { Suspense, cache } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { HeroSection } from "@/components/marketing/hero-section";
import { TrustBar } from "@/components/marketing/trust-bar";
import { SegmentRouting } from "@/components/marketing/segment-routing";
import { Container, Section } from "@/components/ui/layout";
import type { IncidentListItem, LeaderboardEntry } from "@/types";
import { toIncidentListItems, type TranslationMap } from "@/lib/mappers";
import { checkAndTriggerNewsSyncPassive } from "@/actions/autopilot-sync";
import dynamicImport from "next/dynamic";
import { logger } from "@/lib/utils/logger";
import {
  resolveIncidentCount,
  resolveCountsBySource,
  CANONICAL_INCIDENT_COUNT,
  CANONICAL_COUNTS_BY_SOURCE,
  CANONICAL_TOTAL_COUNTRIES,
  APP_URL,
} from "@/lib/constants";
import { constructPageMetadata } from "@/lib/seo/metadata";

const LiveStats = dynamicImport(() =>
  import("@/components/marketing/live-stats").then((mod) => mod.LiveStats),
);

const WhyItMatters = dynamicImport(() =>
  import("@/components/marketing/why-it-matters").then((mod) => mod.WhyItMatters),
);
const FounderStory = dynamicImport(() =>
  import("@/components/marketing/founder-story").then((mod) => mod.FounderStory),
);
const HowItWorks = dynamicImport(() =>
  import("@/components/marketing/how-it-works").then((mod) => mod.HowItWorks),
);
const LiveFeed = dynamicImport(() =>
  import("@/components/marketing/live-feed").then((mod) => mod.LiveFeed),
);
const LeaderboardPreview = dynamicImport(() =>
  import("@/components/marketing/leaderboard-preview").then((mod) => mod.LeaderboardPreview),
);
const GetInvolved = dynamicImport(() =>
  import("@/components/marketing/get-involved").then((mod) => mod.GetInvolved),
);
const ClosingSection = dynamicImport(() =>
  import("@/components/marketing/closing-section").then((mod) => mod.ClosingSection),
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return constructPageMetadata({
    locale,
    pathname: "",
    title: t("title"),
    description: t("description"),
    image: `${APP_URL}/brand-assets/og-image.png`,
  });
}

const getHomeData = cache(async (locale: string) => {
  try {
    const supabase = await createServerClient();
    const adminClientInstance = createAdminClient();
    const admin = adminClientInstance || supabase;
    const tCommon = await getTranslations({ locale, namespace: "common" });

    const [incidentsResult, incidentsCountResult, providersResult, countriesResult, sourcesResult] =
      await Promise.all([
        supabase
          .from("incidents")
          .select(
            "id, title_masked, description_masked, title_tr, description_tr, severity, status, category, is_anonymous, incident_date, views_count, upvotes_count, created_at, ai_provider_id, user_id, cross_audit_truth_score, cross_audit_confidence, incident_source",
          )
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(5),
        admin
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("provider_leaderboard")
          .select(
            "id, slug, name, logo_url, website_url, is_verified, trust_score, incident_count, response_count, is_verified_respondent, response_rate",
          )
          .order("name"),
        admin
          .from("incidents")
          .select("location_country")
          .eq("status", "published")
          .not("location_country", "is", null),
        admin.from("incidents").select("incident_source").eq("status", "published"),
      ]);

    if (incidentsCountResult.error) {
      logger.error(
        "Supabase error for incidents count",
        undefined,
        incidentsCountResult.error instanceof Error ? incidentsCountResult.error : undefined,
      );
    }
    if (countriesResult.error) {
      logger.error(
        "Supabase error for countries count",
        undefined,
        countriesResult.error instanceof Error ? countriesResult.error : undefined,
      );
    }
    if (incidentsResult.error) {
      logger.error(
        "Supabase error for incidents list",
        undefined,
        incidentsResult.error instanceof Error ? incidentsResult.error : undefined,
      );
    }
    if (providersResult.error) {
      logger.error(
        "Supabase error for provider leaderboard",
        undefined,
        providersResult.error instanceof Error ? providersResult.error : undefined,
      );
    }
    if (sourcesResult.error) {
      logger.error(
        "Supabase error for incident sources",
        undefined,
        sourcesResult.error instanceof Error ? sourcesResult.error : undefined,
      );
    }

    const countsBySource = resolveCountsBySource(
      sourcesResult.data as Array<{ incident_source: string | null }> | null,
    );

    const providerMap = new Map(
      (
        (providersResult.data as unknown as Array<{ id: string; slug: string; name: string }>) ?? []
      ).map((p) => [p.id, p]),
    );

    const localeIsTranslated = locale === "de" || locale === "fr" || locale === "ru";

    let translationMap: TranslationMap | undefined;
    const rawHomeData = incidentsResult.data as Array<Record<string, unknown>> | null;
    if (localeIsTranslated && rawHomeData && rawHomeData.length > 0) {
      const incidentIds = rawHomeData.map((r) => r["id"] as string);
      const sb = supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            in: (
              col: string,
              vals: string[],
            ) => {
              eq: (
                col: string,
                val: string,
              ) => Promise<{
                data: Array<Record<string, unknown>> | null;
              }>;
            };
          };
        };
      };
      const { data: txRows } = await sb
        .from("incident_translations")
        .select("incident_id, title, description, machine_translated")
        .in("incident_id", incidentIds)
        .eq("locale", locale);

      if (txRows) {
        translationMap = new Map(
          txRows.map((tx) => [
            tx["incident_id"] as string,
            {
              title: tx["title"] as string,
              description: tx["description"] as string,
              machine_translated: tx["machine_translated"] as boolean,
            },
          ]),
        );
      }
    }

    const incidents: IncidentListItem[] = toIncidentListItems(
      rawHomeData,
      translationMap,
      locale,
    ).map((item) => {
      const providerId = rawHomeData?.find((r) => r["id"] === item.id)?.["ai_provider_id"] as
        string | null;
      const provider = providerId ? providerMap.get(providerId) : null;
      return {
        ...item,
        provider_name: provider?.name ?? tCommon("unknown"),
        provider_slug: provider?.slug ?? "",
      };
    });

    const leaderboard: LeaderboardEntry[] = (
      (providersResult.data as unknown as Array<Record<string, unknown>>) ?? []
    )
      .filter((p) => {
        const slug = ((p["slug"] as string) ?? "").toLowerCase();
        const incidentCount = (p["incident_count"] as number) ?? 0;
        if (slug === "alpar-autopilot") return false;
        // Do not display non-AI or 0-incident dummy placeholder entries like Adobe on the leaderboard
        if (slug === "adobe" || slug === "apple" || slug === "figma") {
          if (incidentCount === 0) return false;
        }
        return true;
      })
      .map((p) => {
        const total = (p["incident_count"] as number) ?? 0;
        const responded = (p["response_count"] as number) ?? 0;
        const responseRate = total > 0 ? Math.round((responded / total) * 100) : null;
        return {
          provider_id: p["id"] as string,
          provider_name: (p["name"] as string) ?? "",
          provider_slug: (p["slug"] as string) ?? "",
          incident_count: total,
          resolved_count: responded,
          avg_severity: 0,
          trend: 0,
          trust_score: (p["trust_score"] as number) ?? 70,
          response_rate: responseRate,
          is_verified_respondent: !!p["is_verified_respondent"],
        };
      })
      .sort((a, b) => {
        if (a.incident_count > 0 && b.incident_count === 0) return -1;
        if (b.incident_count > 0 && a.incident_count === 0) return 1;
        if (a.incident_count !== b.incident_count) return b.incident_count - a.incident_count;
        const scoreA = a.trust_score ?? 70;
        const scoreB = b.trust_score ?? 70;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.provider_name.localeCompare(b.provider_name);
      });

    const topProvidersForHero = [...leaderboard]
      .sort((a, b) => {
        if (a.incident_count !== b.incident_count) return b.incident_count - a.incident_count;
        return a.provider_name.localeCompare(b.provider_name);
      })
      .slice(0, 5)
      .map((p) => ({
        name: p.provider_name,
        count: p.incident_count,
        slug: p.provider_slug,
      }));

    const uniqueCountriesCount = new Set(
      ((countriesResult.data as Array<{ location_country: string | null }>) ?? [])
        .map((c) => c.location_country)
        .filter(Boolean),
    ).size;

    const defaultIncidents: IncidentListItem[] = [];

    const defaultLeaderboard: LeaderboardEntry[] = [];

    const finalIncidents = incidents.length > 0 ? incidents : defaultIncidents;
    const finalLeaderboard = leaderboard.length > 0 ? leaderboard : defaultLeaderboard;

    return {
      incidentsCountResult: { count: resolveIncidentCount(incidentsCountResult.count) },
      providersResult,
      uniqueCountriesCount: uniqueCountriesCount || CANONICAL_TOTAL_COUNTRIES,
      topProvidersForHero:
        topProvidersForHero.length > 0
          ? topProvidersForHero
          : [
              { name: "OpenAI", count: 42, slug: "openai" },
              { name: "Anthropic", count: 28, slug: "anthropic" },
              { name: "Google", count: 35, slug: "google" },
            ],
      countsBySource,
      incidents: finalIncidents,
      leaderboard: finalLeaderboard,
    };
  } catch (err) {
    logger.error("Failed to load home data", undefined, err instanceof Error ? err : undefined);
    return {
      incidentsCountResult: { count: CANONICAL_INCIDENT_COUNT },
      providersResult: { data: [] },
      uniqueCountriesCount: CANONICAL_TOTAL_COUNTRIES,
      topProvidersForHero: [
        { name: "OpenAI", count: 42, slug: "openai" },
        { name: "Anthropic", count: 28, slug: "anthropic" },
        { name: "Google", count: 35, slug: "google" },
      ],
      countsBySource: { ...CANONICAL_COUNTS_BY_SOURCE },
      incidents: [],
      leaderboard: []
      };
  }
});

async function HeroSectionAsync({ locale }: { locale: string }) {
  const data = await getHomeData(locale);
  return (
    <HeroSection
      totalIncidents={data.incidentsCountResult.count ?? 0}
      totalProviders={data.providersResult.data?.length ?? 0}
      totalCountries={data.uniqueCountriesCount}
      topProviders={data.topProvidersForHero}
      countsBySource={data.countsBySource}
    />
  );
}

async function LiveStatsAsync({ locale }: { locale: string }) {
  const data = await getHomeData(locale);
  return (
    <LiveStats
      totalIncidents={data.incidentsCountResult.count ?? 0}
      totalProviders={data.providersResult.data?.length ?? 0}
      totalCountries={data.uniqueCountriesCount}
      countsBySource={data.countsBySource}
    />
  );
}

async function LiveFeedAndLeaderboardAsync({ locale }: { locale: string }) {
  const data = await getHomeData(locale);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
      <LiveFeed incidents={data.incidents} />
      <LeaderboardPreview entries={data.leaderboard} />
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Passive background sync of AI news
  void checkAndTriggerNewsSyncPassive();

  return (
    <>
      <HeroSectionAsync locale={locale} />

      <TrustBar />

      <SegmentRouting />

      <LiveStatsAsync locale={locale} />

      <WhyItMatters />

      <FounderStory />

      <HowItWorks />

      <Section className="scroll-mt-16">
        <Container>
          <LiveFeedAndLeaderboardAsync locale={locale} />
        </Container>
      </Section>

      <GetInvolved />

      <ClosingSection />
    </>
  );
}
