import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  Star,
  MessageSquare,
  Lightbulb,
  ChevronRight,
  Cpu,
  Layers,
  Sparkles,
  Search,
  SlidersHorizontal,
  Award,
  ShieldCheck,
} from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ProviderLogo } from "@/components/leaderboard/provider-logo";
import { MODELS_CATALOG } from "@/lib/constants/models-catalog";

export const revalidate = 30;

export async function generateMetadata({ params }: ModelPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "models" });
  return {
    title: t("page_title"),
    description: t("page_subtitle"),
  };
}

interface ModelPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    search?: string;
    sort?: string;
  }>;
}

export default async function ModelsPage({ params, searchParams }: ModelPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { search, sort } = await searchParams;
  const t = await getTranslations({ locale, namespace: "models" });
  const db = await createServerClient();

  // Fetch all models, reviews, and feature requests
  const [modelsRes, reviewsRes, featuresRes] = await Promise.all([
    db
      .from("ai_models")
      .select(
        "id, name, version, status, released_at, provider_id, ai_providers(id, name, slug, logo_url)",
      )
      .order("name"),
    db.from("model_reviews").select("model_id, score_overall").eq("status", "published"),
    db.from("model_feature_requests").select("model_id, id"),
  ]);

  const dbModels = (modelsRes.data || []).filter((model) => {
    const provider = model.ai_providers as { slug: string } | null;
    return provider?.slug !== "alpar-autopilot";
  });
  const dbModelIds = new Set(dbModels.map((m) => m.id));

  const catalogModels = MODELS_CATALOG.filter((cat) => !dbModelIds.has(cat.id)).map((cat) => ({
    id: cat.id,
    name: cat.name,
    version: cat.category,
    status: "active",
    released_at: null as string | null,
    provider_id: cat.provider.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    ai_providers: {
      id: cat.provider.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: cat.provider,
      slug: cat.provider.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      logo_url: null as string | null,
    },
    description: cat.description,
    context_window: cat.contextWindow,
  }));

  const models = [...dbModels, ...catalogModels];
  const reviews = reviewsRes.data || [];
  const features = featuresRes.data || [];

  // Calculate aggregates
  const reviewStats = reviews.reduce(
    (acc: Record<string, { total: number; count: number }>, curr) => {
      const modelId = curr.model_id;
      let stat = acc[modelId];
      if (!stat) {
        stat = { total: 0, count: 0 };
        acc[modelId] = stat;
      }
      stat.total += curr.score_overall;
      stat.count += 1;
      return acc;
    },
    {},
  );

  const featureStats = features.reduce((acc: Record<string, number>, curr) => {
    acc[curr.model_id] = (acc[curr.model_id] || 0) + 1;
    return acc;
  }, {});

  // Dashboard Stats Calculations
  const totalModelsCount = models.length;
  const ratedModelsCount = models.filter((m) => (reviewStats[m.id]?.count || 0) > 0).length;
  const uniqueProvidersCount = new Set(
    models.map((m) => (m.ai_providers as { name: string } | null)?.name || m.provider_id),
  ).size;
  const totalAuditsCount = reviews.length + features.length;

  // Apply search filtering
  let filteredModels = [...models];
  if (search) {
    const searchLower = search.toLowerCase();
    filteredModels = filteredModels.filter((model) => {
      const provider = model.ai_providers as { name: string } | null;
      return (
        model.name.toLowerCase().includes(searchLower) ||
        (provider?.name && provider.name.toLowerCase().includes(searchLower))
      );
    });
  }

  // Apply sorting
  filteredModels.sort((a, b) => {
    const statsA = reviewStats[a.id] || { total: 0, count: 0 };
    const statsB = reviewStats[b.id] || { total: 0, count: 0 };
    const avgA = statsA.count > 0 ? statsA.total / statsA.count : 0;
    const avgB = statsB.count > 0 ? statsB.total / statsB.count : 0;
    const featA = featureStats[a.id] || 0;
    const featB = featureStats[b.id] || 0;

    switch (sort) {
      case "rating":
        return avgB - avgA;
      case "reviews":
        return statsB.count - statsA.count;
      case "features":
        return featB - featA;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const statusVariants: Record<string, "success" | "muted" | "warning"> = {
    active: "success",
    deprecated: "muted",
    beta: "warning",
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      {/* Enterprise Header Banner */}
      <div className="relative space-y-4 text-center">
        <div className="border-brand-500/30 bg-brand-500/10 text-brand-300 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="text-brand-400 h-3.5 w-3.5 animate-pulse" />
          <span>{t("enterprise_badge")}</span>
        </div>
        <h1 className="text-fg-primary to-brand-300 bg-gradient-to-r from-white via-slate-100 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-6xl">
          {t("page_title")}
        </h1>
        <p className="text-fg-muted mx-auto max-w-2xl text-base leading-relaxed font-normal sm:text-lg">
          {t("page_subtitle")}
        </p>
      </div>

      {/* Enterprise Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="hover:border-brand-500/40 border-border-subtle bg-bg-secondary hover:bg-bg-secondary relative overflow-hidden rounded-2xl border p-5 shadow-xl backdrop-blur-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              {t("stat_total_models")}
            </span>
            <div className="border-brand-500/20 bg-brand-500/10 text-brand-400 flex h-9 w-9 items-center justify-center rounded-xl border">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{totalModelsCount}</div>
          <div className="text-fg-muted mt-1 flex items-center gap-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t("stat_total_models_sub")}</span>
          </div>
        </div>

        <div className="border-border-subtle bg-bg-secondary hover:bg-bg-secondary relative overflow-hidden rounded-2xl border p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              {t("stat_rated_models")}
            </span>
            <div className="border-warning-500/20 flex h-9 w-9 items-center justify-center rounded-xl border bg-amber-500/10 text-amber-400">
              <Star className="h-5 w-5 fill-amber-400/20" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{ratedModelsCount}</div>
          <div className="text-fg-muted mt-1 text-xs">{t("stat_rated_models_sub")}</div>
        </div>

        <div className="border-border-subtle bg-bg-secondary hover:bg-bg-secondary relative overflow-hidden rounded-2xl border p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              {t("stat_providers")}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{uniqueProvidersCount}</div>
          <div className="text-fg-muted mt-1 text-xs">{t("stat_providers_sub")}</div>
        </div>

        <div className="border-border-subtle bg-bg-secondary hover:bg-bg-secondary relative overflow-hidden rounded-2xl border p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-fg-muted text-xs font-bold tracking-wider uppercase">
              {t("stat_audits")}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{totalAuditsCount}</div>
          <div className="text-fg-muted mt-1 text-xs">{t("stat_audits_sub")}</div>
        </div>
      </div>

      {/* Glassmorphism Filter and Sort Form */}
      <form
        method="GET"
        className="border-border-subtle bg-bg-secondary relative mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="text-fg-muted pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder={t("search_placeholder")}
            className="focus:border-brand-500 focus:ring-brand-500/20 border-border-subtle bg-bg-secondary w-full rounded-xl border py-2.5 pr-4 pl-11 text-sm text-white placeholder-slate-400 transition-all focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <SlidersHorizontal className="text-fg-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <select
              name="sort"
              defaultValue={sort || "name"}
              className="focus:border-brand-500 focus:ring-brand-500/20 border-border-subtle bg-bg-secondary cursor-pointer rounded-xl border py-2.5 pr-8 pl-9 text-sm text-white transition-all focus:ring-2 focus:outline-none"
            >
              <option value="name">{t("sort_name")}</option>
              <option value="rating">{t("sort_rating")}</option>
              <option value="reviews">{t("sort_reviews")}</option>
              <option value="features">{t("sort_features")}</option>
            </select>
          </div>
          <button
            type="submit"
            className="from-brand-500 shadow-brand-500/20 hover:from-brand-600 focus:ring-brand-500/50 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:to-indigo-700 focus:ring-2 focus:outline-none"
          >
            {t("filter")}
          </button>
        </div>
      </form>

      {/* Enterprise Glassmorphic Table/List View */}
      <div className="border-border-subtle bg-bg-secondary overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
        {/* Table Header (Hidden on Mobile) */}
        <div className="border-border-subtle bg-bg-secondary text-fg-muted hidden border-b px-6 py-4 text-xs font-black tracking-widest uppercase md:grid md:grid-cols-[2fr_1.2fr_1.2fr_1.2fr_0.8fr_0.8fr_40px] md:items-center md:gap-4">
          <div>{t("table_model_name")}</div>
          <div>{t("table_provider")}</div>
          <div>{t("table_status")}</div>
          <div className="text-center">{t("table_rating")}</div>
          <div className="text-center">{t("table_reviews")}</div>
          <div className="text-center">{t("table_suggestions")}</div>
          <div></div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredModels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-brand-500/10 border-brand-500/20 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
                <Lightbulb className="text-brand-400 h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">
                {search ? t("no_results_title") : t("empty_title")}
              </h3>
              <p className="text-fg-muted max-w-sm text-sm">
                {search ? t("no_results_subtitle") : t("empty_subtitle")}
              </p>
            </div>
          ) : (
            filteredModels.map((model) => {
              const provider = model.ai_providers as {
                id: string;
                name: string;
                slug: string;
                logo_url: string | null;
              } | null;
              const stats = reviewStats[model.id] || { total: 0, count: 0 };
              const avgScore = stats.count > 0 ? stats.total / stats.count : 0;
              const featuresCount = featureStats[model.id] || 0;

              return (
                <Link
                  key={model.id}
                  href={`/models/${model.provider_id}/${model.id}`}
                  className="group hover:bg-bg-secondary flex flex-col gap-4 p-6 transition-all duration-300 md:grid md:grid-cols-[2fr_1.2fr_1.2fr_1.2fr_0.8fr_0.8fr_40px] md:items-center md:gap-4 md:px-6 md:py-4"
                >
                  {/* Model Name & Version */}
                  <div className="space-y-1">
                    <h3 className="group-hover:text-brand-400 text-base font-bold text-white transition-colors">
                      {model.name}
                    </h3>
                    <p className="text-fg-muted font-mono text-xs">
                      {model.version && t("version", { version: model.version })}
                      {model.released_at && ` • ${t("released", { date: model.released_at })}`}
                    </p>
                  </div>

                  {/* Provider */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-bg-secondary shadow-sm">
                      <ProviderLogo
                        src={provider?.logo_url}
                        name={provider?.name || "AI"}
                        slug={provider?.slug}
                        size="xs"
                      />
                    </div>
                    <span className="text-fg-primary text-sm font-semibold">
                      {provider?.name || t("unknown_provider")}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge
                      variant={statusVariants[model.status] || "default"}
                      size="sm"
                      dot
                      className="border-border-subtle w-fit"
                    >
                      {t(model.status)}
                    </Badge>
                  </div>

                  {/* Rating / Stars */}
                  <div className="flex items-center gap-2 md:justify-center">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= Math.round(avgScore)
                              ? "fill-amber-400 text-amber-400"
                              : "text-fg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="border-warning-500/20 inline-flex items-center rounded-md border bg-amber-500/10 px-1.5 py-0.5 text-xs font-extrabold text-amber-300">
                      {avgScore > 0 ? avgScore.toFixed(1) : "-"}
                    </span>
                  </div>

                  {/* Reviews */}
                  <div className="text-fg-primary flex items-center gap-2 md:justify-center md:gap-0">
                    <MessageSquare className="text-fg-muted h-4 w-4 shrink-0 md:hidden" />
                    <span className="text-sm font-bold">{stats.count}</span>
                    <span className="text-fg-muted ml-1 text-xs md:hidden">
                      ({t("reviews", { count: stats.count })})
                    </span>
                  </div>

                  {/* Suggestions */}
                  <div className="text-fg-primary flex items-center gap-2 md:justify-center md:gap-0">
                    <Lightbulb className="text-fg-muted h-4 w-4 shrink-0 md:hidden" />
                    <span className="text-sm font-bold">{featuresCount}</span>
                    <span className="text-fg-muted ml-1 text-xs md:hidden">
                      ({t("suggestions_label")})
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <div className="group-hover:bg-brand-500/20 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 transition-all duration-200">
                      <ChevronRight className="group-hover:text-brand-300 text-fg-muted h-4 w-4 transition duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
