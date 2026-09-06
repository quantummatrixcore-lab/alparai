export const dynamic = "force-dynamic";

import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IncidentList } from "@/components/incidents/incident-list";
import { LeaderboardPreview } from "@/components/marketing/leaderboard-preview";
import { CitationPanel, type JournalistCitation } from "@/components/dashboard/citation-panel";
import { Link } from "@/i18n/routing";
import { toIncidentListItems, type TranslationMap } from "@/lib/mappers";
import { SEVERITY_LEVELS } from "@/lib/constants";
import type { IncidentListItem, LeaderboardEntry } from "@/types";
import type { Database } from "@/types/database";
import {
  ShieldCheck,
  Trophy,
  Download,
  Mail,
  FileText,
  Filter,
  Quote,
  Info,
  ArrowRight,
} from "lucide-react";

const FEED_LIMIT = 20;
const INCIDENT_SELECT =
  "id, title_masked, description_masked, title_tr, description_tr, severity, status, category, is_anonymous, incident_date, views_count, upvotes_count, created_at, ai_provider_id, user_id, cross_audit_truth_score, cross_audit_confidence, incident_source, is_expert, published_at";

interface CitationLabels {
  source: string;
  id: string;
  title: string;
  provider: string;
  date: string;
  status: string;
  url: string;
  retrieved: string;
}

function buildCitationText(
  labels: CitationLabels,
  data: {
    id: string;
    title: string;
    provider: string;
    incidentDate: string;
    statusLabel: string;
    url: string;
    retrievedDate: string;
  },
): string {
  return [
    labels.source,
    `${labels.id}: ${data.id}`,
    `${labels.title}: "${data.title}"`,
    `${labels.provider}: ${data.provider}`,
    `${labels.date}: ${data.incidentDate}`,
    `${labels.status}: ${data.statusLabel}`,
    `${labels.url}: ${data.url}`,
    `${labels.retrieved}: ${data.retrievedDate}`,
  ].join("\n");
}

async function fetchTranslationMap(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  incidentIds: string[],
  locale: string,
): Promise<TranslationMap | undefined> {
  if (incidentIds.length === 0) return undefined;
  const client = supabase as unknown as {
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
  const { data: rows } = await client
    .from("incident_translations")
    .select("incident_id, title, description, machine_translated")
    .in("incident_id", incidentIds)
    .eq("locale", locale);
  if (!rows) return undefined;
  return new Map(
    rows.map((row) => [
      row.incident_id,
      {
        title: row.title,
        description: row.description,
        machine_translated: row.machine_translated,
      },
    ]),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return {
    title: `${t("journalist_title")} | ALPAR AI`,
    description: t("journalist_desc"),
  };
}

export default async function JournalistDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ provider?: string; severity?: string; cite?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { provider, severity, cite } = await searchParams;

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tIncident = await getTranslations({ locale, namespace: "incident" });
  const tStatus = await getTranslations({ locale, namespace: "badge.status" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tCases = await getTranslations({ locale, namespace: "cases" });

  const supabase = await createServerClient();
  const admin = createAdminClient();

  const providersResult = await supabase
    .from("ai_providers")
    .select("id, slug, name")
    .order("name");
  const providers = (
    (providersResult.data as Array<{ id: string; slug: string; name: string }>) ?? []
  ).filter((p) => p.slug !== "alpar-autopilot");
  const providerBySlug = new Map(providers.map((p) => [p.slug, p]));
  const providerById = new Map(providers.map((p) => [p.id, p]));
  const selectedProvider = provider ? providerBySlug.get(provider) : undefined;
  const validSeverity = SEVERITY_LEVELS.some((s) => s.value === severity) ? severity : undefined;

  let incidentsQuery = admin
    .from("incidents")
    .select(INCIDENT_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(FEED_LIMIT);
  if (selectedProvider) {
    incidentsQuery = incidentsQuery.eq("ai_provider_id", selectedProvider.id);
  }
  if (validSeverity) {
    incidentsQuery = incidentsQuery.eq(
      "severity",
      validSeverity as Database["public"]["Enums"]["incident_severity"],
    );
  }

  const [incidentsResult, leaderboardResult] = await Promise.all([
    incidentsQuery,
    supabase
      .from("provider_leaderboard")
      .select(
        "id, slug, name, logo_url, is_verified, website_url, trust_score, incident_count, response_count, is_verified_respondent, response_rate",
      )
      .order("name"),
  ]);

  const rawIncidents = (incidentsResult.data as Array<Record<string, unknown>>) ?? [];
  const localeNeedsTranslationTable = locale === "de" || locale === "fr" || locale === "ru";
  const translationMap = localeNeedsTranslationTable
    ? await fetchTranslationMap(
        supabase,
        rawIncidents.map((r) => r["id"] as string),
        locale,
      )
    : undefined;

  const items: IncidentListItem[] = toIncidentListItems(rawIncidents, translationMap, locale).map(
    (item) => {
      const providerId = rawIncidents.find((r) => r["id"] === item.id)?.["ai_provider_id"] as
        string | null;
      const matchedProvider = providerId ? providerById.get(providerId) : undefined;
      return {
        ...item,
        provider_name: matchedProvider?.name ?? tCommon("unknown"),
        provider_slug: matchedProvider?.slug ?? "",
      };
    },
  );

  const totalCount = incidentsResult.count ?? 0;

  const leaderboard: LeaderboardEntry[] = (
    (leaderboardResult.data as unknown as Array<Record<string, unknown>>) ?? []
  )
    .filter((p) => p["slug"] !== "alpar-autopilot")
    .map((p) => {
      const total = (p["incident_count"] as number) ?? 0;
      const responded = (p["response_count"] as number) ?? 0;
      const responseRate =
        (p["response_rate"] as number | undefined) ??
        (total > 0 ? Math.round((responded / total) * 100) : 0);
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
    .sort((a, b) => (b.trust_score ?? 70) - (a.trust_score ?? 70));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
  const citeId = cite ?? items[0]?.id;
  const citeItem = citeId ? items.find((i) => i.id === citeId) : undefined;

  let citation: JournalistCitation | null = null;
  if (citeItem) {
    const title =
      locale === "tr" ? citeItem.title_tr || citeItem.title_masked : citeItem.title_masked;
    const statusLabel = tStatus(citeItem.status);
    const url = `${appUrl}/${locale}/incidents/${citeItem.id}`;
    const retrievedDate = new Date().toISOString().slice(0, 10);
    const citationText = buildCitationText(
      {
        source: t("journalist_citation_source_label"),
        id: t("journalist_citation_field_id"),
        title: t("journalist_citation_field_title"),
        provider: t("journalist_citation_field_provider"),
        date: t("journalist_citation_field_date"),
        status: t("journalist_citation_field_status"),
        url: t("journalist_citation_field_url"),
        retrieved: t("journalist_citation_field_retrieved"),
      },
      {
        id: citeItem.id,
        title,
        provider: citeItem.provider_name,
        incidentDate: citeItem.incident_date.slice(0, 10),
        statusLabel,
        url,
        retrievedDate,
      },
    );
    citation = {
      id: citeItem.id,
      title,
      provider: citeItem.provider_name,
      incidentDate: citeItem.incident_date.slice(0, 10),
      statusLabel,
      url,
      retrievedDate,
      citationText,
    };
  }

  return (
    <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-6 pb-20 md:pt-10">
      <div className="bg-accent-soft/10 pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="border-border-primary/40 mb-10 border-b pb-8">
          <h1 className="from-fg-primary to-fg-secondary mb-2 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
            {t("journalist_title")}
          </h1>
          <p className="text-fg-secondary text-sm">{t("journalist_desc")}</p>
        </div>

        <div className="space-y-10">
          <Card className="border-brand-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="text-brand-400 h-5 w-5" aria-hidden="true" />
                {t("journalist_verification_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <div>
                <h3 className="text-fg-primary mb-1 text-xs font-bold tracking-wider uppercase">
                  {t("journalist_verification_means_title")}
                </h3>
                <p className="text-fg-secondary leading-relaxed">
                  {t("journalist_verification_means_body")}
                </p>
              </div>
              <div>
                <h3 className="text-fg-primary mb-1 text-xs font-bold tracking-wider uppercase">
                  {t("journalist_verification_not_title")}
                </h3>
                <p className="text-fg-secondary leading-relaxed">
                  {t("journalist_verification_not_body")}
                </p>
              </div>
              <div className="border-border-subtle border-t pt-4">
                <h3 className="text-fg-primary mb-1 text-xs font-bold tracking-wider uppercase">
                  {t("journalist_verification_embargo_title")}
                </h3>
                <p className="text-fg-secondary leading-relaxed">
                  {t("journalist_verification_embargo_body")}
                </p>
                <Link
                  href={citeItem ? `/incidents/${citeItem.id}` : "/incidents"}
                  className="text-brand-400 mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                >
                  {t("journalist_verification_correction_link")}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-fg-primary inline-flex items-center gap-2 text-xl font-semibold">
                <ShieldCheck className="text-success-400 h-5 w-5" aria-hidden="true" />
                {t("journalist_feed_title")}
              </h2>
              <Link href="/incidents" className="text-brand-400 text-sm hover:underline">
                {t("journalist_view_all_incidents")}
              </Link>
            </div>
            <p className="text-fg-muted mb-4 text-sm">{t("journalist_feed_desc")}</p>

            <Card className="mb-6">
              <CardContent className="p-4">
                <form
                  method="GET"
                  action="/dashboard/journalist"
                  className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <Select
                    name="provider"
                    label={t("journalist_filter_provider")}
                    defaultValue={selectedProvider?.slug ?? ""}
                    options={[
                      { value: "", label: t("journalist_filter_all_providers") },
                      ...providers.map((p) => ({ value: p.slug, label: p.name })),
                    ]}
                  />
                  <Select
                    name="severity"
                    label={t("journalist_filter_severity")}
                    defaultValue={validSeverity ?? ""}
                    options={[
                      { value: "", label: t("journalist_filter_all_severities") },
                      ...SEVERITY_LEVELS.map((s) => ({
                        value: s.value,
                        label: tIncident(`severity_${s.value}`),
                      })),
                    ]}
                  />
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      leftIcon={<Filter className="h-4 w-4" />}
                      className="w-full sm:w-auto"
                    >
                      {t("journalist_apply_filters")}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <p className="text-fg-muted mb-3 text-xs">
              {t("journalist_showing_count", { count: items.length, total: totalCount })}
            </p>
            <IncidentList incidents={items} />
          </section>

          <section id="citation">
            <div className="mb-4">
              <h2 className="text-fg-primary inline-flex items-center gap-2 text-xl font-semibold">
                <Quote className="text-brand-400 h-5 w-5" aria-hidden="true" />
                {t("journalist_citation_title")}
              </h2>
            </div>
            {items.length > 0 && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <form
                    method="GET"
                    action="/dashboard/journalist#citation"
                    className="grid gap-3 sm:grid-cols-[1fr_auto]"
                  >
                    {provider && <input type="hidden" name="provider" value={provider} />}
                    {severity && <input type="hidden" name="severity" value={severity} />}
                    <Select
                      name="cite"
                      label={t("journalist_cite_select_label")}
                      defaultValue={citeItem?.id ?? ""}
                      options={items.map((i) => ({
                        value: i.id,
                        label: `${(locale === "tr" ? i.title_tr || i.title_masked : i.title_masked).slice(0, 60)} — ${i.provider_name}`,
                      }))}
                    />
                    <div className="flex items-end">
                      <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                        {t("journalist_cite_load")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            <CitationPanel citation={citation} />
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-fg-primary inline-flex items-center gap-2 text-xl font-semibold">
                <Trophy className="text-warning-500 h-5 w-5" aria-hidden="true" />
                {t("journalist_provider_snapshot_title")}
              </h2>
            </div>
            <p className="text-fg-muted mb-4 text-sm">{t("journalist_provider_snapshot_desc")}</p>
            <LeaderboardPreview entries={leaderboard} />
          </section>

          <section>
            <h2 className="text-fg-primary mb-4 inline-flex items-center gap-2 text-xl font-semibold">
              <FileText className="text-brand-400 h-5 w-5" aria-hidden="true" />
              {t("journalist_press_resources_title")}
            </h2>
            <p className="text-fg-muted mb-4 text-sm">{t("journalist_press_resources_desc")}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="hover:border-brand-500/30 transition-colors">
                <CardContent className="flex flex-col gap-3 p-5">
                  <Download className="text-brand-400 h-5 w-5" aria-hidden="true" />
                  <div>
                    <p className="text-fg-primary text-sm font-semibold">
                      {t("journalist_press_kit_link")}
                    </p>
                    <p className="text-fg-muted mt-1 text-xs">
                      {t("journalist_press_resources_desc")}
                    </p>
                  </div>
                  <Link
                    href="/press-kit"
                    className="text-brand-400 mt-auto inline-flex items-center gap-1 text-xs font-bold hover:underline"
                  >
                    {t("journalist_press_kit_link")}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:border-brand-500/30 transition-colors">
                <CardContent className="flex flex-col gap-3 p-5">
                  <Mail className="text-brand-400 h-5 w-5" aria-hidden="true" />
                  <div>
                    <p className="text-fg-primary text-sm font-semibold">
                      {t("journalist_media_contact_title")}
                    </p>
                    <p className="text-fg-muted mt-1 text-xs">
                      {t("journalist_media_contact_desc")}
                    </p>
                  </div>
                  <a
                    href="mailto:press@alparai.com"
                    className="text-brand-400 mt-auto inline-flex items-center gap-1 text-xs font-bold hover:underline"
                  >
                    press@alparai.com
                  </a>
                </CardContent>
              </Card>

              <Card className="hover:border-brand-500/30 transition-colors">
                <CardContent className="flex flex-col gap-3 p-5">
                  <FileText className="text-brand-400 h-5 w-5" aria-hidden="true" />
                  <div>
                    <p className="text-fg-primary text-sm font-semibold">
                      {t("journalist_case_study_title")}
                    </p>
                    <p className="text-fg-muted mt-1 text-xs">{t("journalist_case_study_desc")}</p>
                  </div>
                  <Link
                    href="/cases/001-grok-passport"
                    className="text-brand-400 mt-auto inline-flex items-center gap-1 text-xs font-bold hover:underline"
                  >
                    {tCases("case_001_title")}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
