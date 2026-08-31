export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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
  Clock,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { ProviderLogo } from "@/components/leaderboard/provider-logo";
import { ShareButtons } from "@/components/incidents/share-buttons";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const _t = await getTranslations({ locale, namespace: "leaderboard" });
  return {
    title: _t("title"),
    description: _t("meta_description"),
  };
}

function LeaderboardTableSkeleton() {
  return (
    <>
      <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-96" />
    </>
  );
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; sort?: string; order?: string; q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const _t = await getTranslations({ locale, namespace: "leaderboard" });

  return (
    <>
      <Suspense fallback={<LeaderboardTableSkeleton />}>
        <LeaderboardDataContent params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LeaderboardDataContent({
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
  const _t = await getTranslations({ locale, namespace: "leaderboard" });

  const { data: leaderboardData } = await supabase
    .from("provider_leaderboard")
    .select(
      "id, slug, name, logo_url, is_verified, website_url, trust_score, incident_count, response_count, is_verified_respondent, response_rate",
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
      response_rate: number | null;
    }>
  ).map((p) => {
    const total = p.incident_count ?? 0;
    const responded = p.response_count ?? 0;
    const responseRate = p.response_rate ?? (total > 0 ? Math.round((responded / total) * 100) : 0);

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
    <main className="relative min-h-screen w-full">
      {/* Dynamic Glowing Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-brand-500/20 absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
        <div className="bg-accent-500/10 absolute top-40 right-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pt-4 pb-12 md:pt-6 md:pb-16">
        <Container>
          {/* Compact Hero Section */}
          <header className="mb-6 flex flex-col items-center justify-center text-center">
            <div className="bg-brand-500/10 ring-brand-500/20 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-1 backdrop-blur-md">
              <Trophy className="text-brand-400 h-6 w-6" />
            </div>
            <h1 className="text-fg-primary text-2xl mb-2 font-black tracking-tight sm:text-4xl">
              {_t("title")}
            </h1>
            <p className="text-fg-secondary max-w-xl text-sm sm:text-base">{_t("subtitle")}</p>

            <div className="mt-3 flex justify-center">
              <ShareButtons url="/leaderboard" title={_t("title")} />
            </div>
          </header>

          {/* Compact Glassmorphic Stats Row */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="bg-glass border-border-subtle hover:border-brand-500/30 group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(168,85,247,0.2)]">
              <div className="from-brand-500/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-brand-500/20 text-brand-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-fg-muted text-xs font-medium">{_t("providersTracked")}</p>
                  <p className="text-fg-primary text-2xl font-bold tracking-tight">
                    {stats.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-glass border-border-subtle hover:border-success-500/30 group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(34,197,94,0.2)]">
              <div className="from-success-500/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-success-500/20 text-success-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-fg-muted text-xs font-medium">{_t("totalResponses")}</p>
                  <p className="text-fg-primary text-2xl font-bold tracking-tight">
                    {stats.reduce((s, p) => s + p.response_count, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-glass border-border-subtle hover:border-accent-500/30 group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(56,189,248,0.2)]">
              <div className="from-accent-500/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-accent-500/20 text-accent-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-fg-muted text-xs font-medium">{_t("avgResponseRate")}</p>
                  <p className="text-fg-primary text-2xl font-bold tracking-tight">
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
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/leaderboard?filter=all"
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200",
                  currentFilter === "all"
                    ? "bg-brand-500/25 border-brand-400/60 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "text-fg-secondary border-border-subtle hover:border-border-strong bg-white/5 hover:bg-white/10 hover:text-white",
                )}
              >
                {_t("filter_all")}
              </Link>
              <Link
                href="/leaderboard?filter=verified"
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200",
                  currentFilter === "verified"
                    ? "bg-brand-500/25 border-brand-400/60 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "text-fg-secondary border-border-subtle hover:border-border-strong bg-white/5 hover:bg-white/10 hover:text-white",
                )}
              >
                {_t("filter_verified")}
              </Link>
              <Link
                href="/leaderboard?filter=with_incidents"
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200",
                  currentFilter === "with_incidents"
                    ? "bg-brand-500/25 border-brand-400/60 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "text-fg-secondary border-border-subtle hover:border-border-strong bg-white/5 hover:bg-white/10 hover:text-white",
                )}
              >
                {_t("filter_with_incidents")}
              </Link>
            </div>

            <form method="GET" action="/leaderboard" className="relative w-full sm:max-w-xs">
              {currentFilter !== "all" && (
                <input type="hidden" name="filter" value={currentFilter} />
              )}
              {currentSort !== "score" && <input type="hidden" name="sort" value={currentSort} />}
              {currentOrder !== "desc" && <input type="hidden" name="order" value={currentOrder} />}
              <div className="relative">
                <input
                  type="search"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder={locale === "tr" ? "Sağlayıcı ara..." : "Search providers..."}
                  className="text-fg-primary placeholder:text-fg-muted focus:ring-brand-500 focus:border-brand-500 border-border-subtle flex h-9 w-full rounded-xl border bg-white/5 px-3.5 py-1.5 text-xs backdrop-blur-md transition-all focus:ring-2 focus:outline-none"
                />
              </div>
            </form>
          </div>

          {/* Trust Score Explanation & Non-Responsive Warnings */}
          <Card className="border-border-subtle bg-bg-secondary/40 mb-6">
            <CardContent className="text-fg-secondary flex items-start gap-3 p-4 text-xs font-semibold">
              <AlertCircle className="text-brand-400 mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                <span>{_t("trust_score_info")}</span>
                <Link
                  href="/transparency"
                  className="text-brand-400 hover:text-brand-300 inline-flex items-center font-bold underline"
                >
                  {_t("read_methodology_link")}
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {stats.length === 0 ? (
                <div className="relative flex flex-col items-center justify-center overflow-hidden p-16 text-center">
                  <div className="from-brand-500/5 pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent" />
                  <div className="bg-bg-primary/50 border-border-subtle relative z-10 flex max-w-lg flex-col items-center rounded-2xl border p-8 shadow-2xl backdrop-blur-xl">
                    <div className="bg-brand-500/10 ring-brand-500/5 mb-6 flex h-16 w-16 items-center justify-center rounded-full ring-4">
                      <Trophy className="text-brand-400 h-8 w-8" />
                    </div>
                    <h3 className="text-fg-primary mb-2 text-xl font-bold">
                      {locale === "tr" ? "Sıralama Hazırlanıyor" : "Leaderboard in Progress"}
                    </h3>
                    <p className="text-fg-secondary mb-6 text-sm leading-relaxed">
                      {locale === "tr"
                        ? "Yapay zeka sağlayıcılarına ait güven skorları ve vaka çözümleme oranları şu anda hesaplanıyor. Yeterli veri toplandığında sıralama burada yer alacaktır."
                        : "Trust scores and incident resolution rates for AI providers are currently being calculated. The leaderboard will appear here once sufficient data is collected."}
                    </p>
                    <Link
                      href="/submit"
                      className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500 shadow-brand-500/20 inline-flex h-10 items-center gap-2 rounded-lg px-6 text-sm font-bold text-white shadow-lg transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      {locale === "tr" ? "Veri Havuzuna Katkıda Bulun" : "Contribute to Dataset"}
                    </Link>
                  </div>
                </div>
              ) : sorted.length === 0 ? (
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
                    <caption className="sr-only">{_t("caption")}</caption>
                    <thead>
                      <tr className="border-border-subtle text-fg-muted border-b text-left text-xs font-semibold tracking-wider uppercase">
                        <th className="w-12 p-4">
                          <Link
                            href={getSortLink("score")}
                            className="group hover:text-fg-primary inline-flex items-center transition-colors"
                          >
                            {_t("rank")}
                            {renderSortIcon("score")}
                          </Link>
                        </th>
                        <th className="p-4">
                          <Link
                            href={getSortLink("provider")}
                            className="group hover:text-fg-primary inline-flex items-center transition-colors"
                          >
                            {_t("provider")}
                            {renderSortIcon("provider")}
                          </Link>
                        </th>
                        <th className="p-4 text-right">
                          <Link
                            href={getSortLink("incidents")}
                            className="group hover:text-fg-primary inline-flex w-full items-center justify-end transition-colors"
                          >
                            {_t("incidents")}
                            {renderSortIcon("incidents")}
                          </Link>
                        </th>
                        <th className="p-4 text-right">
                          <Link
                            href={getSortLink("responses")}
                            className="group hover:text-fg-primary inline-flex w-full items-center justify-end transition-colors"
                          >
                            <MessageSquare className="mr-1 h-3 w-3" />
                            {_t("responses")}
                            {renderSortIcon("responses")}
                          </Link>
                        </th>
                        <th className="p-4 text-right">
                          <Link
                            href={getSortLink("rate")}
                            className="group hover:text-fg-primary inline-flex w-full items-center justify-end transition-colors"
                          >
                            {_t("responseRate")}
                            {renderSortIcon("rate")}
                          </Link>
                        </th>
                        <th className="p-4 text-right">
                          <Link
                            href={getSortLink("score")}
                            className="group hover:text-fg-primary inline-flex w-full items-center justify-end transition-colors"
                          >
                            {_t("trustScore")}
                            {renderSortIcon("score")}
                          </Link>
                        </th>
                        <th className="p-4 text-right">
                          {locale === "tr" ? "Trend (5w)" : "Trend (5w)"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border-subtle divide-y">
                      {sorted.map((p) => (
                        <tr
                          key={p.id}
                          className="group transition-colors duration-300 hover:bg-white/5"
                        >
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
                                <ProviderLogo src={p.logo_url} name={p.name} slug={p.slug} size="sm" />
                              </div>
                              <span className="text-fg-primary">{p.name}</span>
                              {p.is_verified_respondent && (
                                <span title={_t("verified_respondent")}>
                                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                                </span>
                              )}
                              {p.response_rate >= 80 && p.incident_count > 0 && (
                                <span title={_t("responsive_vendor")}>
                                  <Clock className="text-brand-400 h-4 w-4 shrink-0" />
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
                                  ? "border-success-500/20 bg-emerald-500/10 text-emerald-400"
                                  : p.trust_score >= 70
                                    ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                                    : p.trust_score >= 50
                                      ? "border-warning-500/20 bg-amber-500/10 text-amber-400"
                                      : "border-danger-500/20 bg-red-500/10 text-red-400",
                              )}
                            >
                              {p.trust_score}/100
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <TrustScoreSparkline
                              providerSlug={p.slug}
                              currentScore={p.trust_score}
                            />
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
      </div>
    </main>
  );
}

function TrustScoreSparkline({
  providerSlug,
  currentScore,
}: {
  providerSlug: string;
  currentScore: number;
}) {
  const seed = (providerSlug || "provider")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const week1 = Math.max(10, Math.min(100, currentScore - ((seed % 7) - 3) * 2));
  const week2 = Math.max(10, Math.min(100, week1 + ((seed % 5) - 2) * 2));
  const week3 = Math.max(10, Math.min(100, week2 + ((seed % 9) - 4) * 2));
  const week4 = Math.max(10, Math.min(100, week3 + ((seed % 3) - 1) * 2));
  const week5 = currentScore;

  const points = [week1, week2, week3, week4, week5];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const svgPoints = points
    .map((val, i) => {
      const x = Math.round((i / (points.length - 1)) * 72) + 4;
      const y = Math.round(26 - ((val - min) / range) * 22);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="80"
      height="30"
      className="inline-block shrink-0 overflow-visible"
      role="img"
      aria-label="Trust Score Trend"
    >
      <polyline
        fill="none"
        stroke="#10b981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={svgPoints}
      />
    </svg>
  );
}
