import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { ShieldCheck, Search, Trophy, Cpu, ExternalLink, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

export const dynamic = "force-dynamic";

interface ScoreRecord {
  score: number;
  wilson_lower: number;
  wilson_upper: number;
  sample_size: number;
  last_audited_at: string;
  status: string;
  k_categories: {
    id: string;
    name: string;
    description: string;
  } | null;
  ai_models: {
    id: string;
    name: string;
    ai_providers: {
      name: string;
      slug: string;
    } | null;
  } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ratings" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function RatingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = (await searchParams) ?? {};

  setRequestLocale(locale);
  const supabase = await createServerClient();
  const t = await getTranslations({ locale, namespace: "ratings" });

  // 1. Fetch categories
  const { data: categories } = await supabase
    .from("k_categories")
    .select("id, name, description")
    .order("id");

  // 2. Fetch all model scores
  const { data: scoresData } = await supabase.from("k_model_scores").select(`
      score,
      wilson_lower,
      wilson_upper,
      sample_size,
      last_audited_at,
      status,
      k_categories (
        id,
        name,
        description
      ),
      ai_models (
        id,
        name,
        ai_providers (
          name,
          slug
        )
      )
    `);

  const records = (scoresData ?? []) as unknown as ScoreRecord[];

  // Group scores by model
  const modelMap: Record<
    string,
    {
      modelId: string;
      modelName: string;
      providerName: string;
      providerSlug: string;
      categoryScores: Record<string, number>;
      overallScore: number;
      lastAudited: string;
      sampleSize: number;
      isRetired: boolean;
    }
  > = {};

  records.forEach((rec) => {
    if (!rec.ai_models || !rec.k_categories) return;
    const modelId = rec.ai_models.id;
    const catId = rec.k_categories.id;

    if (!modelMap[modelId]) {
      modelMap[modelId] = {
        modelId,
        modelName: rec.ai_models.name,
        providerName: rec.ai_models.ai_providers?.name ?? "Unknown",
        providerSlug: rec.ai_models.ai_providers?.slug ?? "",
        categoryScores: {},
        overallScore: 0,
        lastAudited: rec.last_audited_at,
        sampleSize: 0,
        isRetired: rec.status === "retired",
      };
    }

    modelMap[modelId].categoryScores[catId] = Number(rec.score);
    modelMap[modelId].sampleSize += rec.sample_size;
    if (new Date(rec.last_audited_at) > new Date(modelMap[modelId].lastAudited)) {
      modelMap[modelId].lastAudited = rec.last_audited_at;
    }
  });

  // Calculate composite/overall score
  const modelsList = Object.values(modelMap).map((m) => {
    const scores = Object.values(m.categoryScores);
    const avg =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      ...m,
      overallScore: avg,
    };
  });

  // Filter based on search query
  const filteredModels = modelsList.filter((m) => {
    const matchesSearch =
      m.modelName.toLowerCase().includes(q.toLowerCase()) ||
      m.providerName.toLowerCase().includes(q.toLowerCase());
    return matchesSearch;
  });

  // Sort by overall score descending
  const sortedModels = filteredModels.sort((a, b) => b.overallScore - a.overallScore);

  const activeCategoryList = categories ?? [];

  return (
    <Container className="max-w-7xl py-12 text-slate-100">
      <div className="mb-12 flex flex-col space-y-6">
        <div className="flex items-center space-x-3 text-sm font-semibold tracking-wider text-[#00FF88] uppercase">
          <ShieldCheck className="h-5 w-5 animate-pulse" />
          <span>ALPAR AI Ratings</span>
        </div>
        <h1 className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-slate-400">{t("subtitle")}</p>

        {/* Methodology and API links */}
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            href="/methodology/benchmarks"
            className="flex items-center space-x-2 text-sm text-[#00FF88] hover:underline"
          >
            <Activity className="h-4 w-4" />
            <span>{t("methodology_link")}</span>
          </Link>
          <Link
            href="/api-docs"
            className="ml-4 flex items-center space-x-2 text-sm text-slate-400 hover:text-white hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            <span>JSON API docs</span>
          </Link>
        </div>
      </div>

      {/* Grid of Categories (Explanation Cards) */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {activeCategoryList.map((cat) => (
          <div
            key={cat.id}
            className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-700/60"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-[#00FF88]/20 bg-[#00FF88]/10 px-2 py-0.5 text-xs font-bold text-[#00FF88]">
                {cat.id}
              </span>
            </div>
            <h3 className="mb-2 text-base font-bold text-white">{cat.name}</h3>
            <p className="text-xs leading-relaxed text-slate-400">{cat.description}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
        <form method="GET" action="" className="relative w-full max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={t("search_placeholder")}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pr-4 pl-10 text-sm text-slate-200 placeholder-slate-500 transition-all focus:border-[#00FF88] focus:ring-1 focus:ring-[#00FF88]/30 focus:outline-none"
          />
        </form>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/30 backdrop-blur-md">
        {sortedModels.length === 0 ? (
          <div className="p-12 text-center text-slate-500">{t("no_data")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/50 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  <th className="w-16 px-6 py-4 text-center">Rank</th>
                  <th className="px-6 py-4">{t("model")}</th>
                  <th className="px-6 py-4">{t("provider")}</th>
                  {activeCategoryList.map((cat) => (
                    <th key={cat.id} className="px-6 py-4 text-center">
                      {cat.id}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center font-bold text-[#00FF88]">
                    {t("overall_score")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {sortedModels.map((item, index) => (
                  <tr
                    key={item.modelId}
                    className="group transition-all duration-150 hover:bg-slate-900/20"
                  >
                    <td className="px-6 py-4 text-center font-mono text-sm text-slate-400 group-hover:text-white">
                      {index === 0 ? (
                        <Trophy className="mx-auto h-5 w-5 text-yellow-500" />
                      ) : index === 1 ? (
                        <Trophy className="mx-auto h-5 w-5 text-slate-300" />
                      ) : index === 2 ? (
                        <Trophy className="mx-auto h-5 w-5 text-amber-600" />
                      ) : (
                        `#${index + 1}`
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/models/${item.providerSlug}/${item.modelId}`}
                        className="flex items-center space-x-2 font-bold text-white transition-colors hover:text-[#00FF88]"
                      >
                        <Cpu className="h-4 w-4 text-slate-500 transition-colors group-hover:text-[#00FF88]" />
                        <span>{item.modelName}</span>
                        {item.isRetired && (
                          <span className="ml-2 rounded-full border border-rose-900/30 bg-rose-950/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                            {t("retired", { defaultValue: "Retired" })}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{item.providerName}</td>
                    {activeCategoryList.map((cat) => {
                      const score = item.categoryScores[cat.id];
                      return (
                        <td key={cat.id} className="px-6 py-4 text-center font-mono text-sm">
                          {score !== undefined ? (
                            <span
                              className={cn(
                                "rounded-md px-2 py-1 text-xs font-semibold",
                                score >= 85
                                  ? "border border-emerald-800/30 bg-emerald-950/20 text-emerald-400"
                                  : score >= 75
                                    ? "border border-blue-800/30 bg-blue-950/20 text-blue-400"
                                    : "border border-amber-800/30 bg-amber-950/20 text-amber-400",
                              )}
                            >
                              {score}%
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center font-mono text-sm font-bold">
                      <span className="rounded border border-[#00FF88]/20 bg-[#00FF88]/10 px-3 py-1 text-white transition-all group-hover:border-[#00FF88]/40 group-hover:bg-[#00FF88]/20">
                        {item.overallScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
