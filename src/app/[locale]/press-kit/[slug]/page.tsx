import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { createServerClient } from "@/lib/supabase/server";
import { ProviderLogo } from "@/components/leaderboard/provider-logo";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IncidentList } from "@/components/incidents/incident-list";
import {
  Globe,
  Mail,
  ExternalLink,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  TrendingUp,
} from "lucide-react";
import type { IncidentListItem } from "@/types";
import { toIncidentListItems } from "@/lib/mappers";

function calculateTrustScore(
  totalIncidents: number,
  responseCount: number,
  resolvedCount: number,
): number {
  if (totalIncidents === 0) return 0;
  const responseRate = responseCount / totalIncidents;
  const resolutionRate = resolvedCount / totalIncidents;
  const volumeBonus = Math.min(totalIncidents / 10, 1);
  const raw = responseRate * 40 + resolutionRate * 40 + volumeBonus * 20;
  return Math.round(Math.min(raw, 100));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });
  const supabase = await createServerClient();
  const { data: provider } = await supabase
    .from("ai_providers")
    .select("name")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  const providerName = provider?.name ?? slug;
  return {
    title: `${providerName} — ${t("brand_profile", { defaultValue: "Brand Profile" })}`,
    description: t("brand_profile_desc", {
      providerName,
      defaultValue: `${providerName} trust score, verified AI incidents, and response tracking.`,
    }),
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "brand" });
  const supabase = await createServerClient();

  const { data: provider } = await supabase
    .from("ai_providers")
    .select(
      "id, name, slug, description, website_url, contact_email, logo_url, is_verified, is_verified_respondent",
    )
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  if (!provider) notFound();

  const providerId = (provider as Record<string, unknown>)["id"] as string;

  const [incidentsRes, modelsRes, allIncidentsRes, responsesRes] = await Promise.all([
    supabase
      .from("incidents")
      .select(
        "id, title_masked, description_masked, title_tr, description_tr, severity, status, category, is_anonymous, incident_date, views_count, upvotes_count, created_at, ai_provider_id, user_id, cross_audit_truth_score, cross_audit_confidence",
      )
      .eq("status", "published")
      .eq("ai_provider_id", providerId)
      .order("published_at", { ascending: false })
      .limit(50),
    supabase
      .from("ai_models")
      .select("id, name, version, status, released_at, provider_id, model_reviews(score_overall)")
      .eq("provider_id", providerId)
      .order("name"),
    supabase
      .from("incidents")
      .select("id, severity, status, views_count")
      .eq("ai_provider_id", providerId),
    supabase
      .from("ai_provider_responses")
      .select("id, incident_id, is_official, is_published, created_at")
      .eq("ai_provider_id", providerId)
      .eq("is_published", true),
  ]);

  const providerRow = provider as Record<string, unknown>;
  const providerName = providerRow["name"] as string;
  const providerSlug = providerRow["slug"] as string;
  const providerDescription = providerRow["description"] as string | null;
  const providerWebsite = providerRow["website_url"] as string | null;
  const providerContact = providerRow["contact_email"] as string | null;
  const providerLogo = providerRow["logo_url"] as string | null;
  const isVerified = (providerRow["is_verified"] as boolean) ?? false;
  const isVerifiedRespondent = (providerRow["is_verified_respondent"] as boolean) ?? false;

  const allIncidents = (allIncidentsRes.data as Array<Record<string, unknown>>) ?? [];
  const responses = (responsesRes.data as Array<Record<string, unknown>>) ?? [];

  const totalIncidents = allIncidents.length;
  const publishedIncidents = allIncidents.filter((i) => i["status"] === "published").length;
  const responseCount = responses.length;
  const respondedIncidentIds = new Set(responses.map((r) => r["incident_id"]));
  const responseRate = totalIncidents > 0 ? Math.round((responseCount / totalIncidents) * 100) : 0;

  const severityBreakdown = {
    critical: allIncidents.filter((i) => i["severity"] === "critical").length,
    high: allIncidents.filter((i) => i["severity"] === "high").length,
    medium: allIncidents.filter((i) => i["severity"] === "medium").length,
    low: allIncidents.filter((i) => i["severity"] === "low").length,
  };

  const totalViews = allIncidents.reduce((sum, i) => sum + ((i["views_count"] as number) ?? 0), 0);
  const avgViews = totalIncidents > 0 ? Math.round(totalViews / totalIncidents) : 0;

  const trustScore = calculateTrustScore(totalIncidents, responseCount, responseCount);

  const incidents: IncidentListItem[] = toIncidentListItems(incidentsRes.data).map((item) => ({
    ...item,
    provider_name: providerName,
    provider_slug: providerSlug,
  }));

  return (
    <Container className="py-10">
      <Card variant="gradient" className="mb-8">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="border-border-subtle bg-bg-tertiary relative h-16 w-16 shrink-0 overflow-hidden rounded-md border shadow-sm">
              <ProviderLogo src={providerLogo} name={providerName} size="lg" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-fg-primary text-2xl font-bold">{providerName}</h1>
                {isVerified && (
                  <Badge variant="success" dot>
                    {t("verified")}
                  </Badge>
                )}
                {isVerifiedRespondent && (
                  <Badge
                    variant="success"
                    className="flex items-center gap-1 border-emerald-500/30 bg-emerald-500/15 font-bold text-emerald-400"
                  >
                    <Shield className="h-3 w-3 shrink-0 text-emerald-400" />
                    {t("verified_respondent")}
                  </Badge>
                )}
              </div>
              {providerDescription && (
                <p className="text-fg-secondary text-sm">{providerDescription}</p>
              )}
              <div className="text-fg-muted flex flex-wrap items-center gap-3 text-xs">
                {providerWebsite && (
                  <a
                    href={providerWebsite}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-brand-400 inline-flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {t("website")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {providerContact && (
                  <a
                    href={`mailto:${providerContact}`}
                    className="hover:text-brand-400 inline-flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    {providerContact}
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        {modelsRes.data && modelsRes.data.length > 0 && (
          <CardContent>
            <p className="text-fg-muted mb-2 text-xs font-semibold tracking-wider uppercase">
              {t("models")}
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                modelsRes.data as Array<{
                  id: string;
                  name: string;
                  version: string | null;
                  provider_id: string;
                  model_reviews: Array<{ score_overall: number }>;
                }>
              ).map((m) => {
                const reviews = m.model_reviews || [];
                const avgScore =
                  reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + r.score_overall, 0) / reviews.length
                    : 0;
                return (
                  <Link key={m.id} href={`/${locale}/models/${m.provider_id}/${m.id}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-bg-tertiary flex cursor-pointer items-center gap-1.5 py-1 transition duration-200"
                    >
                      <span>
                        {m.name} {m.version && `· ${m.version}`}
                      </span>
                      {avgScore > 0 && (
                        <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-bold">
                          ★ {avgScore.toFixed(1)}
                        </span>
                      )}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {!isVerifiedRespondent && (
        <Card className="border-brand-500/20 bg-brand-500/5 mb-8 overflow-hidden">
          <CardContent className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <span className="bg-brand-500/10 text-brand-400 border-brand-500/20 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase">
                {t("unclaimed_profile")}
              </span>
              <h3 className="text-fg-primary text-base font-bold">{t("claim_cta_title")}</h3>
              <p className="text-fg-secondary max-w-2xl text-sm">{t("claim_cta_desc")}</p>
            </div>
            <Link
              href={`/${locale}/onboarding?role=provider&claim=${providerSlug}`}
              className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500 inline-flex h-10 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-bold text-white shadow-lg transition-all"
            >
              {t("claim_button")}
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-brand-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Shield className="text-brand-400 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{trustScore}</p>
              <p className="text-fg-muted text-xs">{t("trustScore")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-warning-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <AlertTriangle className="text-warning-500 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{totalIncidents}</p>
              <p className="text-fg-muted text-xs">{t("totalIncidents")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-success-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <CheckCircle2 className="text-success-500 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{responseRate}%</p>
              <p className="text-fg-muted text-xs">{t("responseRate")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-accent-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Eye className="text-accent-400 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{avgViews}</p>
              <p className="text-fg-muted text-xs">{t("avgViews")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <TrendingUp className="text-brand-400 h-4 w-4" />
              {t("severityBreakdown")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: t("critical"), count: severityBreakdown.critical, color: "bg-danger-500" },
                { label: t("high"), count: severityBreakdown.high, color: "bg-danger-400" },
                { label: t("medium"), count: severityBreakdown.medium, color: "bg-warning-500" },
                { label: t("low"), count: severityBreakdown.low, color: "bg-success-500" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-fg-muted w-16 text-xs">{s.label}</span>
                  <div className="bg-bg-tertiary h-2 flex-1 rounded-full">
                    <div
                      className={`h-2 rounded-full ${s.color}`}
                      style={{
                        width: totalIncidents > 0 ? `${(s.count / totalIncidents) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-fg-primary w-8 text-right text-xs font-semibold">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <Clock className="text-fg-muted h-4 w-4" />
              {t("quickStats")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">{t("published")}</span>
              <span className="text-success-500 font-semibold">{publishedIncidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">{t("responsesGiven")}</span>
              <span className="text-brand-400 font-semibold">{responseCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">{t("totalViews")}</span>
              <span className="text-fg-primary font-semibold">{totalViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">{t("incidentsResponded")}</span>
              <span className="text-accent-400 font-semibold">{respondedIncidentIds.size}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-fg-primary text-lg font-semibold">
          {t("incidentsReported", { count: incidents.length })}
        </h2>
        <IncidentList incidents={incidents} />
      </div>
    </Container>
  );
}
