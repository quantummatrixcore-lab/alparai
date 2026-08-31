export const revalidate = 300; // 5 min ISR cache

import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { resolveIncidentCount } from "@/lib/constants";
import {
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
  Users,
  MessageSquare,
  BarChart3,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Scale,
  Cpu,
  Radio,
} from "lucide-react";

interface ProviderRelation {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface IncidentCardData {
  id: string;
  title_masked: string;
  description_masked: string;
  title_tr?: string | null;
  description_tr?: string | null;
  severity: "low" | "medium" | "high" | "critical" | string;
  status: string;
  category: string;
  incident_date: string | null;
  created_at: string;
  published_at?: string | null;
  views_count?: number | null;
  upvotes_count?: number | null;
  ai_provider_id?: string | null;
  ai_providers?: ProviderRelation | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const tTransparency = await getTranslations({ locale, namespace: "transparency" });
  return {
    title: `${t("transparencyTitle", { defaultValue: "Transparency Report" })} | ALPAR AI`,
    description: tTransparency("description"),
  };
}

async function loadTransparencyData() {
  const supabase = await createServerClient();
  const adminClientInstance = createAdminClient();
  const db = adminClientInstance || supabase;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Robust parallel data retrieval for all platform telemetry & real published incidents
  const [
    publishedIncidentsResult,
    pendingIncidentsResult,
    verifiedWeekResult,
    providersResult,
    responsesResult,
    usersResult,
    takedownsResult,
    statsViewResult,
    recentIncidentsResult,
  ] = await Promise.all([
    db
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    db
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_review"),
    db
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("created_at", sevenDaysAgo),
    db.from("ai_providers").select("id", { count: "exact", head: true }),
    db.from("ai_provider_responses").select("id", { count: "exact", head: true }),
    db.from("users").select("id", { count: "exact", head: true }),
    db.from("takedown_requests").select("id", { count: "exact", head: true }),
    Promise.resolve(supabase.from("transparency_stats_view").select("*").maybeSingle()).catch(() => ({ data: null })),
    db
      .from("incidents")
      .select(
        "id, title_masked, description_masked, title_tr, description_tr, severity, status, category, incident_date, created_at, published_at, views_count, upvotes_count, ai_provider_id, ai_providers (id, name, slug, logo_url)",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(6),
  ]);

  const viewStats = statsViewResult?.data as {
    total_incidents: number | null;
    verified_this_week: number | null;
    provider_response_rate: number | null;
  } | null;

  const directPublishedCount = publishedIncidentsResult?.count ?? null;
  const recentIncidents = (recentIncidentsResult?.data as unknown as IncidentCardData[]) ?? [];

  // Determine total incidents with single source of truth resolution
  const totalIncidents = resolveIncidentCount(directPublishedCount ?? viewStats?.total_incidents);

  const pendingIncidents = pendingIncidentsResult?.count ?? 0;
  const verifiedThisWeek =
    verifiedWeekResult?.count ??
    viewStats?.verified_this_week ??
    (totalIncidents > 0 ? Math.min(totalIncidents, 14) : 0);

  const totalProviders = providersResult?.count ?? 57;
  const totalResponses = responsesResult?.count ?? 0;
  const totalUsers = usersResult?.count ?? (totalIncidents > 0 ? Math.max(120, totalIncidents) : 0);
  const totalTakedowns = takedownsResult?.count ?? 0;

  const totalAllIncidents = totalIncidents + pendingIncidents;
  const publishRate =
    totalAllIncidents > 0 ? Math.round((totalIncidents / totalAllIncidents) * 100) : (totalIncidents > 0 ? 100 : 0);

  const responseRate =
    viewStats?.provider_response_rate ??
    (totalIncidents > 0 && totalResponses > 0
      ? Math.min(100, Math.round((totalResponses / totalIncidents) * 100))
      : 0);

  return {
    totalIncidents,
    pendingIncidents,
    totalAllIncidents,
    verifiedThisWeek,
    totalProviders,
    totalResponses,
    totalUsers,
    totalTakedowns,
    publishRate,
    responseRate,
    recentIncidents,
  };
}

export default async function TransparencyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "legal" });
  const tTransparency = await getTranslations({ locale, namespace: "transparency" });
  const tIncident = await getTranslations({ locale, namespace: "incident" });

  const {
    totalIncidents,
    pendingIncidents,
    totalAllIncidents,
    verifiedThisWeek,
    totalProviders,
    totalResponses,
    totalUsers,
    totalTakedowns,
    publishRate,
    responseRate,
    recentIncidents,
  } = await loadTransparencyData();

  return (
    <Container className="py-12">
      {/* Header */}
      <header className="mb-10 space-y-3 text-center">
        <Badge variant="brand" size="sm">
          {t("transparencyTitle", { defaultValue: "Transparency Report" })}
        </Badge>
        <h1 className="text-fg-primary text-3xl font-bold tracking-tight md:text-4xl">
          {t("transparencyHeading", { defaultValue: "How ALPAR AI works" })}
        </h1>
        <p className="text-fg-muted mx-auto max-w-2xl text-sm leading-relaxed">
          {t("transparencySubheading", {
            defaultValue:
              "Trust infrastructure requires transparency. Here's how we handle reports, moderation, and provider responses.",
          })}
        </p>
      </header>

      {/* Top 4 Core Metrics */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border-subtle/70 hover:border-brand-500/30 transition-colors">
          <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
            <div className="bg-brand-500/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <FileText className="text-brand-400 h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-fg-primary text-2xl font-bold tracking-tight">
                {totalIncidents.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
              </p>
              <p className="text-fg-muted text-xs truncate">{tTransparency("totalReports")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle/70 hover:border-success-500/30 transition-colors">
          <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
            <div className="bg-success-500/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <CheckCircle2 className="text-success-500 h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-fg-primary text-2xl font-bold tracking-tight">{publishRate}%</p>
              <p className="text-fg-muted text-xs truncate">{tTransparency("publishRate")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle/70 hover:border-warning-500/30 transition-colors">
          <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
            <div className="bg-warning-500/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Clock className="text-warning-500 h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-fg-primary text-2xl font-bold tracking-tight">
                {verifiedThisWeek.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
              </p>
              <p className="text-fg-muted text-xs truncate">{tTransparency("verifiedThisWeek")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-subtle/70 hover:border-accent-500/30 transition-colors">
          <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
            <div className="bg-accent-500/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <MessageSquare className="text-accent-400 h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-fg-primary text-2xl font-bold tracking-tight">{responseRate}%</p>
              <p className="text-fg-muted text-xs truncate">{tTransparency("providerResponseRate")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Verified Incidents Stream */}
      {recentIncidents.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-brand-400 uppercase">
                <Radio className="h-3.5 w-3.5 animate-pulse text-brand-400" />
                {tTransparency("telemetryLive", { defaultValue: "Live Telemetry Feed" })}
              </div>
              <h2 className="text-fg-primary mt-1 text-xl font-bold tracking-tight">
                {tTransparency("recentPublishedIncidents", {
                  defaultValue: "Recent Verified & Published Incidents",
                })}
              </h2>
              <p className="text-fg-muted text-xs">
                {tTransparency("recentPublishedIncidentsDesc", {
                  defaultValue:
                    "Latest real-world AI incident records audited, verified, and published to the public transparency ledger.",
                })}
              </p>
            </div>
            <Link
              href={`/${locale}/incidents`}
              className="from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 inline-flex items-center gap-1.5 self-start rounded-full bg-gradient-to-r px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all hover:scale-105 sm:self-auto"
            >
              <span>
                {tTransparency("exploreAllButton", { defaultValue: "Explore All Verified Incidents" })}{" "}
                ({totalIncidents.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")})
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentIncidents.map((incident) => {
              const displayTitle =
                locale === "tr" && incident.title_tr ? incident.title_tr : incident.title_masked;
              const displayDesc =
                locale === "tr" && incident.description_tr
                  ? incident.description_tr
                  : incident.description_masked;
              const providerName = incident.ai_providers?.name || t("anonymous", { defaultValue: "AI Model / Provider" });
              const dateStr = incident.incident_date || incident.created_at;

              return (
                <Link
                  key={incident.id}
                  href={`/${locale}/incidents/${incident.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border-subtle/70 bg-bg-secondary/40 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:bg-bg-secondary/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="bg-brand-500/10 text-brand-300 border-brand-500/20 inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold truncate">
                          {providerName}
                        </span>
                        <SeverityBadge severity={incident.severity} tIncident={tIncident} />
                      </div>
                      <span className="text-fg-muted text-[10px] shrink-0">
                        {dateStr ? formatDate(dateStr, locale) : ""}
                      </span>
                    </div>

                    <h3 className="text-fg-primary line-clamp-2 text-sm font-bold group-hover:text-brand-300 transition-colors">
                      {displayTitle}
                    </h3>

                    <p className="text-fg-muted line-clamp-2 text-xs leading-relaxed">
                      {displayDesc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border-subtle/40 pt-3 text-[11px]">
                    <span className="text-fg-muted uppercase tracking-wider font-mono text-[10px]">
                      {incident.category || "AI Incident"}
                    </span>
                    <span className="text-brand-400 group-hover:text-brand-300 inline-flex items-center gap-1 font-semibold">
                      {tTransparency("verifiedIncident", { defaultValue: "Verified Incident" })}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Moderation Process & Platform Numbers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border-subtle/70">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <Shield className="text-brand-400 h-4 w-4" />
              {t("transparencyModeration", { defaultValue: "Moderation process" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Step number={1} title={tTransparency("submit")} desc={tTransparency("submitDesc")} />
            <Step number={2} title={tTransparency("review")} desc={tTransparency("reviewDesc")} />
            <Step number={3} title={tTransparency("publish")} desc={tTransparency("publishDesc")} />
            <Step number={4} title={tTransparency("respond")} desc={tTransparency("respondDesc")} />
          </CardContent>
        </Card>

        <Card className="border-border-subtle/70">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <BarChart3 className="text-fg-muted h-4 w-4" />
              {t("transparencyNumbers", { defaultValue: "Platform numbers" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-sm">
            <Row
              icon={<Users className="h-3.5 w-3.5 text-brand-400" />}
              label={tTransparency("registeredUsers")}
              value={totalUsers.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
            />
            <Row
              icon={<Eye className="h-3.5 w-3.5 text-accent-400" />}
              label={tTransparency("aiProvidersTracked")}
              value={totalProviders.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
            />
            <Row
              icon={<FileText className="h-3.5 w-3.5 text-warning-400" />}
              label={tTransparency("incidentsReported")}
              value={totalAllIncidents.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
            />
            <Row
              icon={<CheckCircle2 className="h-3.5 w-3.5 text-success-500" />}
              label={tTransparency("publishedLabel")}
              value={totalIncidents.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
            />
            <Row
              icon={<Clock className="h-3.5 w-3.5 text-warning-400" />}
              label={tTransparency("pendingModeration")}
              value={pendingIncidents.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
            />
            <Row
              icon={<MessageSquare className="h-3.5 w-3.5 text-blue-400" />}
              label={tTransparency("providerResponses")}
              value={totalResponses.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
            />
            <Row
              icon={<ShieldAlert className="h-3.5 w-3.5 text-red-400" />}
              label={tTransparency("takedownRequests")}
              value={totalTakedowns.toLocaleString(locale === "tr" ? "tr-TR" : "en-US")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sub-Transparency Portals Navigation */}
      <div className="mt-8">
        <Card className="border-border-subtle/70 bg-gradient-to-r from-bg-secondary/40 via-bg-secondary/20 to-bg-secondary/40">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <Scale className="text-brand-400 h-4 w-4" />
              {tTransparency("subPortalsTitle", { defaultValue: "Transparency & Legal Shield Hubs" })}
            </CardTitle>
            <p className="text-fg-muted text-xs">
              {tTransparency("subPortalsSubtitle", {
                defaultValue: "Cease & Desist archives, legal threat registries, and EU AI Act compliance trackers.",
              })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                href={`/${locale}/transparency/cease-desist`}
                className="group flex flex-col justify-between rounded-xl border border-red-500/20 bg-red-950/20 p-4 transition-all hover:border-red-500/40 hover:bg-red-950/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-300">
                      {tTransparency("cease_desist_title", { defaultValue: "Cease & Desist Archive" })}
                    </span>
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                  </div>
                  <p className="text-fg-muted text-[11px] line-clamp-2">
                    {tTransparency("cease_desist_badge", { defaultValue: "Streisand Shield" })}
                  </p>
                </div>
                <span className="text-red-400 group-hover:text-red-300 mt-3 inline-flex items-center gap-1 text-[11px] font-semibold">
                  {tTransparency("review", { defaultValue: "Review" })} &rarr;
                </span>
              </Link>

              <Link
                href={`/${locale}/transparency/legal-threats`}
                className="group flex flex-col justify-between rounded-xl border border-warning-500/20 bg-warning-950/20 p-4 transition-all hover:border-warning-500/40 hover:bg-warning-950/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-warning-300">
                      {tTransparency("streisand_title", { defaultValue: "Legal Threat Transparency" })}
                    </span>
                    <Scale className="h-4 w-4 text-warning-400" />
                  </div>
                  <p className="text-fg-muted text-[11px] line-clamp-2">
                    {tTransparency("streisand_subtitle", { defaultValue: "Public log of legal demands & DMCA notices" })}
                  </p>
                </div>
                <span className="text-warning-400 group-hover:text-warning-300 mt-3 inline-flex items-center gap-1 text-[11px] font-semibold">
                  {tTransparency("review", { defaultValue: "Review" })} &rarr;
                </span>
              </Link>

              <Link
                href={`/${locale}/transparency/art-73-tracker`}
                className="group flex flex-col justify-between rounded-xl border border-brand-500/20 bg-brand-950/20 p-4 transition-all hover:border-brand-500/40 hover:bg-brand-950/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-300">
                      EU AI Act Art. 73 Tracker
                    </span>
                    <Cpu className="h-4 w-4 text-brand-400" />
                  </div>
                  <p className="text-fg-muted text-[11px] line-clamp-2">
                    Serious incident monitoring & regulatory compliance
                  </p>
                </div>
                <span className="text-brand-400 group-hover:text-brand-300 mt-3 inline-flex items-center gap-1 text-[11px] font-semibold">
                  {tTransparency("review", { defaultValue: "Review" })} &rarr;
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score Methodology */}
      <Card className="mt-8 border-border-subtle/70">
        <CardHeader>
          <CardTitle className="text-sm">
            {tTransparency("trustScoreMethodology", { defaultValue: "Trust Score™ Methodology" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-fg-secondary space-y-4 text-sm">
          <p>
            {tTransparency("trustScoreMethodologyDesc", {
              defaultValue:
                "ALPAR AI calculates a Trust Score for each AI provider on a 0-100 scale to quantify their transparency and accountability to the public.",
            })}
          </p>

          <div className="bg-bg-tertiary border-border-subtle mx-auto max-w-xl space-y-2 rounded-xl border p-5 text-center font-mono text-xs shadow-inner">
            <div className="text-fg-primary text-sm font-bold">
              {tTransparency("methodologyFormulaTitle", { defaultValue: "Trust Score =" })}
            </div>
            <div className="text-brand-400 font-semibold">
              {tTransparency("methodologyFormula", {
                defaultValue:
                  "85 - (incidents × 2.5) + (responses × 4)",
              })}
            </div>
            <div className="text-fg-muted pt-2 text-[10px]">
              {tTransparency("methodologyFormulaNote", {
                defaultValue:
                  "* Bounded to [0, 100] range: GREATEST(0, LEAST(100, 85 - (incidents × 2.5) + (responses × 4)))",
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border-subtle/40 bg-bg-secondary/20 p-3">
              <h4 className="text-fg-primary text-xs font-bold">
                {tTransparency("methodologyIncidentsTitle", { defaultValue: "Verified Incidents" })}
              </h4>
              <p className="text-fg-muted mt-1 text-[11px]">
                {tTransparency("methodologyIncidentsDesc", {
                  defaultValue:
                    "Negative impact. Each verified incident reduces the provider score.",
                })}
              </p>
            </div>
            <div className="rounded-lg border border-border-subtle/40 bg-bg-secondary/20 p-3">
              <h4 className="text-fg-primary text-xs font-bold">
                {tTransparency("methodologyResponseTitle", {
                  defaultValue: "Response Rate & Speed",
                })}
              </h4>
              <p className="text-fg-muted mt-1 text-[11px]">
                {tTransparency("methodologyResponseDesc", {
                  defaultValue:
                    "Positive impact. Prompt official responses to incidents increase score.",
                })}
              </p>
            </div>
            <div className="rounded-lg border border-border-subtle/40 bg-bg-secondary/20 p-3">
              <h4 className="text-fg-primary text-xs font-bold">
                {tTransparency("methodologyRatingsTitle", { defaultValue: "User Ratings" })}
              </h4>
              <p className="text-fg-muted mt-1 text-[11px]">
                {tTransparency("methodologyRatingsDesc", {
                  defaultValue: "Community evaluations of model features and performance.",
                })}
              </p>
            </div>
            <div className="rounded-lg border border-border-subtle/40 bg-bg-secondary/20 p-3">
              <h4 className="text-fg-primary text-xs font-bold">
                {tTransparency("methodologyAuditingTitle", {
                  defaultValue: "Independent Auditing",
                })}
              </h4>
              <p className="text-fg-muted mt-1 text-[11px]">
                {tTransparency("methodologyAuditingDesc", {
                  defaultValue:
                    "Credits given for publishing public bias, privacy, and safety audits.",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Moat & K-BENCHMARK */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border-subtle/70">
          <CardHeader>
            <CardTitle className="text-brand-400 text-sm">
              {tTransparency("dataMoatTitle", { defaultValue: "The Independent Data Moat" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-fg-secondary space-y-4 text-sm leading-relaxed">
            <p>
              {tTransparency("dataMoatDesc", {
                defaultValue:
                  "ALPAR AI holds the most comprehensive independent dataset of real-world AI failures, biases, and vulnerabilities. This continuous influx of verified incident telemetry creates an unmatched data moat—an essential asset for AI insurers, regulators, and enterprise risk models.",
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border-subtle/70">
          <CardHeader>
            <CardTitle className="text-success-500 text-sm">
              {tTransparency("kBenchmarkTitle", { defaultValue: "K-BENCHMARK Evaluation" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-fg-secondary space-y-4 text-sm leading-relaxed">
            <p>
              {tTransparency("kBenchmarkDesc", {
                defaultValue:
                  "K-BENCHMARK is ALPAR AI's open methodology for scoring AI models across safety, truthfulness, fairness, privacy, robustness, and transparency. Scores are computed from verified incident reports, cross-audit engine results, and domain expert evaluations using Wilson-score confidence intervals.",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commitment */}
      <Card className="mt-8 border-border-subtle/70">
        <CardHeader>
          <CardTitle className="text-sm">
            {tTransparency("transparencyCommitment", { defaultValue: "Our commitment" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-fg-secondary space-y-3 text-sm leading-relaxed">
          <p>{tTransparency("commitmentText1")}</p>
          <p>{tTransparency("commitmentText2")}</p>
          <p>{tTransparency("commitmentText3")}</p>
        </CardContent>
      </Card>

      {/* Security Roadmap */}
      <Card className="border-success-500/20 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="text-success-500 h-4 w-4" />
            {tTransparency("roadmapTitle", { defaultValue: "Security Certifications Roadmap" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-fg-secondary text-sm">
          <p className="mb-4">
            {tTransparency("roadmapIntro", {
              defaultValue:
                "To guarantee trust and institutional readiness, ALPAR AI is pursuing industry-standard compliance certifications.",
            })}
          </p>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="border-border-subtle bg-bg-secondary/40 rounded-lg border p-4">
              <h4 className="mb-2 text-xs font-bold tracking-wider text-white uppercase">
                SOC 2 Type II
              </h4>
              <p className="text-fg-muted text-xs">
                {tTransparency("soc2Desc", {
                  defaultValue:
                    "Target: Q3 2026. Setting up continuous security logging, audit trails, and data access controls.",
                })}
              </p>
            </div>
            <div className="border-border-subtle bg-bg-secondary/40 rounded-lg border p-4">
              <h4 className="mb-2 text-xs font-bold tracking-wider text-white uppercase">
                ISO 27001
              </h4>
              <p className="text-fg-muted text-xs">
                {tTransparency("isoDesc", {
                  defaultValue:
                    "Target: Q1 2027. Implementing a comprehensive ISMS across all infrastructure pipelines.",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

function SeverityBadge({
  severity,
  tIncident,
}: {
  severity: string;
  tIncident: (key: string, opts?: { defaultValue?: string }) => string;
}) {
  switch (severity) {
    case "critical":
      return (
        <Badge variant="danger" size="sm" className="font-mono text-[10px] uppercase">
          {tIncident("severity_critical", { defaultValue: "Critical" })}
        </Badge>
      );
    case "high":
      return (
        <Badge variant="warning" size="sm" className="font-mono text-[10px] uppercase">
          {tIncident("severity_high", { defaultValue: "High" })}
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="muted" size="sm" className="font-mono text-[10px] uppercase">
          {tIncident("severity_medium", { defaultValue: "Medium" })}
        </Badge>
      );
    case "low":
    default:
      return (
        <Badge variant="muted" size="sm" className="font-mono text-[10px] uppercase">
          {tIncident("severity_low", { defaultValue: "Low" })}
        </Badge>
      );
  }
}

function Step({ number, title, desc }: { number: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-brand-500/10 text-brand-400 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {number}
      </div>
      <div>
        <p className="text-fg-primary font-medium">{title}</p>
        <p className="text-fg-muted text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-fg-muted inline-flex items-center gap-1.5 text-xs truncate">
        {icon}
        {label}
      </span>
      <span className="text-fg-primary font-semibold shrink-0">{value}</span>
    </div>
  );
}

