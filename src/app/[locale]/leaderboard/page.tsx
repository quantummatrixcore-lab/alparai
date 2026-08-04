export const revalidate = 20;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { ProviderLogo } from "@/components/leaderboard/provider-logo";
import { ShareButtons } from "@/components/incidents/share-buttons";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });
  return {
    title: t("title"),
    description: t("meta_description"),
  };
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; sort?: string; order?: string; q?: string }>;
}) {
  const { locale } = await params;
  const { filter, sort, order, q } = (await searchParams) ?? {};
  const currentFilter = filter || "all";
  const currentSort = sort || "score";
  const currentOrder = order || (currentSort === "provider" ? "asc" : "desc");
  const searchQuery = q || "";

  setRequestLocale(locale);
  const supabase = await createServerClient();
  const t = await getTranslations({ locale, namespace: "leaderboard" });

  const { data: leaderboardData } = await supabase
    .from("provider_leaderboard")
    .select(
      "id, slug, name, logo_url, is_verified, website_url, trust_score, incident_count, response_count, is_verified_respondent",
    )
    .order("name");

  const stats = (
    (leaderboardData ?? []) as unknown as Array<{
      id: string | null;
      slug: string | null;
      name: string | null;
      logo_url: string | null;
      is_verified: boolean | null;
      website_url: string | null;
      trust_score: number | null;
      incident_count: number | null;
      response_count: number | null;
      is_verified_respondent: boolean | null;
    }>
  ).map((p) => {
    const total = p.incident_count ?? 0;
    const responded = p.response_count ?? 0;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    return {
      id: p.id ?? "",
      slug: p.slug ?? "",
      name: p.name ?? "Unknown",
      logo_url: p.logo_url,
      is_verified: !!p.is_verified,
      website_url: p.website_url,
      trust_score: p.trust_score ?? 70,
      incident_count: total,
      response_count: responded,
      response_rate: responseRate,
      is_verified_respondent: !!p.is_verified_respondent,
    };
  });

  const rankedStats = [...stats]
    .sort((a, b) => {
      const scoreA = a.trust_score ?? 70;
      const scoreB = b.trust_score ?? 70;
      if (scoreB !== scoreA) return scoreB - scoreA;
      if (a.incident_count !== b.incident_count) return a.incident_count - b.incident_count;
      return a.name.localeCompare(b.name);
    })
    .map((p, idx) => ({
      ...p,
      rank: idx + 1,
    }));

  const filteredStats = rankedStats.filter((p) => {
    if (currentFilter === "verified" && !p.is_verified) return false;
    if (currentFilter === "with_incidents" && p.incident_count <= 0) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sorted = filteredStats.sort((a, b) => {
    const isAsc = currentOrder === "asc";

    if (currentSort === "provider") {
      return isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }

    if (currentSort === "incidents") {
      return isAsc ? a.incident_count - b.incident_count : b.incident_count - a.incident_count;
    }

    if (currentSort === "responses") {
      return isAsc ? a.response_count - b.response_count : b.response_count - a.response_count;
    }

    if (currentSort === "rate") {
      return isAsc ? a.response_rate - b.response_rate : b.response_rate - a.response_rate;
    }

    // Default or "score"
    const scoreA = a.trust_score ?? 70;
    const scoreB = b.trust_score ?? 70;
    if (scoreB !== scoreA) {
      return isAsc ? scoreA - scoreB : scoreB - scoreA;
    }
    // Secondary sort
    return a.name.localeCompare(b.name);
  });

  const getSortLink = (key: string) => {
    const isCurrent = currentSort === key;
    let nextOrder = currentOrder === "asc" ? "desc" : "asc";
    if (!isCurrent) {
      nextOrder = key === "provider" ? "asc" : "desc";
    }
    const qParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
    return `/leaderboard?filter=${currentFilter}&sort=${key}&order=${nextOrder}${qParam}`;
  };

  const renderSortIcon = (key: string) => {
    if (currentSort !== key)
      return (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-75" />
      );
    return currentOrder === "asc" ? (
      <ArrowUp className="text-brand-400 ml-1 h-3.5 w-3.5 shrink-0" />
    ) : (
      <ArrowDown className="text-brand-400 ml-1 h-3.5 w-3.5 shrink-0" />
    );
  };

  return (
    <Container className="py-10">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-fg-primary inline-flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Trophy className="text-warning-500 h-7 w-7" />
            {t("title")}
          </h1>
          <p className="text-fg-muted mt-2 text-sm">{t("subtitle")}</p>
        </div>
        <div className="shrink-0">
          <ShareButtons url="/leaderboard" title={t("title")} />
        </div>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/leaderboard?filter=all"
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
            currentFilter === "all"
              ? "bg-brand-500/20 border-brand-500 text-brand-400"
              : "border-border-subtle hover:bg-bg-tertiary/50 text-fg-muted",
          )}
        >
          {t("filter_all")}
        </Link>
        <Link
          href="/leaderboard?filter=verified"
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
            currentFilter === "verified"
              ? "bg-brand-500/20 border-brand-500 text-brand-400"
              : "border-border-subtle hover:bg-bg-tertiary/50 text-fg-muted",
          )}
        >
          {t("filter_verified")}
        </Link>
        <Link
          href="/leaderboard?filter=with_incidents"
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
            currentFilter === "with_incidents"
              ? "bg-brand-500/20 border-brand-500 text-brand-400"
              : "border-border-subtle hover:bg-bg-tertiary/50 text-fg-muted",
          )}
        >
          {t("filter_with_incidents")}
        </Link>
      </div>

      <div className="mb-6">
        <form method="GET" action="/leaderboard" className="relative max-w-md">
          {currentFilter !== "all" && <input type="hidden" name="filter" value={currentFilter} />}
          {currentSort !== "score" && <input type="hidden" name="sort" value={currentSort} />}
          {currentOrder !== "desc" && <input type="hidden" name="order" value={currentOrder} />}
          <div className="relative">
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder={locale === "tr" ? "Sağlayıcı ara..." : "Search providers..."}
              className="border-border-subtle bg-bg-secondary text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>
        </form>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-brand-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Trophy className="text-brand-400 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{stats.length}</p>
              <p className="text-fg-muted text-xs">{t("providersTracked")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-success-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <MessageSquare className="text-success-500 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">
                {stats.reduce((s, p) => s + p.response_count, 0)}
              </p>
              <p className="text-fg-muted text-xs">{t("totalResponses")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-accent-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <TrendingUp className="text-accent-400 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">
                {stats.filter((p) => p.incident_count > 0).length > 0
                  ? Math.round(
                      stats
                        .filter((p) => p.incident_count > 0)
                        .reduce((s, p) => s + p.response_rate, 0) /
                        stats.filter((p) => p.incident_count > 0).length,
                    )
                  : 0}
                %
              </p>
              <p className="text-fg-muted text-xs">{t("avgResponseRate")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score Explanation & Non-Responsive Warnings */}
      <Card className="border-border-subtle bg-bg-secondary/40 mb-6">
        <CardContent className="text-fg-secondary flex items-start gap-3 p-4 text-xs font-semibold">
          <AlertCircle className="text-brand-400 mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
            <span>{t("trust_score_info")}</span>
            <Link
              href="/transparency"
              className="text-brand-400 hover:text-brand-300 inline-flex items-center font-bold underline"
            >
              {t("read_methodology_link")}
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-fg-secondary mb-4 max-w-md text-sm font-semibold">
                {locale === "tr"
                  ? "Bu filtreye uyan sağlayıcı yok. Bir vaka bildirmek ister misin?"
                  : "No providers match this filter. Would you like to report an incident?"}
              </p>
              <Link
                href="/submit"
                className="bg-danger-500 hover:bg-danger-600 focus-visible:ring-danger-500 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold text-white shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                {locale === "tr" ? "Vaka Bildir" : "Report Incident"}
              </Link>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">{t("caption")}</caption>
                <thead>
                  <tr className="border-border-subtle text-fg-muted border-b text-left text-xs font-semibold tracking-wider uppercase">
                    <th className="w-12 p-4">
                      <Link
                        href={getSortLink("score")}
                        className="group hover:text-fg-primary inline-flex items-center transition-colors"
                      >
                        {t("rank")}
                        {renderSortIcon("score")}
                      </Link>
                    </th>
                    <th className="p-4">
                      <Link
                        href={getSortLink("provider")}
                        className="group hover:text-fg-primary inline-flex items-center transition-colors"
                      >
                        {t("provider")}
                        {renderSortIcon("provider")}
                      </Link>
                    </th>
                    <th className="p-4 text-right">
                      <Link
                        href={getSortLink("incidents")}
                        className="group hover:text-fg-primary inline-flex w-full items-center justify-end transition-colors"
                      >
                        {t("incidents")}
                        {renderSortIcon("incidents")}
                      </Link>
                    </th>
                    <th className="p-4 text-right">
                      <Link
                        href={getSortLink("responses")}
                        className="group hover:text-fg-primary inline-flex w-full items-center justify-end transition-colors"
                      >
                        <MessageSquare className="mr-1 h-3 w-3" />
                        {t("responses")}
                        {renderSortIcon("responses")}
                      </Link>
                    </th>
                    <th className="p-4 text-right">
                      <Link
                        href={getSortLink("rate")}
                        className="group hover:text-fg-primary inline-flex w-full items-center justify-end transition-colors"
                      >
                        {t("responseRate")}
                        {renderSortIcon("rate")}
                      </Link>
                    </th>
                    <th className="p-4 text-right">
                      <Link
                        href={getSortLink("score")}
                        className="group hover:text-fg-primary inline-flex w-full items-center justify-end transition-colors"
                      >
                        {t("trustScore")}
                        {renderSortIcon("score")}
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border-subtle divide-y">
                  {sorted.map((p) => (
                    <tr key={p.id} className="hover:bg-bg-tertiary/30">
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                            p.rank === 1
                              ? "bg-warning-500/15 text-warning-500"
                              : p.rank === 2
                                ? "bg-fg-muted/15 text-fg-muted"
                                : p.rank === 3
                                  ? "bg-warning-700/15 text-warning-700"
                                  : "bg-bg-tertiary text-fg-muted",
                          )}
                        >
                          {p.rank}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/press-kit/${p.slug}`}
                          className="text-fg-primary hover:text-brand-400 group flex items-center gap-3 font-medium transition-colors"
                        >
                          <div className="border-border-subtle bg-bg-primary relative h-10 w-10 shrink-0 overflow-hidden rounded-md border shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(231,76,60,0.3)]">
                            <ProviderLogo src={p.logo_url} name={p.name} size="sm" />
                          </div>
                          <span className="text-fg-primary">{p.name}</span>
                          {p.is_verified_respondent && (
                            <span title={t("verified_respondent")}>
                              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="text-fg-secondary p-4 text-right">
                        {formatNumber(p.incident_count)}
                      </td>
                      <td className="text-fg-secondary p-4 text-right">
                        {formatNumber(p.response_count)}
                      </td>
                      <td className="p-4 text-right">
                        {p.incident_count > 0 ? (
                          <Badge
                            variant={
                              p.response_rate >= 80
                                ? "success"
                                : p.response_rate >= 50
                                  ? "warning"
                                  : "danger"
                            }
                            size="sm"
                          >
                            {p.response_rate >= 80 ? (
                              <TrendingUp className="mr-1 h-3 w-3" />
                            ) : p.response_rate < 50 ? (
                              <TrendingDown className="mr-1 h-3 w-3" />
                            ) : null}
                            {p.response_rate}%
                          </Badge>
                        ) : (
                          <span className="text-fg-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-mono">
                        <span
                          className={cn(
                            "inline-flex rounded border px-2 py-0.5 text-xs font-bold",
                            p.trust_score >= 90
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : p.trust_score >= 70
                                ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                : p.trust_score >= 50
                                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                  : "border-red-500/20 bg-red-500/10 text-red-400",
                          )}
                        >
                          {p.trust_score}/100
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
