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

const LiveStats = dynamicImport(() =>
  import("@/components/marketing/live-stats").then((mod) => mod.LiveStats),
);

const WhyItMatters = dynamicImport(() =>
  import("@/components/marketing/why-it-matters").then((mod) => mod.WhyItMatters),
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
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: ["/og-image.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "x-default": "/en",
        en: "/en",
        tr: "/tr",
      },
    },
  };
}

const getHomeData = cache(async (locale: string) => {
  const supabase = await createServerClient();
  const admin = createAdminClient();
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
          "id, slug, name, logo_url, website_url, is_verified, trust_score, incident_count, response_count, is_verified_respondent",
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

  const countsBySource = {
    user_submitted: 0,
    aiaaic_import: 0,
    aiid_import: 0,
    news_curated: 0,
    court_record: 0,
  };
  ((sourcesResult.data as Array<{ incident_source: string | null }>) ?? []).forEach((row) => {
    const src = row.incident_source || "user_submitted";
    if (src in countsBySource) {
      countsBySource[src as keyof typeof countsBySource]++;
    }
  });

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
    .filter((p) => p["slug"] !== "alpar-autopilot")
    .map((p) => {
      const total = (p["incident_count"] as number) ?? 0;
      const responded = (p["response_count"] as number) ?? 0;
      const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
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
      const scoreA = a.trust_score ?? 70;
      const scoreB = b.trust_score ?? 70;
      if (scoreB !== scoreA) return scoreB - scoreA;
      if (a.incident_count !== b.incident_count) return a.incident_count - b.incident_count;
      return a.provider_name.localeCompare(b.provider_name);
    });

  const topProvidersForHero = [...leaderboard].slice(0, 5).map((p) => ({
    name: p.provider_name,
    count: p.incident_count,
    slug: p.provider_slug,
  }));

  const uniqueCountriesCount = new Set(
    ((countriesResult.data as Array<{ location_country: string | null }>) ?? [])
      .map((c) => c.location_country)
      .filter(Boolean),
  ).size;

  return {
    incidentsCountResult,
    providersResult,
    uniqueCountriesCount,
    topProvidersForHero,
    countsBySource,
    incidents,
    leaderboard,
  };
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
      <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-none" />}>
        <HeroSectionAsync locale={locale} />
      </Suspense>

      <TrustBar />

      <SegmentRouting />

      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
          </div>
        }
      >
        <LiveStatsAsync locale={locale} />
      </Suspense>

      <WhyItMatters />

      <HowItWorks />

      <Section className="reveal-on-scroll scroll-mt-16">
        <Container>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <Skeleton className="h-[800px] w-full rounded-2xl" />
                <Skeleton className="h-[800px] w-full rounded-2xl" />
              </div>
            }
          >
            <LiveFeedAndLeaderboardAsync locale={locale} />
          </Suspense>
        </Container>
      </Section>

      <GetInvolved />

      <ClosingSection />
    </>
  );
}
