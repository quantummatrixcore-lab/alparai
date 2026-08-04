import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Star, MessageSquare, Lightbulb, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { ModelScoreDisplay } from "@/components/models/model-score-display";
import { ModelReviewCard } from "@/components/models/model-review-card";
import { ModelFeatureCard } from "@/components/models/model-feature-card";
import { ModelRatingForm } from "@/components/models/model-rating-form";
import { ModelFeatureRequestForm } from "@/components/models/model-feature-request-form";
import type { ModelReview, ModelFeatureRequest } from "@/types";
import { ModelJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";

export const revalidate = 20;

export async function generateMetadata({ params }: ModelDetailPageProps) {
  const { locale, modelId, providerId } = await params;
  const t = await getTranslations({ locale, namespace: "models" });
  const db = await createServerClient();
  const { data: model } = await db
    .from("ai_models")
    .select("name, ai_providers(name)")
    .eq("id", modelId)
    .eq("provider_id", providerId)
    .single();
  const providerName = (model?.ai_providers as { name: string } | null)?.name;
  return {
    title: model ? `${model.name} — ${providerName ?? t("unknown_provider")}` : t("page_title"),
    description: t("page_subtitle"),
  };
}

interface ModelDetailPageProps {
  params: Promise<{
    locale: string;
    providerId: string;
    modelId: string;
  }>;
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { locale, providerId, modelId } = await params;
  const t = await getTranslations({ locale, namespace: "models" });
  const db = await createServerClient();
  const user = await getCurrentUser();

  // Fetch model details
  const { data: model } = await db
    .from("ai_models")
    .select(
      "id, name, version, status, released_at, provider_id, ai_providers(id, name, slug, logo_url)",
    )
    .eq("id", modelId)
    .eq("provider_id", providerId)
    .single();

  if (!model) {
    notFound();
  }

  // Fetch reviews and features
  const [reviewsRes, featuresRes, userReviewVotesRes, userFeatureVotesRes] = await Promise.all([
    db
      .from("model_reviews")
      .select(
        "id, model_id, user_id, is_anonymous, score_overall, score_accuracy, score_safety, score_creativity, score_speed, score_value, title, body, status, helpful_count, created_at, users(username, full_name)",
      )
      .eq("model_id", modelId)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    db
      .from("model_feature_requests")
      .select(
        "id, model_id, user_id, is_anonymous, title, description, category, status, votes_count, created_at, users(username, full_name)",
      )
      .eq("model_id", modelId)
      .order("votes_count", { ascending: false }),
    user
      ? db.from("model_review_votes").select("review_id").eq("user_id", user.id)
      : Promise.resolve({ data: null }),
    user
      ? db.from("model_feature_votes").select("request_id").eq("user_id", user.id)
      : Promise.resolve({ data: null }),
  ]);

  const reviews = reviewsRes.data || [];
  const features = featuresRes.data || [];
  const userReviewVotes = (userReviewVotesRes.data || []).map((v) => v.review_id);
  const userFeatureVotes = (userFeatureVotesRes.data || []).map((v) => v.request_id);

  // Aggregate scores
  const scoreStats = reviews.reduce(
    (acc, curr) => {
      acc.total += curr.score_overall;
      acc.accuracy += curr.score_accuracy || 0;
      acc.safety += curr.score_safety || 0;
      acc.creativity += curr.score_creativity || 0;
      acc.speed += curr.score_speed || 0;
      acc.value += curr.score_value || 0;

      acc.countAccuracy += curr.score_accuracy ? 1 : 0;
      acc.countSafety += curr.score_safety ? 1 : 0;
      acc.countCreativity += curr.score_creativity ? 1 : 0;
      acc.countSpeed += curr.score_speed ? 1 : 0;
      acc.countValue += curr.score_value ? 1 : 0;
      return acc;
    },
    {
      total: 0,
      accuracy: 0,
      safety: 0,
      creativity: 0,
      speed: 0,
      value: 0,
      countAccuracy: 0,
      countSafety: 0,
      countCreativity: 0,
      countSpeed: 0,
      countValue: 0,
    },
  );

  const reviewsCount = reviews.length;
  const avgOverall = reviewsCount > 0 ? scoreStats.total / reviewsCount : 0;
  const avgAccuracy =
    scoreStats.countAccuracy > 0 ? scoreStats.accuracy / scoreStats.countAccuracy : 0;
  const avgSafety = scoreStats.countSafety > 0 ? scoreStats.safety / scoreStats.countSafety : 0;
  const avgCreativity =
    scoreStats.countCreativity > 0 ? scoreStats.creativity / scoreStats.countCreativity : 0;
  const avgSpeed = scoreStats.countSpeed > 0 ? scoreStats.speed / scoreStats.countSpeed : 0;
  const avgValue = scoreStats.countValue > 0 ? scoreStats.value / scoreStats.countValue : 0;

  const mappedReviews = reviews.map((r): ModelReview => {
    const u = r.users as { username: string | null; full_name: string | null } | null;
    return {
      ...r,
      author_name: u?.username || u?.full_name || null,
      has_voted: userReviewVotes.includes(r.id),
      status: r.status as ModelReview["status"],
      score_accuracy: r.score_accuracy ?? null,
      score_safety: r.score_safety ?? null,
      score_creativity: r.score_creativity ?? null,
      score_speed: r.score_speed ?? null,
      score_value: r.score_value ?? null,
      title: r.title ?? null,
      body: r.body ?? null,
    };
  });

  const mappedFeatures = features.map((f): ModelFeatureRequest => {
    const u = f.users as { username: string | null; full_name: string | null } | null;
    return {
      ...f,
      author_name: u?.username || u?.full_name || null,
      has_voted: userFeatureVotes.includes(f.id),
      description: f.description ?? null,
      category: f.category as ModelFeatureRequest["category"],
      status: f.status as ModelFeatureRequest["status"],
    };
  });

  const provider = model.ai_providers as {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
  const statusVariants: Record<string, "success" | "muted" | "warning"> = {
    active: "success",
    deprecated: "muted",
    beta: "warning",
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <ModelJsonLd
        name={model.name}
        description={`Accountability reviews, trust scores, and community feature requests for ${model.name} by ${provider?.name || "AI Provider"}.`}
        provider={provider?.name || "AI Provider"}
        ratingValue={avgOverall > 0 ? avgOverall : undefined}
        reviewCount={reviewsCount > 0 ? reviewsCount : undefined}
        url={`${APP_URL}/${locale}/models/${providerId}/${modelId}`}
      />
      <Link
        href={`/${locale}/models`}
        className="text-fg-muted hover:text-fg-primary inline-flex items-center gap-2 text-sm font-semibold transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("all_providers")}</span>
      </Link>

      {/* Hero Section */}
      <div className="border-border-subtle bg-bg-secondary/20 flex flex-col items-start justify-between gap-6 rounded-2xl border p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          {provider?.logo_url ? (
            <Image
              src={provider.logo_url}
              alt={provider.name}
              width={64}
              height={64}
              unoptimized
              className="border-border-subtle bg-bg-tertiary h-16 w-16 rounded-2xl border object-contain p-2"
            />
          ) : (
            <div className="bg-bg-tertiary text-fg-muted flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold">
              {provider?.name?.[0] || "AI"}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-fg-muted text-sm font-medium">
                {provider?.name || t("unknown_provider")}
              </span>
              <Badge variant={statusVariants[model.status] || "default"} size="sm">
                {t(model.status)}
              </Badge>
            </div>
            <h1 className="text-fg-primary text-3xl font-extrabold">{model.name}</h1>
            <p className="text-fg-muted text-xs">
              {model.version && t("version", { version: model.version })}
              {model.released_at && ` • ${t("released", { date: model.released_at })}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-fg-muted mb-1 flex items-center justify-center gap-1 text-sm font-semibold">
              <Star className="fill-brand-400 text-brand-400 h-4 w-4" />
              <span>{avgOverall.toFixed(1)}</span>
            </div>
            <span className="text-fg-muted text-xs">{t("based_on", { count: reviewsCount })}</span>
          </div>
        </div>
      </div>

      {/* Scores Display */}
      <ModelScoreDisplay
        scoreOverall={avgOverall}
        scoreAccuracy={avgAccuracy}
        scoreSafety={avgSafety}
        scoreCreativity={avgCreativity}
        scoreSpeed={avgSpeed}
        scoreValue={avgValue}
        reviewsCount={reviewsCount}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Interactive Forms */}
        <div className="space-y-8 lg:col-span-1">
          {user ? (
            <>
              <ModelRatingForm modelId={model.id} />
              <ModelFeatureRequestForm modelId={model.id} />
            </>
          ) : (
            <div className="border-border-subtle bg-bg-secondary/40 space-y-4 rounded-2xl border p-6 text-center">
              <p className="text-fg-secondary text-sm">{t("sign_in_required")}</p>
              <Link
                href={`/${locale}/auth/signin`}
                className="bg-brand-500 hover:bg-brand-600 inline-block rounded-xl px-6 py-2.5 font-bold text-white transition duration-200"
              >
                {t("sign_in_button")}
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Reviews and Features Lists */}
        <div className="space-y-8 lg:col-span-2">
          {/* Reviews List */}
          <div className="space-y-4">
            <h2 className="text-fg-primary flex items-center gap-2 text-2xl font-bold">
              <MessageSquare className="text-brand-500 h-6 w-6" />
              <span>{t("write_review")}</span>
            </h2>
            {mappedReviews.length > 0 ? (
              <div className="space-y-4">
                {mappedReviews.map((review) => (
                  <ModelReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-fg-muted border-border-strong rounded-2xl border border-dashed p-6 text-center text-sm italic">
                {t("no_reviews")}
              </p>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <h2 className="text-fg-primary flex items-center gap-2 text-2xl font-bold">
              <Lightbulb className="text-brand-500 h-6 w-6" />
              <span>{t("feature_requests")}</span>
            </h2>
            {mappedFeatures.length > 0 ? (
              <div className="space-y-4">
                {mappedFeatures.map((req) => (
                  <ModelFeatureCard key={req.id} request={req} />
                ))}
              </div>
            ) : (
              <p className="text-fg-muted border-border-strong rounded-2xl border border-dashed p-6 text-center text-sm italic">
                {t("no_features")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
