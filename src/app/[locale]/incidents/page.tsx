export const revalidate = 300;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Container } from "@/components/ui/layout";
import { IncidentList } from "@/components/incidents/incident-list";
import { IncidentFilters } from "@/components/marketing/incident-filters";
import { Pagination } from "@/components/ui/pagination";
import {
  SidebarEngagement,
  type SidebarNewsItem,
  type SidebarPollData,
} from "@/components/dilemmas/sidebar-engagement";
import { CollectionPageJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";
import type { IncidentListItem } from "@/types";
import { toIncidentListItems, type TranslationMap } from "@/lib/mappers";
import type { Database } from "@/types/database";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("incidents") };
}

export default async function IncidentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    severity?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "incident" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const { q, category, severity, sort, page } = await searchParams;
  const supabase = await createServerClient();
  const admin = createAdminClient();

  const pageNum = Math.max(1, parseInt(page || "1", 10));
  const sortVal = sort || "newest";
  const pageSize = 12;

  let query = admin
    .from("incidents")
    .select(
      "id, title_masked, description_masked, title_tr, description_tr, severity, status, category, is_anonymous, incident_date, views_count, upvotes_count, created_at, ai_provider_id, user_id, cross_audit_truth_score, cross_audit_confidence, incident_source",
      { count: "exact" },
    )
    .eq("status", "published");

  if (category)
    query = query.eq("category", category as Database["public"]["Enums"]["incident_category"]);
  if (severity)
    query = query.eq("severity", severity as Database["public"]["Enums"]["incident_severity"]);

  if (q) {
    const sanitized = q
      .trim()
      .replace(/[^\w\s-]/g, "")
      .slice(0, 100);
    if (sanitized.length >= 2) {
      query = query.or(`title_masked.ilike.%${sanitized}%,description_masked.ilike.%${sanitized}%`);
    }
  }

  // Apply sorting
  if (sortVal === "votes") {
    query = query.order("upvotes_count", { ascending: false });
  } else if (sortVal === "views") {
    query = query.order("views_count", { ascending: false });
  } else if (sortVal === "truth_score") {
    query = query.order("cross_audit_truth_score", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  // Apply pagination
  const fromOffset = (pageNum - 1) * pageSize;
  const toOffset = pageNum * pageSize - 1;
  query = query.range(fromOffset, toOffset);

  const localeIsDEorFR = locale === "de" || locale === "fr";

  const [incidentsResult, providersResult, pollResult, newsResult] = await Promise.all([
    query,
    supabase.from("ai_providers").select("id, slug, name"),
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
      .limit(4)
      .returns<SidebarNewsItem[]>(),
  ]);

  const providerMap = new Map(
    ((providersResult.data as Array<{ id: string; slug: string; name: string }>) ?? []).map((p) => [
      p.id,
      p,
    ]),
  );

  const rawData = incidentsResult.data as Array<Record<string, unknown>> | null;

  let translationMap: TranslationMap | undefined;
  if (localeIsDEorFR && rawData && rawData.length > 0) {
    const incidentIds = rawData.map((r) => r["id"] as string);
    const admin = supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          in: (
            col: string,
            vals: string[],
          ) => {
            eq: (
              col: string,
              val: string,
            ) => Promise<{
              data: Array<{
                incident_id: string;
                title: string;
                description: string;
                machine_translated: boolean;
              }> | null;
            }>;
          };
        };
      };
    };
    const { data: txRows } = await admin
      .from("incident_translations")
      .select("incident_id, title, description, machine_translated")
      .in("incident_id", incidentIds)
      .eq("locale", locale);

    if (txRows) {
      translationMap = new Map(
        (
          txRows as unknown as Array<{
            incident_id: string;
            title: string;
            description: string;
            machine_translated: boolean;
          }>
        ).map((tx) => [
          tx.incident_id,
          {
            title: tx.title,
            description: tx.description,
            machine_translated: tx.machine_translated,
          },
        ]),
      );
    }
  }

  const items: IncidentListItem[] = toIncidentListItems(rawData, translationMap, locale).map(
    (item) => {
      const providerId = rawData?.find((r) => r["id"] === item.id)?.["ai_provider_id"] as
        string | null;
      const provider = providerId ? providerMap.get(providerId) : null;
      return {
        ...item,
        provider_name: provider?.name ?? tCommon("unknown"),
        provider_slug: provider?.slug ?? "",
      };
    },
  );

  const totalCount = incidentsResult.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const topPoll = (pollResult.data?.[0] ?? null) as SidebarPollData | null;
  const sidebarNews = (newsResult.data ?? []) as SidebarNewsItem[];

  return (
    <Container className="pt-4 pb-12 md:pt-6 md:pb-16">
      <CollectionPageJsonLd
        name={t("page_title")}
        description={t("page_subtitle", { count: totalCount })}
        url={`${APP_URL}/${locale}/incidents`}
        items={items.map((item) => ({
          name: item.title_masked,
          url: `${APP_URL}/${locale}/incidents/${item.id}`,
          description: item.description_masked,
        }))}
      />
      <header className="border-border-subtle/50 bg-bg-deep relative mb-8 overflow-hidden rounded-2xl border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_30%,transparent_100%)] bg-[size:40px_40px]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="border-danger-500/30 bg-danger-500/10 text-danger-400 mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="bg-danger-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-danger-500 relative inline-flex h-2 w-2 rounded-full shadow-[0_0_8px_rgba(230,57,70,1)]"></span>
            </span>
            Bağımsız Denetim Mercii
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-2xl sm:text-5xl">
            {t("page_title")}
          </h1>
          <p className="text-fg-muted mt-4 max-w-2xl text-base font-medium">
            {t("page_subtitle", { count: totalCount })}
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_300px]">
        <aside>
          <IncidentFilters
            defaultCategory={category}
            defaultSeverity={severity}
            defaultQ={q}
            defaultSort={sortVal}
          />
        </aside>
        <section className="flex flex-col">
          <div className="flex-1">
            <IncidentList incidents={items} />
          </div>
          <Pagination
            currentPage={pageNum}
            totalPages={totalPages}
            category={category}
            severity={severity}
            q={q}
            sort={sortVal}
          />
        </section>
        <SidebarEngagement poll={topPoll} news={sidebarNews} />
      </div>
    </Container>
  );
}
