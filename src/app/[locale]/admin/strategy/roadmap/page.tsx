import { requireAdmin } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { requireAdvisor } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { RoadmapClient } from "@/components/admin/strategy/roadmap-client";
import { RoadmapTodosClient } from "@/components/admin/strategy/todos-client";
import { Compass } from "lucide-react";
import type { StrategyMilestone, StrategyTodo } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdmin();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("strategy_roadmap") || "OKR Roadmap"} | ALPAR AI` };
}

export default async function RoadmapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  // Authenticate user & check advisor access
  const user = await requireAdvisor();
  const isReadOnly = (user.role as string) === "advisor";

  const supabase = await createServerClient();
  const { data: milestonesData } = await supabase
    .from("strategy_milestones")
    .select("*")
    .order("quarter");
  const { data: todosData } = await supabase
    .from("strategy_todos")
    .select("*")
    .order("priority")
    .order("created_at");

  const initialMilestones = (milestonesData ?? []) as StrategyMilestone[];
  const initialTodos = (todosData ?? []) as StrategyTodo[];

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-blue-400" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                {t("strategic_milestone_roadmap")}
              </h1>
            </div>
            <p className="text-fg-muted mt-1 text-sm">
              {t("track_quarterly_objectives_key_results_a")}
            </p>
          </div>
          {isReadOnly && (
            <span className="bg-brand-500/10 text-brand-300 border-brand-500/20 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              {t("read_only")}
            </span>
          )}
        </div>

        {/* Strategic Scenarios Section */}
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-white">{t("strategic_roadmap_scenarios")}</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Scenario A */}
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 backdrop-blur-md">
              <div className="absolute top-0 right-0 rounded-bl-xl border-b border-l border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-extrabold tracking-wider text-purple-400 uppercase">
                {t("scenario_a")}
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-purple-400 uppercase">
                {t("whistleblower_incident_expansion")}
              </span>
              <h3 className="mt-1 text-base font-black text-white">
                {t("global_ai_crime_database")}
              </h3>
              <p className="text-fg-secondary mt-3 text-xs leading-relaxed">
                {t("a_global_repository_documenting_and_publ")}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("status")}
                </span>
                <span className="rounded border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[9px] font-black text-purple-400 uppercase">
                  {t("in_development_phase_2")}
                </span>
              </div>
            </div>

            {/* Scenario B */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 backdrop-blur-md">
              <div className="absolute top-0 right-0 rounded-bl-xl border-b border-l border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-extrabold tracking-wider text-blue-400 uppercase">
                {t("scenario_b")}
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-blue-400 uppercase">
                {t("certification_scorecard")}
              </span>
              <h3 className="mt-1 text-base font-black text-white">
                {t("ethical_evaluation_framework")}
              </h3>
              <p className="text-fg-secondary mt-3 text-xs leading-relaxed">
                {t("scoring_models_based_on_transparency_non")}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("status")}
                </span>
                <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-black text-blue-400 uppercase">
                  {t("active_planning")}
                </span>
              </div>
            </div>

            {/* Scenario C */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 backdrop-blur-md">
              <div className="absolute top-0 right-0 rounded-bl-xl border-b border-l border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold tracking-wider text-emerald-400 uppercase">
                {t("scenario_c")}
              </div>
              <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">
                {t("mediation_transparency")}
              </span>
              <h3 className="mt-1 text-base font-black text-white">{t("public_ai_agoras")}</h3>
              <p className="text-fg-secondary mt-3 text-xs leading-relaxed">
                {t("independent_arbitration_panel_providing_")}
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("status")}
                </span>
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-400 uppercase">
                  {t("planned")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap milestones timeline */}
        <RoadmapClient
          initialMilestones={initialMilestones}
          isReadOnly={isReadOnly}
          _locale={locale}
        />

        {/* Roadmap To-Dos / Checklists */}
        <RoadmapTodosClient initialTodos={initialTodos} isReadOnly={isReadOnly} locale={locale} />
      </Container>
    </div>
  );
}
