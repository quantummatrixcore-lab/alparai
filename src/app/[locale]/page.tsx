export const revalidate = 60;

import { Suspense, cache } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/dehost/server";
import { createAdminClient } from "@/lib/dehost/admin";
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
  resolveProviderCount,
  resolveCountsBySource,
  CANONICAL_INCIDENT_COUNT,
  CANONICAL_COUNTS_BY_SOURCE,
  CANONICAL_TOTAL_PROVIDERS,
  CANONICAL_TOTAL_COUNTRIES,
  CANONICAL_FALLBACK_PROVIDERS,
  CANONICAL_FALLBACK_INCIDENTS,
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
    const dehost = await createServerClient();
    const adminClientInstance = createAdminClient();
    const admin = adminClientInstance || dehost;
    const tCommon = await getTranslations({ locale, namespace: "common" });

    const [incidentsResult, incidentsCountResult, providersResult] =
      await Promise.all([
        dehost
          .from("incidents")
          .select(
            "id, title_masked, description_masked, title_tr, description_tr, severity, status, category, is_anonymous, incident_date, views_count, upvotes_count, created_at, ai_provider_id, user_id, cross_audit_truth_score, cross_audit_confidence, incident_source",
          )
          .eq("status", "published")
          .not("title_masked", "ilike", "[TEST]%")
          .not("title_masked", "ilike", "e2e-test%")
          .not("title_masked", "ilike", "%cypress%")
          .not("title_masked", "ilike", "%playwright%")
          .order("published_at", { ascending: false })
          .limit(10),
        admin
          .from("incidents")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        dehost
          .from("provider_leaderboard")
          .select(
            "id, slug, name, logo_url, website_url, is_verified, trust_score, incident_count, response_count, is_verified_respondent, response_rate",
          )
          .order("name"),
      ]);

    if (incidentsCountResult.error) {
      logger.error(
        "DeHost error for incidents count",
        undefined,
        incidentsCountResult.error instanceof Error ? incidentsCountResult.error : undefined,
      );
    }
    if (incidentsResult.error) {
      logger.error(
        "DeHost error for incidents list",
        undefined,
        incidentsResult.error instanceof Error ? incidentsResult.error : undefined,
      );
    }
    if (providersResult.error) {
      logger.error(
        "DeHost error for provider leaderboard",
        undefined,
        providersResult.error instanceof Error ? providersResult.error : undefined,
      );
    }

    const totalIncidentCount = resolveIncidentCount(incidentsCountResult.count);
    const countsBySource = resolveCountsBySource(null, totalIncidentCount);

    const providerMap = new Map(
      (
        (providersResult.data as unknown as Array<{ id: string; slug: string; name: string }>) ?? []
      ).map((p) => [p.id, p]),
    );

    const localeIsTranslated = false;

    let translationMap: TranslationMap | undefined;
    const rawHomeData = incidentsResult.data as Array<Record<string, unknown>> | null;
    if (localeIsTranslated && rawHomeData && rawHomeData.length > 0) {
      const incidentIds = rawHomeData.map((r) => r["id"] as string);
      const sb = dehost as unknown as {
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

    const seenIncidentTitles = new Set<string>();
    const allMappedIncidents = toIncidentListItems(
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

    const incidents: IncidentListItem[] = allMappedIncidents
      .filter((item) => {
        const titleKey = (item.title_masked || item.title_tr || "").toLowerCase().trim();
        if (!titleKey || seenIncidentTitles.has(titleKey)) return false;
        seenIncidentTitles.add(titleKey);
        return true;
      })
      .slice(0, 5);

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
        // Canonical Transparency TrustScore: 85 baseline - (2.5 * incidents) + (4 * responses)
        const computedScore = Math.max(0, Math.min(100, Math.round(85 - (total * 2.5) + (responded * 4))));
        return {
          provider_id: p["id"] as string,
          provider_name: (p["name"] as string) ?? "",
          provider_slug: (p["slug"] as string) ?? "",
          incident_count: total,
          resolved_count: responded,
          avg_severity: 0,
          trend: 0,
          trust_score: computedScore,
          response_rate: responseRate,
          is_verified_respondent: !!p["is_verified_respondent"],
        };
      })
      .sort((a, b) => {
        const scoreA = a.trust_score ?? 70;
        const scoreB = b.trust_score ?? 70;
        if (scoreB !== scoreA) return scoreB - scoreA;
        if (b.incident_count !== a.incident_count) return b.incident_count - a.incident_count;
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

    const uniqueCountriesCount = CANONICAL_TOTAL_COUNTRIES;

    const defaultIncidents: IncidentListItem[] = CANONICAL_FALLBACK_INCIDENTS.map((inc) => ({
      id: inc.id,
      title_masked: inc.title_masked,
      description_masked: inc.description_masked,
      title_tr: inc.title_tr,
      description_tr: inc.description_tr,
      translated_title: null,
      translated_description: null,
      machine_translated: false,
      severity: inc.severity,
      status: inc.status,
      category: inc.category as IncidentListItem["category"],
      is_anonymous: inc.is_anonymous,
      incident_date: inc.incident_date,
      created_at: inc.created_at,
      view_count: inc.views_count,
      vote_count: inc.upvotes_count,
      evidence_count: 1,
      shares_count: 0,
      author_name: null,
      provider_name: inc.provider_name,
      provider_slug: inc.provider_slug,
      cross_audit_truth_score: inc.cross_audit_truth_score,
      cross_audit_confidence: inc.cross_audit_confidence,
      incident_source: inc.incident_source,
    }));

    const defaultLeaderboard: LeaderboardEntry[] = CANONICAL_FALLBACK_PROVIDERS.map((p) => ({
      provider_id: p.id,
      provider_name: p.name,
      provider_slug: p.slug,
      incident_count: p.incident_count,
      resolved_count: p.response_count,
      avg_severity: 0,
      trend: 0,
      trust_score: p.trust_score,
      response_rate: p.response_rate,
      is_verified_respondent: p.is_verified_respondent,
    }));

    const finalIncidents = incidents.length > 0 ? incidents : defaultIncidents;
    const finalLeaderboard = leaderboard.length > 0 ? leaderboard : defaultLeaderboard;

    return {
      incidentsCountResult: { count: resolveIncidentCount(incidentsCountResult.count) },
      providersResult,
      providersCount: leaderboard.length > 0 ? leaderboard.length : CANONICAL_FALLBACK_PROVIDERS.length,
      uniqueCountriesCount: uniqueCountriesCount || CANONICAL_TOTAL_COUNTRIES,
      topProvidersForHero:
        topProvidersForHero.length > 0
          ? topProvidersForHero
          : defaultLeaderboard.slice(0, 5).map((p) => ({
              name: p.provider_name,
              count: p.incident_count,
              slug: p.provider_slug,
            })),
      countsBySource,
      incidents: finalIncidents,
      leaderboard: finalLeaderboard,
    };
  } catch (err) {
    logger.error("Failed to load home data", undefined, err instanceof Error ? err : undefined);
    const fallbackLeaderboard: LeaderboardEntry[] = CANONICAL_FALLBACK_PROVIDERS.map((p) => ({
      provider_id: p.id,
      provider_name: p.name,
      provider_slug: p.slug,
      incident_count: p.incident_count,
      resolved_count: p.response_count,
      avg_severity: 0,
      trend: 0,
      trust_score: p.trust_score,
      response_rate: p.response_rate,
      is_verified_respondent: p.is_verified_respondent,
    }));
    const fallbackIncidents: IncidentListItem[] = CANONICAL_FALLBACK_INCIDENTS.map((inc) => ({
      id: inc.id,
      title_masked: inc.title_masked,
      description_masked: inc.description_masked,
      title_tr: inc.title_tr,
      description_tr: inc.description_tr,
      translated_title: null,
      translated_description: null,
      machine_translated: false,
      severity: inc.severity,
      status: inc.status,
      category: inc.category as IncidentListItem["category"],
      is_anonymous: inc.is_anonymous,
      incident_date: inc.incident_date,
      created_at: inc.created_at,
      view_count: inc.views_count,
      vote_count: inc.upvotes_count,
      evidence_count: 1,
      shares_count: 0,
      author_name: null,
      provider_name: inc.provider_name,
      provider_slug: inc.provider_slug,
      cross_audit_truth_score: inc.cross_audit_truth_score,
      cross_audit_confidence: inc.cross_audit_confidence,
      incident_source: inc.incident_source,
    }));
    return {
      incidentsCountResult: { count: CANONICAL_INCIDENT_COUNT },
      providersResult: { data: [] },
      uniqueCountriesCount: CANONICAL_TOTAL_COUNTRIES,
      topProvidersForHero: fallbackLeaderboard.slice(0, 5).map((p) => ({
        name: p.provider_name,
        count: p.incident_count,
        slug: p.provider_slug,
      })),
      countsBySource: { ...CANONICAL_COUNTS_BY_SOURCE },
      incidents: fallbackIncidents,
      leaderboard: fallbackLeaderboard,
    };
  }
});

async function HeroSectionAsync({ locale }: { locale: string }) {
  const data = await getHomeData(locale);
  return (
    <HeroSection
      totalIncidents={data.incidentsCountResult.count ?? CANONICAL_INCIDENT_COUNT}
      totalProviders={CANONICAL_TOTAL_PROVIDERS}
      totalCountries={CANONICAL_TOTAL_COUNTRIES}
      topProviders={data.topProvidersForHero}
      countsBySource={data.countsBySource}
    />
  );
}

async function LiveStatsAsync({ locale }: { locale: string }) {
  const data = await getHomeData(locale);
  return (
    <LiveStats
      totalIncidents={data.incidentsCountResult.count ?? CANONICAL_INCIDENT_COUNT}
      totalProviders={CANONICAL_TOTAL_PROVIDERS}
      totalCountries={CANONICAL_TOTAL_COUNTRIES}
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
  import("next/server").then(({ after }) => {
    after(() => {
      void checkAndTriggerNewsSyncPassive();
    });
  }).catch(() => {
    // Fallback if after is not available
    void checkAndTriggerNewsSyncPassive();
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "AlparAi",
            applicationCategory: "BusinessApplication",
            description: "Monitor 2,880+ AI incidents, achieve EU AI Act compliance with automated auditing",
            operatingSystem: "Web",
          }),
        }}
      />
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
export const runtime = 'edge';
