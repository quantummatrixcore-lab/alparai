import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Star,
  MessageSquare,
  Lightbulb,
  ArrowLeft,
  Cpu,
  Layers,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ModelScoreDisplay } from "@/components/models/model-score-display";
import { ModelRatingForm } from "@/components/models/model-rating-form";
import { ModelReviewCard } from "@/components/models/model-review-card";
import { ModelFeatureRequestForm } from "@/components/models/model-feature-request-form";
import { ModelFeatureCard } from "@/components/models/model-feature-card";
import type { ModelReview, ModelFeatureRequest } from "@/types";

export const revalidate = 30;

interface ModelDetailPageProps {
  params: Promise<{
    locale: string;
    providerId: string;
    modelId: string;
  }>;
}

export async function generateMetadata({ params }: ModelDetailPageProps) {
  const { locale, modelId } = await params;
  const db = await createServerClient();
  const { data: model } = await db
    .from("ai_models")
    .select("name, version, ai_providers(name)")
    .eq("id", modelId)
    .single();

  const t = await getTranslations({ locale, namespace: "models" });
  if (!model) return { title: t("page_title") };

  const providerName = (model.ai_providers as { name: string } | null)?.name || "";
  return {
    title: `${model.name} (${providerName}) | ALPAR AI Models Directory`,
    description: `Comprehensive evaluation, community reviews, safety benchmarks, and incident history for ${model.name}.`,
  };
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { locale, providerId, modelId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "models" });
  const db = await createServerClient();

  // Parallel DB queries
  const [modelRes, reviewsRes, featuresRes, scoresRes, incidentsRes] = await Promise.all([
    db
      .from("ai_models")
      .select("id, name, version, status, released_at, provider_id, ai_providers(id, name, slug, logo_url, is_verified)")
      .eq("id", modelId)
      .single(),
    db
      .from("model_reviews")
      .select("*, users:user_id(display_name, avatar_url)")
      .eq("model_id", modelId)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    db
      .from("model_feature_requests")
      .select("*, users:user_id(display_name, avatar_url)")
      .eq("model_id", modelId)
      .order("votes_count", { ascending: false }),
    db
      .from("k_model_scores")
      .select("category_id, score, wilson_lower, wilson_upper, k_categories(name, description)")
      .eq("model_id", modelId),
    db
      .from("incidents")
      .select("id, title, category, severity, status, published_at")
      .eq("ai_model_id", modelId)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(10),
  ]);

  if (modelRes.error || !modelRes.data) {
    notFound();
  }

  const model = modelRes.data;
  const provider = model.ai_providers as {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    is_verified?: boolean;
  } | null;

  const reviews = (reviewsRes.data || []) as unknown as ModelReview[];
  const features = (featuresRes.data || []) as unknown as ModelFeatureRequest[];
  const categoryScores = scoresRes.data || [];
  const incidents = incidentsRes.data || [];

  // Calculate score dimensions averages
  let scoreOverallAvg = 0;
  let scoreAccuracyAvg = 0;
  let scoreSafetyAvg = 0;
  let scoreCreativityAvg = 0;
  let scoreSpeedAvg = 0;
  let scoreValueAvg = 0;

  if (reviews.length > 0) {
    scoreOverallAvg = reviews.reduce((sum, r) => sum + r.score_overall, 0) / reviews.length;
    scoreAccuracyAvg = reviews.filter(r => r.score_accuracy).reduce((sum, r) => sum + (r.score_accuracy || 0), 0) / (reviews.filter(r => r.score_accuracy).length || 1);
    scoreSafetyAvg = reviews.filter(r => r.score_safety).reduce((sum, r) => sum + (r.score_safety || 0), 0) / (reviews.filter(r => r.score_safety).length || 1);
    scoreCreativityAvg = reviews.filter(r => r.score_creativity).reduce((sum, r) => sum + (r.score_creativity || 0), 0) / (reviews.filter(r => r.score_creativity).length || 1);
    scoreSpeedAvg = reviews.filter(r => r.score_speed).reduce((sum, r) => sum + (r.score_speed || 0), 0) / (reviews.filter(r => r.score_speed).length || 1);
    scoreValueAvg = reviews.filter(r => r.score_value).reduce((sum, r) => sum + (r.score_value || 0), 0) / (reviews.filter(r => r.score_value).length || 1);
  }

  return (
    <div className="min-h-screen bg-bg-primary py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/models"
            className="group text-fg-muted hover:text-brand-400 inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("back_to_catalog")}
          </Link>
        </div>

        {/* Model Header Banner */}
        <div className="border-border-subtle bg-bg-secondary/60 relative overflow-hidden rounded-3xl border p-8 shadow-2xl backdrop-blur-2xl md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {provider?.logo_url ? (
                  <Image
                    src={provider.logo_url}
                    alt={provider.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-xl object-contain"
                  />
                ) : (
                  <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 flex h-10 w-10 items-center justify-center rounded-xl border font-bold">
                    {provider?.name?.[0] || "M"}
                  </div>
                )}
                <div>
                  <span className="text-fg-muted text-sm font-semibold tracking-wider uppercase">
                    {provider?.name || "Provider"}
                  </span>
                  {provider?.is_verified && (
                    <Badge variant="brand" className="ml-2 py-0.5 text-[10px]">
                      Verified Provider
                    </Badge>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
                {model.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-fg-muted">
                {model.version && (
                  <span className="bg-bg-tertiary border-border-subtle rounded-lg border px-3 py-1 font-mono text-fg-secondary">
                    v{model.version}
                  </span>
                )}
                {model.released_at && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(model.released_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                <Badge variant={model.status === "active" ? "success" : "default"}>
                  {model.status || "Active"}
                </Badge>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-4 text-center">
                <div className="text-fg-muted text-xs font-semibold uppercase">{t("table_rating")}</div>
                <div className="text-2xl font-black text-amber-400">
                  {scoreOverallAvg > 0 ? scoreOverallAvg.toFixed(1) : "—"}
                </div>
                <div className="text-fg-muted text-[11px]">{reviews.length} {t("reviews_count", { count: reviews.length })}</div>
              </div>

              <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-4 text-center">
                <div className="text-fg-muted text-xs font-semibold uppercase">{t("table_suggestions")}</div>
                <div className="text-brand-400 text-2xl font-black">{features.length}</div>
                <div className="text-fg-muted text-[11px]">{t("feature_requests_count", { count: features.length })}</div>
              </div>

              <div className="border-border-subtle bg-bg-secondary col-span-2 rounded-2xl border p-4 text-center sm:col-span-1">
                <div className="text-fg-muted text-xs font-semibold uppercase">Incidents</div>
                <div className={`text-2xl font-black ${incidents.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {incidents.length}
                </div>
                <div className="text-fg-muted text-[11px]">Recorded Failures</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Score & Dimension Breakdown */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-400" />
              Community Evaluation & Dimensions
            </h2>
            <ModelScoreDisplay
              scoreOverall={scoreOverallAvg}
              scoreAccuracy={scoreAccuracyAvg}
              scoreSafety={scoreSafetyAvg}
              scoreCreativity={scoreCreativityAvg}
              scoreSpeed={scoreSpeedAvg}
              scoreValue={scoreValueAvg}
              reviewsCount={reviews.length}
            />
          </div>
        )}

        {/* K-BENCHMARK Category Performance */}
        {categoryScores.length > 0 && (
          <div className="border-border-subtle bg-bg-secondary/40 rounded-3xl border p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-400" />
              K-Benchmark 3.0 Standard Performance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryScores.map((c: any) => (
                <div key={c.category_id} className="border-border-subtle bg-bg-secondary/60 rounded-2xl border p-4 space-y-2">
                  <div className="text-xs font-bold text-fg-muted uppercase tracking-wider">{c.category_id}</div>
                  <div className="text-2xl font-black text-white">{Number(c.score).toFixed(0)}<span className="text-xs text-fg-muted font-normal">/100</span></div>
                  <div className="text-[11px] text-fg-muted font-mono">Wilson: [{c.wilson_lower}-{c.wilson_upper}]</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews and Rating Submission Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left Column: Community Reviews List */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-brand-400" />
                {t("reviews_heading")} ({reviews.length})
              </h2>
            </div>

            {reviews.length === 0 ? (
              <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-12 text-center text-fg-muted">
                <Star className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                <p className="text-base font-semibold text-fg-secondary">{t("no_reviews_title")}</p>
                <p className="text-sm text-fg-muted">{t("no_reviews_subtitle")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <ModelReviewCard key={rev.id} review={rev} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Submit a Review Form */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <ModelRatingForm modelId={modelId} />
            </div>
          </div>
        </div>

        {/* Feature Requests & Roadmap Suggestions Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 pt-10 border-t border-border-subtle">
          {/* Left Column: Feature Requests List */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-amber-400" />
                {t("feature_requests_heading")} ({features.length})
              </h2>
            </div>

            {features.length === 0 ? (
              <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-12 text-center text-fg-muted">
                <Lightbulb className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                <p className="text-base font-semibold text-fg-secondary">{t("no_features_title")}</p>
                <p className="text-sm text-fg-muted">{t("no_features_subtitle")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {features.map((feat) => (
                  <ModelFeatureCard key={feat.id} request={feat} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Submit Feature Request Form */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <ModelFeatureRequestForm modelId={modelId} />
            </div>
          </div>
        </div>

        {/* Incident Failures History */}
        {incidents.length > 0 && (
          <div className="border-border-subtle bg-bg-secondary/30 rounded-3xl border p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Related AI Incident Reports ({incidents.length})
            </h2>
            <div className="divide-y divide-border-subtle">
              {incidents.map((inc: any) => (
                <div key={inc.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Link href={`/incidents/${inc.id}`} className="text-base font-semibold text-fg-secondary hover:text-brand-400 transition-colors">
                      {inc.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                      <Badge variant={inc.severity === "critical" ? "danger" : "warning"}>{inc.severity}</Badge>
                      <span>{inc.category}</span>
                    </div>
                  </div>
                  <Link href={`/incidents/${inc.id}`} className="text-xs text-brand-400 hover:underline flex items-center gap-1">
                    View Case <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
