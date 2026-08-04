export const revalidate = 1800; // 30 minutes ISR cache

import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import {
  FileText,
  Shield,
  AlertTriangle,
  Info,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { IncidentListItem } from "@/types";
import { toIncidentListItems } from "@/lib/mappers";
import { IncidentList } from "@/components/incidents/incident-list";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ai-act" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function AIActTrackerPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    risk?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "ai-act" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const { risk, page } = await searchParams;

  const pageNum = Math.max(1, parseInt(page || "1", 10));
  const pageSize = 10;
  const supabase = await createServerClient();

  // Query counts for different categories
  const [
    { count: unacceptableCount },
    { count: highRiskCount },
    { count: transparencyCount },
    { count: minimalCount },
  ] = await Promise.all([
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("eu_act_risk_category", "Unacceptable Risk"),
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("eu_act_risk_category", "High Risk"),
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("eu_act_risk_category", "Specific Transparency"),
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("eu_act_risk_category", "Minimal"),
  ]);

  // Main incident list query
  let query = supabase
    .from("incidents")
    .select(
      "id, title_masked, description_masked, title_tr, description_tr, severity, status, category, is_anonymous, incident_date, views_count, upvotes_count, created_at, ai_provider_id, user_id, cross_audit_truth_score, cross_audit_confidence, eu_act_risk_category, eu_act_serious_incident_class, eu_act_high_risk_system_category, eu_act_reporting_deadline_days",
      { count: "exact" },
    )
    .eq("status", "published")
    .not("eu_act_risk_category", "is", null);

  if (risk) {
    query = query.eq("eu_act_risk_category", risk);
  }

  // Range/Pagination
  const fromOffset = (pageNum - 1) * pageSize;
  const toOffset = pageNum * pageSize - 1;
  query = query.order("created_at", { ascending: false }).range(fromOffset, toOffset);

  const [incidentsResult, providersResult] = await Promise.all([
    query,
    supabase.from("ai_providers").select("id, name, slug"),
  ]);

  const rawIncidents = incidentsResult.data ?? [];
  const totalCount = incidentsResult.count ?? 0;
  const providers = providersResult.data ?? [];

  // Map providers names and slugs using the provider Map pattern
  const providerMap = new Map(providers.map((p) => [p.id, p]));

  const mappedIncidents: IncidentListItem[] = toIncidentListItems(rawIncidents).map((item) => {
    const rawRow = rawIncidents.find((r: Record<string, unknown>) => r.id === item.id) as
      Record<string, unknown> | undefined;
    const providerId = rawRow?.ai_provider_id as string | null;
    const provider = providerId ? providerMap.get(providerId) : null;
    return {
      ...item,
      provider_name: provider?.name ?? tCommon("unknown"),
      provider_slug: provider?.slug ?? "",
    };
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const riskFilters = [
    {
      label: "Unacceptable Risk",
      value: "Unacceptable Risk",
      count: unacceptableCount ?? 0,
      color: "text-red-400 bg-red-950/20 border-red-800/40",
    },
    {
      label: "High Risk",
      value: "High Risk",
      count: highRiskCount ?? 0,
      color: "text-amber-400 bg-amber-950/20 border-amber-800/40",
    },
    {
      label: "Specific Transparency",
      value: "Specific Transparency",
      count: transparencyCount ?? 0,
      color: "text-blue-400 bg-blue-950/20 border-blue-800/40",
    },
    {
      label: "Minimal Risk",
      value: "Minimal",
      count: minimalCount ?? 0,
      color: "text-emerald-400 bg-emerald-950/20 border-emerald-800/40",
    },
  ];

  const getPageHref = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (risk) params.set("risk", risk);
    if (pageNumber > 1) params.set("page", String(pageNumber));
    const qs = params.toString();
    return qs ? `/ai-act?${qs}` : "/ai-act";
  };

  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* Header */}
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              EU AI Act Tracker
            </div>
            <h1 className="text-fg-primary text-4xl font-extrabold tracking-tight">{t("title")}</h1>
            <p className="text-fg-muted text-lg">{t("subtitle")}</p>
          </header>

          {/* Quick Stats Grid / Category Filter */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {riskFilters.map((filter) => {
              const isActive = risk === filter.value;
              return (
                <Link
                  key={filter.value}
                  href={isActive ? "/ai-act" : `/ai-act?risk=${filter.value}`}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition duration-200 hover:scale-[1.02] ${
                    isActive
                      ? "border-emerald-500 bg-emerald-950/15"
                      : "border-border bg-bg-secondary/40"
                  }`}
                >
                  <span className="text-fg-muted text-xs font-semibold">{filter.label}</span>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-fg-primary text-3xl font-black">{filter.count}</span>
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${filter.color}`}
                    >
                      {filter.count > 0 ? "Active" : "None"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Incident List */}
          <div className="space-y-4">
            {mappedIncidents.length > 0 ? (
              <>
                <IncidentList incidents={mappedIncidents} />

                {/* Localized Pagination */}
                {totalPages > 1 && (
                  <nav
                    className="border-border-subtle mt-8 flex items-center justify-between border-t px-4 py-4 sm:px-0"
                    aria-label="Pagination"
                  >
                    <div className="-mt-px flex w-0 flex-1">
                      {pageNum > 1 ? (
                        <Link
                          href={getPageHref(pageNum - 1)}
                          className="text-fg-muted hover:border-border-strong hover:text-fg-primary inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium transition-colors"
                        >
                          <ChevronLeft className="text-fg-muted mr-2 h-4 w-4" aria-hidden="true" />
                          {tCommon("previous")}
                        </Link>
                      ) : (
                        <span className="text-fg-disabled inline-flex cursor-not-allowed items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium">
                          <ChevronLeft
                            className="text-fg-disabled mr-2 h-4 w-4"
                            aria-hidden="true"
                          />
                          {tCommon("previous")}
                        </span>
                      )}
                    </div>
                    <div className="hidden md:-mt-px md:flex">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const p = idx + 1;
                        const isCurrent = p === pageNum;
                        return (
                          <Link
                            key={`page-${p}`}
                            href={getPageHref(p)}
                            className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium transition-colors ${
                              isCurrent
                                ? "border-emerald-500 text-emerald-400"
                                : "text-fg-muted hover:border-border-strong border-transparent"
                            }`}
                          >
                            {p}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="-mt-px flex w-0 flex-1 justify-end">
                      {pageNum < totalPages ? (
                        <Link
                          href={getPageHref(pageNum + 1)}
                          className="text-fg-muted hover:border-border-strong hover:text-fg-primary inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium transition-colors"
                        >
                          {tCommon("next")}
                          <ChevronRight className="text-fg-muted ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                      ) : (
                        <span className="text-fg-disabled inline-flex cursor-not-allowed items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium">
                          {tCommon("next")}
                          <ChevronRight
                            className="text-fg-disabled ml-2 h-4 w-4"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </div>
                  </nav>
                )}
              </>
            ) : (
              <Card className="border-dashed py-12 text-center">
                <CardContent className="space-y-3">
                  <AlertTriangle className="text-fg-muted mx-auto h-8 w-8" />
                  <p className="text-fg-secondary">{t("noIncidents")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar explaining Article 73 */}
        <aside className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-950/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <Info className="h-4 w-4" />
                {t("obligations")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-fg-secondary space-y-4 text-xs leading-relaxed">
              <p>{t("obligationsDesc")}</p>
              <div className="space-y-3 border-t border-emerald-500/10 pt-4">
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <h5 className="text-fg-primary font-bold">{t("obligationsDate")}</h5>
                    <p className="mt-0.5">{t("obligationsSubDesc")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-950/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-red-400">
                <AlertTriangle className="h-4 w-4" />
                {t("article5")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-fg-secondary space-y-4 text-xs leading-relaxed">
              <p>{t("article5Desc")}</p>
              <div className="space-y-3 border-t border-red-500/10 pt-4">
                <div className="flex gap-2">
                  <Shield className="h-4 w-4 shrink-0 text-red-400" />
                  <div>
                    <h5 className="text-fg-primary font-bold">{t("article5")}</h5>
                    <p className="mt-0.5">{tCat("non_consensual_intimate_imagery_csam")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Link
            href="/submit"
            className="text-bg-primary flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-center text-sm font-bold shadow-lg shadow-emerald-500/10 transition duration-200 hover:from-emerald-400 hover:to-teal-400"
          >
            <FileText className="h-4 w-4" />
            {t("trackerCTA")}
          </Link>
        </aside>
      </div>
    </Container>
  );
}
