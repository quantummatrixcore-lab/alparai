import { requireAdmin } from "@/lib/auth/session";
import { getModularArchitectureAction } from "@/actions/admin/modular-architecture";
import {
  Layers,
  Award,
  ShieldCheck,
  CheckCircle2,
  Eye,
  BarChart2,
  Activity,
  AlertTriangle,
  Globe,
  Code,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

const ICON_MAP: Record<string, React.ReactNode> = {
  Eye: <Eye className="h-6 w-6 text-purple-400" />,
  ShieldCheck: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
  BarChart2: <BarChart2 className="h-6 w-6 text-cyan-400" />,
  CheckCircle2: <CheckCircle2 className="h-6 w-6 text-amber-400" />,
  Activity: <Activity className="h-6 w-6 text-rose-400" />,
  AlertTriangle: <AlertTriangle className="h-6 w-6 text-orange-400" />,
  Globe: <Globe className="h-6 w-6 text-blue-400" />,
  Code: <Code className="h-6 w-6 text-teal-400" />,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: t("modular_architecture_title", { defaultValue: "Modüler Mimari Durumu · ALPAR AI" }),
  };
}

export default async function ModularArchitectureAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations("admin");
  const data = await getModularArchitectureAction();

  await requireAdmin();
  return (
    <div className="space-y-8 p-6 text-white">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
          <Layers className="h-8 w-8 text-cyan-400" />
          {data.umbrellaTitle}
        </h1>
        <p className="mt-2 text-slate-400">{data.tagline}</p>
      </div>

      {/* GPT 360 Benchmark Scorecard */}
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-slate-800 bg-slate-900/80 p-6 md:grid-cols-3">
        <div className="flex flex-col items-start justify-center border-r border-slate-800 pr-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Award className="h-5 w-5 text-amber-400" />
            <span>{t("gpt_360_evaluation_score")}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-emerald-400">
              {data.auditScore.overallScore}
            </span>
            <span className="text-xl font-bold text-slate-500">/ {data.auditScore.maxScore}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {t("targeted_roadmap_optimization_to_reach_1")}
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-xs tracking-wider text-emerald-400 uppercase">
            {t("top_strengths")}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {data.auditScore.strengths.map((s) => (
              <div
                key={s.category}
                className="flex justify-between rounded border border-slate-800 bg-slate-950/60 p-2"
              >
                <span className="text-slate-300">{s.category}</span>
                <span className="font-bold text-emerald-400">{s.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-mono text-xs tracking-wider text-amber-400 uppercase">
            {t("growth_bottlenecks")}
          </h3>
          <div className="space-y-2 text-sm">
            {data.auditScore.growthAreas.map((g) => (
              <div
                key={g.category}
                className="flex justify-between rounded border border-slate-800 bg-slate-950/60 p-2"
              >
                <span className="text-slate-300">{g.category}</span>
                <span className="font-bold text-amber-400">{g.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8 Modular Product Pillars */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">
          {t("the_8_modular_product_pillars")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.pillars.map((pillar) => (
            <div
              key={pillar.id}
              className="flex flex-col justify-between space-y-3 rounded-xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-slate-700"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-2">
                    {ICON_MAP[pillar.iconName]}
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {t("pillar_0")}
                    {pillar.number}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-white">{pillar.name}</h3>
                <span className="inline-block rounded border border-cyan-800/60 bg-cyan-950/60 px-2 py-0.5 font-mono text-[11px] text-cyan-400">
                  {pillar.tagline}
                </span>
                <p className="pt-1 text-xs text-slate-300">{pillar.description}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <code className="font-mono text-[11px] text-slate-500">{pillar.route}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
