import { requireAdmin } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { requireAdvisor } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { HealthGauge } from "@/components/admin/strategy/health-gauge";
import { LiveStrategyClient } from "@/components/admin/strategy/live-strategy-client";
import { Link } from "@/i18n/routing";
import { STRATEGY_METRICS_DEFAULTS, DEFAULT_VALUATION_PRE_MONEY } from "@/lib/constants";
import { QUESTIONS } from "@/lib/strategy/questions";
import {
  ShieldAlert,
  TrendingUp,
  Grid as GridIcon,
  Compass,
  Users,
  AlertCircle,
  Activity,
  DollarSign,
  ChevronRight,
  Cpu,
} from "lucide-react";
import type {
  SwotItem,
  StrategyRisk,
  StrategyValuation,
  StrategyMilestone,
  StrategyMetricsSnapshot,
} from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await requireAdmin();
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("strategy_header") || "Strategy Board"} | ALPAR AI` };
}

export default async function StrategyOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  // Authenticate user & check advisor access
  const user = await requireAdvisor();
  const isReadOnly = (user.role as string) === "advisor";

  const supabase = await createServerClient();

  // Fetch all strategy components
  const [
    swotRes,
    risksRes,
    valuationsRes,
    milestonesRes,
    snapshotsRes,
    liveIncidentsRes,
    liveUsersRes,
    liveProvidersRes,
    liveMrrRes,
  ] = await Promise.all([
    supabase.from("strategy_swot_items").select("*").order("category"),
    supabase.from("strategy_risks").select("*").order("code"),
    supabase
      .from("strategy_valuations")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(5),
    supabase.from("strategy_milestones").select("*").order("quarter"),
    supabase
      .from("strategy_metrics_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false })
      .limit(1),
    supabase.from("incidents").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("ai_providers").select("id", { count: "exact", head: true }),
    supabase
      .from("finance_revenue_metrics")
      .select("mrr_usd")
      .order("month", { ascending: false })
      .limit(1),
  ]);

  const swotItems = (swotRes.data ?? []) as SwotItem[];
  const risks = (risksRes.data ?? []) as StrategyRisk[];
  const valuations = (valuationsRes.data ?? []) as StrategyValuation[];
  const milestones = (milestonesRes.data ?? []) as StrategyMilestone[];
  const latestSnapshot = (snapshotsRes.data?.[0] ??
    STRATEGY_METRICS_DEFAULTS) as StrategyMetricsSnapshot;

  // Dynamically overwrite with real-time live data
  const liveIncidentsCount = liveIncidentsRes.count ?? latestSnapshot.total_incidents;
  const liveUsersCount = liveUsersRes.count ?? latestSnapshot.total_users;
  const liveProvidersCount = liveProvidersRes.count ?? latestSnapshot.active_providers;
  const liveMrrCents = liveMrrRes.data?.[0]
    ? Number(liveMrrRes.data[0].mrr_usd) * 100
    : latestSnapshot.mrr_cents;

  const dynamicSnapshot = {
    ...latestSnapshot,
    total_incidents: liveIncidentsCount,
    total_users: liveUsersCount,
    active_providers: liveProvidersCount,
    mrr_cents: liveMrrCents,
  };

  // Process SWOT counts
  const strengthsCount = swotItems.filter((i) => i.category === "strength").length;
  const weaknessesCount = swotItems.filter((i) => i.category === "weakness").length;
  const opportunitiesCount = swotItems.filter((i) => i.category === "opportunity").length;
  const threatsCount = swotItems.filter((i) => i.category === "threat").length;

  // Process Risks
  const highRisksCount = risks.filter((r) => r.probability * r.impact >= 15).length;
  const activeRisksCount = risks.filter(
    (r) => r.status === "active" || r.status === "triggered",
  ).length;

  // Process Milestones
  const doneMilestones = milestones.filter((m) => m.status === "done").length;
  const totalMilestones = milestones.length;
  const avgOkrProgress =
    totalMilestones > 0
      ? Math.round(milestones.reduce((acc, m) => acc + m.progress, 0) / totalMilestones)
      : 0;

  // Formatting helper for currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat(t("en_us"), {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="text-brand-400 animate-spin-slow h-6 w-6" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                {t("strategic_advisory_board")}
              </h1>
            </div>
            <p className="text-fg-muted mt-1 text-sm">
              {t("real_time_company_health_metrics_swot_ri")}
            </p>
          </div>
          {isReadOnly && (
            <span className="bg-brand-500/10 text-brand-300 border-brand-500/20 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              {t("read_only_advisor")}
            </span>
          )}
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT COLUMN: Health Score and Core Metrics Snapshots */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <HealthGauge score={dynamicSnapshot.health_score} />

            {/* Core Metrics Card */}
            <div className="border-border-subtle bg-bg-secondary/40 rounded-2xl border p-6 backdrop-blur-md">
              <h3 className="mb-4 text-xs font-bold tracking-wider text-white uppercase">
                {t("core_metrics_snapshot")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                  <div className="text-fg-muted flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      {t("total_users")}
                    </span>
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-white">
                    {dynamicSnapshot.total_users}
                  </p>
                </div>

                <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                  <div className="text-fg-muted flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      {t("incidents")}
                    </span>
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-white">
                    {dynamicSnapshot.total_incidents}
                  </p>
                </div>

                <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                  <div className="text-fg-muted flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      {t("providers_1")}
                    </span>
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-white">
                    {dynamicSnapshot.active_providers}
                  </p>
                </div>

                <div className="bg-bg-tertiary/20 rounded-xl border border-white/5 p-4">
                  <div className="text-fg-muted flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase">
                      {t("runway")}
                    </span>
                    <DollarSign className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-white">
                    {dynamicSnapshot.runway_months
                      ? `${dynamicSnapshot.runway_months} ${t("mo")}`
                      : t("unknown")}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-white/5 pt-4 text-center">
                <div className="text-fg-muted flex justify-between text-xs">
                  <span>{t("monthly_revenue_mrr")}</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(dynamicSnapshot.mrr_cents)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Strategy Modules Summary Links */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
            {/* SWOT ANALİZİ CARD */}
            <div className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/30 flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg border border-purple-500/25 bg-purple-500/10 p-2 text-purple-400">
                    <GridIcon className="h-5 w-5" />
                  </div>
                  <span className="text-fg-muted font-mono text-[9px] font-bold tracking-wider uppercase">
                    {t("module_01")}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{t("swot_matrix")}</h2>
                <p className="text-fg-muted mt-2 text-xs">
                  {t("track_internal_strengths_weaknesses_and_")}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-1.5 font-bold text-emerald-400">
                    S: {strengthsCount}
                  </div>
                  <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-1.5 font-bold text-red-400">
                    W: {weaknessesCount}
                  </div>
                  <div className="rounded-lg border border-blue-500/10 bg-blue-500/5 p-1.5 font-bold text-blue-400">
                    O: {opportunitiesCount}
                  </div>
                  <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-1.5 font-bold text-amber-400">
                    T: {threatsCount}
                  </div>
                </div>
              </div>
              <Link
                href="/admin/strategy/swot"
                className="text-brand-400 hover:text-brand-300 mt-6 flex items-center gap-1 text-xs font-bold transition"
              >
                {t("manage_swot")}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* RİSK YÖNETİMİ CARD */}
            <div className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/30 flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-2 text-red-400">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <span className="text-fg-muted font-mono text-[9px] font-bold tracking-wider uppercase">
                    {t("module_02")}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{t("risk_analysis_matrix")}</h2>
                <p className="text-fg-muted mt-2 text-xs">
                  {t("prioritize_monitor_and_mitigate_legal_pr")}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <div className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2 text-center">
                    <span className="text-fg-muted block text-[9px] font-bold tracking-wider uppercase">
                      {t("aktif_risk")}
                    </span>
                    <span className="text-lg font-extrabold text-white">{activeRisksCount}</span>
                  </div>
                  <div className="flex-1 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-center text-red-400">
                    <span className="block text-[9px] font-bold tracking-wider uppercase">
                      {t("y_ksek_risk")}
                    </span>
                    <span className="text-lg font-extrabold">{highRisksCount}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/admin/strategy/risks"
                className="text-brand-400 hover:text-brand-300 mt-6 flex items-center gap-1 text-xs font-bold transition"
              >
                {t("manage_risks")}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* DEĞERLEME MODELİ CARD */}
            <div className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/30 flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-2 text-amber-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-fg-muted font-mono text-[9px] font-bold tracking-wider uppercase">
                    {t("module_03")}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{t("company_valuation")}</h2>
                <p className="text-fg-muted mt-2 text-xs">
                  {t("simulate_valuation_cap_metrics_across_be")}
                </p>
                <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-2 text-center">
                  <span className="text-fg-muted block text-[9px] font-bold tracking-wider uppercase">
                    {t("last_calculated_valuation")}
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {valuations.length > 0
                      ? formatCurrency(valuations[0]!.result_pre_money * 100)
                      : formatCurrency(DEFAULT_VALUATION_PRE_MONEY * 100)}
                  </span>
                </div>
              </div>
              <Link
                href="/admin/strategy/valuation"
                className="text-brand-400 hover:text-brand-300 mt-6 flex items-center gap-1 text-xs font-bold transition"
              >
                {t("calculate_valuation")}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* OKR MILESTONES CARD */}
            <div className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/30 flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 p-2 text-blue-400">
                    <Compass className="h-5 w-5" />
                  </div>
                  <span className="text-fg-muted font-mono text-[9px] font-bold tracking-wider uppercase">
                    {t("module_04")}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{t("strategic_roadmap")}</h2>
                <p className="text-fg-muted mt-2 text-xs">
                  {t("map_quarterly_okrs_and_milestone_complet")}
                </p>
                <div className="mt-4">
                  <div className="text-fg-muted mb-1 flex justify-between text-[10px] font-bold tracking-wider uppercase">
                    <span>{t("roadmap_progress")}</span>
                    <span>{avgOkrProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${avgOkrProgress}%` }}
                    />
                  </div>
                  <span className="text-fg-muted mt-1.5 block text-[10px]">
                    {t("donemilestones_of_totalmilestones_milest", {
                      doneMilestones,
                      totalMilestones,
                    })}
                  </span>
                </div>
              </div>
              <Link
                href="/admin/strategy/roadmap"
                className="text-brand-400 hover:text-brand-300 mt-6 flex items-center gap-1 text-xs font-bold transition"
              >
                {t("manage_milestones")}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* STRATEJİK DEĞERLENDİRME CARD */}
            <div className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/30 flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2 text-emerald-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <span className="text-fg-muted font-mono text-[9px] font-bold tracking-wider uppercase">
                    {t("module_05")}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  {t("strategy_questionnaire") || "Strategic Questionnaire"}
                </h2>
                <p className="text-fg-muted mt-2 text-xs">
                  {t("strategy_questionnaire_desc") ||
                    "Compare model evaluations, latencies, and costs on platform strategy."}
                </p>
                <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-2 text-center text-xs">
                  <span className="text-fg-muted block text-[9px] font-bold tracking-wider uppercase">
                    {t("question_pool") || "Soru Havuzu"}
                  </span>
                  <span className="text-lg font-extrabold text-white">
                    {QUESTIONS.length} {t("active_questions") || "Aktif Soru"}
                  </span>
                </div>
              </div>
              <Link
                href="/admin/strategy/questionnaire"
                className="text-brand-400 hover:text-brand-300 mt-6 flex items-center gap-1 text-xs font-bold transition"
              >
                {t("run_questionnaire") || "Run Evaluation"}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
        {/* Live AI Strategy Analysis */}
        <div className="mt-8">
          <LiveStrategyClient
            context={{
              strengths: strengthsCount,
              weaknesses: weaknessesCount,
              opportunities: opportunitiesCount,
              threats: threatsCount,
              highRisks: highRisksCount,
              activeRisks: activeRisksCount,
              doneMilestones,
              totalMilestones,
            }}
          />
        </div>
      </Container>
    </div>
  );
}
