export const revalidate = 3600; // 1 hour ISR cache

import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
  Users,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const tTransparency = await getTranslations({ locale, namespace: "transparency" });
  return {
    title: t("transparencyTitle", { defaultValue: "Transparency Report" }),
    description: tTransparency("description"),
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

  const supabase = await createServerClient();

  // Query optimized with the new transparency_stats view
  const { data: statsRow } = await supabase.from("transparency_stats").select("*").maybeSingle();

  const stats = statsRow as {
    total_incidents: number | null;
    verified_this_week: number | null;
    provider_response_rate: number | null;
  } | null;

  const totalIncidents = stats?.total_incidents ?? 0;
  const verifiedThisWeek = stats?.verified_this_week ?? 0;
  const responseRate = stats?.provider_response_rate ?? 0;

  const [
    { count: pendingIncidents },
    { count: totalProviders },
    { count: totalResponses },
    { count: totalUsers },
    { count: totalTakedowns },
  ] = await Promise.all([
    supabase
      .from("incidents")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase.from("ai_providers").select("*", { count: "exact", head: true }),
    supabase.from("ai_provider_responses").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("takedown_requests").select("*", { count: "exact", head: true }),
  ]);

  const totalAllIncidents = totalIncidents + (pendingIncidents ?? 0);
  const publishRate =
    totalAllIncidents > 0 ? Math.round((totalIncidents / totalAllIncidents) * 100) : 0;

  return (
    <Container className="py-12">
      <header className="mb-10 space-y-3 text-center">
        <Badge variant="brand" size="sm">
          {t("transparencyTitle", { defaultValue: "Transparency Report" })}
        </Badge>
        <h1 className="text-fg-primary text-3xl font-bold tracking-tight">
          {t("transparencyHeading", { defaultValue: "How ALPAR AI works" })}
        </h1>
        <p className="text-fg-muted mx-auto max-w-2xl text-sm">
          {t("transparencySubheading", {
            defaultValue:
              "Trust infrastructure requires transparency. Here's how we handle reports, moderation, and provider responses.",
          })}
        </p>
      </header>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-brand-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <FileText className="text-brand-400 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{totalIncidents ?? 0}</p>
              <p className="text-fg-muted text-xs">{tTransparency("totalReports")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-success-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <CheckCircle2 className="text-success-500 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{publishRate}%</p>
              <p className="text-fg-muted text-xs">{tTransparency("publishRate")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-warning-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Clock className="text-warning-500 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{verifiedThisWeek}</p>
              <p className="text-fg-muted text-xs">{tTransparency("verifiedThisWeek")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-accent-500/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <MessageSquare className="text-accent-400 h-5 w-5" />
            </div>
            <div>
              <p className="text-fg-primary text-2xl font-bold">{responseRate}%</p>
              <p className="text-fg-muted text-xs">{tTransparency("providerResponseRate")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-sm">
              <BarChart3 className="text-fg-muted h-4 w-4" />
              {t("transparencyNumbers", { defaultValue: "Platform numbers" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row
              icon={<Users className="h-3.5 w-3.5" />}
              label={tTransparency("registeredUsers")}
              value={totalUsers ?? 0}
            />
            <Row
              icon={<Eye className="h-3.5 w-3.5" />}
              label={tTransparency("aiProvidersTracked")}
              value={totalProviders ?? 0}
            />
            <Row
              icon={<FileText className="h-3.5 w-3.5" />}
              label={tTransparency("incidentsReported")}
              value={totalAllIncidents}
            />
            <Row
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label={tTransparency("publishedLabel")}
              value={totalIncidents}
            />
            <Row
              icon={<Clock className="h-3.5 w-3.5" />}
              label={tTransparency("pendingModeration")}
              value={pendingIncidents ?? 0}
            />
            <Row
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              label={tTransparency("providerResponses")}
              value={totalResponses ?? 0}
            />
            <Row
              icon={<Shield className="h-3.5 w-3.5" />}
              label={tTransparency("takedownRequests")}
              value={totalTakedowns ?? 0}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
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

          <div className="bg-bg-tertiary border-border-subtle mx-auto max-w-xl space-y-2 rounded-xl border p-5 text-center font-mono text-xs">
            <div className="text-fg-primary text-sm font-bold">
              {tTransparency("methodologyFormulaTitle", { defaultValue: "Trust Score =" })}
            </div>
            <div className="text-brand-400">
              {tTransparency("methodologyFormula", {
                defaultValue:
                  "(Verified Incidents × -5) + (Response Speed × +20) + (Transparency Report × +15) + (User Rating × +10) + (Audit Score × +30)",
              })}
            </div>
            <div className="text-fg-muted pt-2 text-[10px]">
              {tTransparency("methodologyFormulaNote", {
                defaultValue:
                  "* Normalized to a 0–100 scale. Lower scores indicate higher rates of unaddressed AI incidents.",
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-fg-primary text-xs font-bold">
                {tTransparency("methodologyIncidentsTitle", { defaultValue: "Verified Incidents" })}
              </h4>
              <p className="text-fg-muted text-[11px]">
                {tTransparency("methodologyIncidentsDesc", {
                  defaultValue:
                    "Negative impact. Each verified incident reduces the provider score.",
                })}
              </p>
            </div>
            <div>
              <h4 className="text-fg-primary text-xs font-bold">
                {tTransparency("methodologyResponseTitle", {
                  defaultValue: "Response Rate & Speed",
                })}
              </h4>
              <p className="text-fg-muted text-[11px]">
                {tTransparency("methodologyResponseDesc", {
                  defaultValue:
                    "Positive impact. Prompt official responses to incidents increase score.",
                })}
              </p>
            </div>
            <div>
              <h4 className="text-fg-primary text-xs font-bold">
                {tTransparency("methodologyRatingsTitle", { defaultValue: "User Ratings" })}
              </h4>
              <p className="text-fg-muted text-[11px]">
                {tTransparency("methodologyRatingsDesc", {
                  defaultValue: "Community evaluations of model features and performance.",
                })}
              </p>
            </div>
            <div>
              <h4 className="text-fg-primary text-xs font-bold">
                {tTransparency("methodologyAuditingTitle", {
                  defaultValue: "Independent Auditing",
                })}
              </h4>
              <p className="text-fg-muted text-[11px]">
                {tTransparency("methodologyAuditingDesc", {
                  defaultValue:
                    "Credits given for publishing public bias, privacy, and safety audits.",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
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

        <Card>
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm">
            {tTransparency("transparencyCommitment", { defaultValue: "Our commitment" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-fg-secondary space-y-3 text-sm">
          <p>{tTransparency("commitmentText1")}</p>
          <p>{tTransparency("commitmentText2")}</p>
          <p>{tTransparency("commitmentText3")}</p>
        </CardContent>
      </Card>

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

function Step({ number, title, desc }: { number: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-brand-500/10 text-brand-400 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
        {number}
      </div>
      <div>
        <p className="text-fg-primary font-medium">{title}</p>
        <p className="text-fg-muted text-xs">{desc}</p>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-fg-muted inline-flex items-center gap-1.5 text-xs">
        {icon}
        {label}
      </span>
      <span className="text-fg-primary font-semibold">{value}</span>
    </div>
  );
}
