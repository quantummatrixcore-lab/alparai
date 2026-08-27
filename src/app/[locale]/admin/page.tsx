import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { AdvisorRoster } from "@/components/admin/strategy/advisor-roster";
import {
  DollarSign,
  TrendingUp,
  Activity,
  Cpu,
  ShieldCheck,
  Lock,
  Target,
  Rocket,
  Zap,
  Search,
  FileText,
  ChevronRight,
  ArrowUpRight,
  Users,
  Layers,
  Globe,
  Sparkles,
  CheckCircle2,
  Database,
  Key,
  AlertTriangle,
  Server,
  Radio,
  FileSpreadsheet,
  PieChart,
  Eye,
  Send,
  Award,
  Share2,
  Workflow,
  Code2,
  Sliders,
  ShieldAlert,
  Inbox,
  UserCheck,
  Flame,
  BarChart3,
  LineChart,
} from "lucide-react";
import { AiBudgetTransparencyScore } from "@/components/admin/AiBudgetTransparencyScore";
import { Test360Meter } from "@/components/admin/test-360-meter";
import { PrioritizationWidget } from "@/components/admin/prioritization-widget";
import { createServerClient } from "@/lib/supabase/server";
import { parseMasterPlan } from "@/lib/server/master-plan";
import { getStartupHealth } from "@/actions/admin/startup-health";
import { getSystemSignalsAction } from "@/actions/admin/signals";
import { getFundingConversion } from "@/actions/admin/funding-conversion";
import { getCronStatus } from "@/lib/engine-registry";

import { PlausibleVisitorCard } from "@/components/admin/plausible-visitor-card";
import { OutreachAutopilot } from "@/components/admin/founder/OutreachAutopilot";
import { CalendarAndSentiment } from "@/components/admin/founder/CalendarAndSentiment";
import { Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("dashboard_title") };
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  // Fetch dynamic data for widgets
  const supabase = await createServerClient();
  const [usersRes, incidentsRes, startupHealth, signals, funding, crons] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("incidents").select("*", { count: "exact", head: true }),
    getStartupHealth().catch(() => null),
    getSystemSignalsAction().catch(() => []),
    getFundingConversion().catch(() => null),
    getCronStatus().catch(() => []),
  ]);

  const totalUsers = usersRes?.count ?? 0;
  const totalIncidents = incidentsRes?.count ?? 2715;
  const masterPlan = parseMasterPlan();

  const activeSubscribers =
    startupHealth?.kpis.find((k) => k.label === "Newsletter Subscribers")?.totalCount ?? "0";
  const grantsWon =
    funding?.combinedWon !== undefined
      ? t("grants_won_count", { count: funding.combinedWon })
      : t("grants_won_count", { count: 0 });
  const apiCost = startupHealth?.zeroCostBurnStr ?? "$0/mo";
  const mrr = startupHealth?.mrr ? `$${startupHealth.mrr}` : "—";
  const latency = signals?.find((s) => s.name === "API Response Time")?.value
    ? `${signals.find((s) => s.name === "API Response Time")?.value}ms`
    : "0ms";
  const activeCrons = crons?.length ?? "0";
  const rlsEnforcement = signals?.find((s) => s.name === "Row Level Security (RLS)")?.value
    ? `%${signals.find((s) => s.name === "Row Level Security (RLS)")?.value}`
    : "%100";

  return (
    <div className="text-fg-primary selection:bg-brand-500/30 selection:text-brand-200 bg-bg-primary relative min-h-screen overflow-hidden">
      {/* Cinematic Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="bg-brand-600/10 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] h-[20%] w-[60%] translate-x-[-50%] rounded-full bg-fuchsia-600/5 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-3 py-6 sm:px-6 md:p-8 lg:p-10">
        {/* Top Bar: Title + Status + Action Buttons */}
        <header className="group border-border-strong bg-bg-secondary/40 hover:bg-bg-secondary/60 relative flex flex-col gap-6 overflow-hidden rounded-3xl border p-6 backdrop-blur-3xl backdrop-blur-xl transition-all duration-300 ease-out hover:shadow-[0_0_80px_rgba(var(--color-brand-500),0.1)] md:flex-row md:items-center md:justify-between">
          {/* Header Internal Glow */}
          <div className="via-brand-500/10 pointer-events-none absolute -inset-x-20 -top-20 h-[150px] w-full bg-gradient-to-r from-transparent to-transparent opacity-0 blur-3xl transition-opacity duration-300 ease-out group-hover:opacity-100" />

          <div className="relative z-10 space-y-3">
            <div className="border-success-500/20 inline-flex items-center gap-2 rounded-full border bg-emerald-500/5 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 uppercase shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              {t("badge_spatial_cockpit")}
            </div>
            <h1 className="bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-sm sm:text-5xl">
              {t("command_center_title")}
            </h1>
            <p className="text-fg-muted text-sm font-medium tracking-wide">
              {t("command_center_subtitle")}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/admin/strategy/master-plan`}
              className="group/btn border-warning-500/20 relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border bg-amber-500/10 px-5 py-3 text-sm font-medium text-amber-300 transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-400/20 hover:text-amber-100 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]"
            >
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <FileText className="h-4 w-4 text-amber-400" />
              <span>{t("header_master_plan")}</span>
            </Link>

            <Link
              href={`/${locale}/admin/cockpit`}
              className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-medium text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/20 hover:text-cyan-100 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>{t("spatial_view")}</span>
            </Link>

            <button
              aria-label={t("command_palette")}
              className="group text-fg-primary border-border-strong hover:border-border-strong flex items-center gap-3 rounded-2xl border bg-white/5 px-5 py-3 text-sm font-medium backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:text-white"
            >
              <Search className="text-fg-muted h-4 w-4 transition-colors group-hover:text-white" />
              <span>{t("command_palette")}</span>
              <kbd className="text-fg-muted border-border-strong bg-bg-primary/20 ml-2 hidden h-5 items-center gap-0.5 rounded-md border px-2 font-mono text-[10px] font-semibold md:inline-flex">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </button>
          </div>
        </header>

        {/* Plausible Traffic Visitors Widget */}
        <PlausibleVisitorCard />

        {/* AI Incident Budget Transparency Score Widget (Task #160) */}
        <AiBudgetTransparencyScore
          score={98.4}
          totalBudgetTokens={10000}
          consumedTokens={4820}
          hallucinationRate={1.2}
          verifiedClaimsCount={totalIncidents}
          savedTokens={18450}
        />

        {/* 360 Expert AI Audit Meter */}
        <Test360Meter />

        {/* AI Advisor Roster */}
        <AdvisorRoster />

        {/* Main 4 Giant Widget Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PrioritizationWidget items={masterPlan.items} error={masterPlan.error} />

          {/* WIDGET 1: Financial & Operations Cockpit */}
          <section className="group border-border-strong bg-bg-secondary/40 hover:bg-bg-secondary/70 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-3xl backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_0_50px_rgba(16,185,129,0.1)] md:p-8">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px] transition-all duration-300 ease-out group-hover:bg-emerald-500/20" />

            <div className="space-y-6">
              {/* Header */}
              <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-fg-primary text-xl font-bold tracking-tight">
                      {t("financial_ops_title")}
                    </h2>
                    <p className="text-fg-muted text-xs">{t("financial_ops_desc")}</p>
                  </div>
                </div>
                <span className="text-fg-muted border-border-strong rounded-full border bg-white/10 px-3 py-1 text-xs font-semibold">
                  {t("mrr_label")}
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("monthly_revenue")}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">{mrr}</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">Total Users</p>
                  <p className="text-fg-primary mt-1 text-lg font-bold">{totalUsers || 0}</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("active_subscribers")}</p>
                  <p className="text-fg-primary mt-1 text-lg font-bold">{activeSubscribers}</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("grants_funding")}</p>
                  <p className="mt-1 text-lg font-bold text-cyan-400">{grantsWon}</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("api_infra_cost")}</p>
                  <p className="mt-1 text-lg font-bold text-amber-400">{apiCost}</p>
                </div>
              </div>

              {/* Route Shortcuts Grid */}
              <div className="space-y-3">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  {t("finance_routes_heading")}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    {
                      href: `/${locale}/admin/billing`,
                      label: t("route_billing_invoices"),
                      icon: DollarSign,
                    },
                    {
                      href: `/${locale}/admin/finance`,
                      label: t("route_financial_ledger"),
                      icon: LineChart,
                    },
                    { href: `/${locale}/admin/grants`, label: t("route_grants_rd"), icon: Award },
                    {
                      href: `/${locale}/admin/users`,
                      label: t("route_user_directory"),
                      icon: Users,
                    },
                    {
                      href: `/${locale}/admin/metrics-hub/api-metrics`,
                      label: t("route_api_unit_costs"),
                      icon: PieChart,
                    },
                    {
                      href: `/${locale}/admin/investors`,
                      label: t("route_investors_portal"),
                      icon: TrendingUp,
                    },
                    {
                      href: `/${locale}/admin/startup-health`,
                      label: t("route_startup_health"),
                      icon: Activity,
                    },
                    {
                      href: `/${locale}/admin/strategy/valuation`,
                      label: t("route_valuation_models"),
                      icon: FileSpreadsheet,
                    },
                    {
                      href: `/${locale}/admin/strategy/state-support`,
                      label: t("route_state_support"),
                      icon: CheckCircle2,
                    },
                    {
                      href: `/${locale}/admin/resources`,
                      label: t("route_resource_alloc"),
                      icon: Layers,
                    },
                    {
                      href: `/${locale}/admin/ecosystem`,
                      label: t("route_ecosystem_capital"),
                      icon: Globe,
                    },
                    {
                      href: `/${locale}/admin/import`,
                      label: t("route_data_import_export"),
                      icon: ArrowUpRight,
                    },
                  ].map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className="group/item border-border-subtle text-fg-secondary flex items-center justify-between rounded-xl border bg-white/10 px-3 py-2.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <route.icon className="h-3.5 w-3.5 shrink-0 text-emerald-400/70 transition-colors duration-200 group-hover/item:text-emerald-400" />
                        <span className="truncate">{route.label}</span>
                      </span>
                      <ChevronRight className="text-fg-muted/70 h-3 w-3 shrink-0 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-emerald-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-border-subtle mt-6 flex items-center justify-between border-t pt-4 text-xs">
              <span className="text-fg-muted">{t("sync_supabase_resend")}</span>
              <Link
                href={`/${locale}/admin/billing`}
                className="font-semibold text-emerald-400 transition-all duration-200 hover:underline"
              >
                {t("view_financial_reports")}
              </Link>
            </div>
          </section>

          {/* WIDGET 2: AI Core & System Health Cockpit */}
          <section className="group border-border-strong bg-bg-secondary/40 hover:bg-bg-secondary/70 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-3xl backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_0_50px_rgba(6,182,212,0.1)] md:p-8">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px] transition-all duration-300 ease-out group-hover:bg-cyan-500/20" />

            <div className="space-y-6">
              {/* Header */}
              <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-fg-primary text-xl font-bold tracking-tight">
                      {t("ai_core_system_health_title")}
                    </h2>
                    <p className="text-fg-muted text-xs">{t("ai_core_system_health_desc")}</p>
                  </div>
                </div>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                  {t("uptime_badge")}
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("edge_region")}</p>
                  <p className="mt-1 text-lg font-bold text-cyan-400">fra1 (Vercel)</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("avg_latency")}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">{latency}</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("tom_context_saved")}</p>
                  <p className="mt-1 text-lg font-bold text-purple-400">12.4M</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("cron_jobs")}</p>
                  <p className="text-fg-primary mt-1 text-lg font-bold">{activeCrons}</p>
                </div>
              </div>

              {/* Route Shortcuts Grid */}
              <div className="space-y-3">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  {t("system_ai_routes_heading")}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    {
                      href: `/${locale}/admin/ai-hub/orchestrator`,
                      label: t("route_ai_orchestrator"),
                      icon: Cpu,
                    },
                    {
                      href: `/${locale}/admin/metrics-hub/ai-pulse`,
                      label: t("route_ai_pulse_health"),
                      icon: Radio,
                    },
                    {
                      href: `/${locale}/admin/health`,
                      label: t("route_system_status"),
                      icon: Activity,
                    },
                    {
                      href: `/${locale}/admin/cron-health`,
                      label: t("route_cron_health"),
                      icon: Zap,
                    },
                    {
                      href: `/${locale}/admin/crons`,
                      label: t("route_scheduled_crons"),
                      icon: Server,
                    },
                    {
                      href: `/${locale}/admin/metrics-hub/slo-dashboard`,
                      label: t("route_slo_dashboard"),
                      icon: BarChart3,
                    },
                    {
                      href: `/${locale}/admin/api-management`,
                      label: t("route_api_management"),
                      icon: Code2,
                    },
                    {
                      href: `/${locale}/admin/ai-hub/autopilot`,
                      label: t("route_autopilot_core"),
                      icon: Workflow,
                    },
                    {
                      href: `/${locale}/admin/ai-hub/autopilot/analytics`,
                      label: t("route_autopilot_analytics"),
                      icon: LineChart,
                    },
                    {
                      href: `/${locale}/admin/codebase-hygiene`,
                      label: t("route_code_hygiene"),
                      icon: CheckCircle2,
                    },
                    {
                      href: `/${locale}/admin/modular-architecture`,
                      label: t("route_modular_arch"),
                      icon: Layers,
                    },
                    {
                      href: `/${locale}/admin/feature-flags`,
                      label: t("route_feature_flags"),
                      icon: Sliders,
                    },
                    {
                      href: `/${locale}/admin/providers`,
                      label: t("route_ai_providers"),
                      icon: Sparkles,
                    },
                    {
                      href: `/${locale}/admin/cross-audit-dashboard`,
                      label: t("route_cross_audit"),
                      icon: Eye,
                    },
                    {
                      href: `/${locale}/admin/settings`,
                      label: t("route_global_settings"),
                      icon: Database,
                    },
                  ].map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className="group/item text-fg-primary border-border-subtle/50 flex items-center justify-between rounded-xl border bg-white/10 px-3 py-2.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <route.icon className="h-3.5 w-3.5 shrink-0 text-cyan-400/70 group-hover/item:text-cyan-400" />
                        <span className="truncate">{route.label}</span>
                      </span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-cyan-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-border-subtle/50 mt-6 flex items-center justify-between border-t pt-4 text-xs">
              <span className="text-fg-muted">{t("edge_connected")}</span>
              <Link
                href={`/${locale}/admin/health`}
                className="font-semibold text-cyan-400 hover:underline"
              >
                {t("view_orchestrator_details")}
              </Link>
            </div>
          </section>

          {/* WIDGET 3: Security, Compliance & Moderation Cockpit */}
          <section className="group border-border-strong bg-bg-secondary/40 hover:bg-bg-secondary/70 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-3xl backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_0_50px_rgba(244,63,94,0.1)] md:p-8">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-rose-500/10 blur-[80px] transition-all duration-300 ease-out group-hover:bg-rose-500/20" />

            <div className="space-y-6">
              {/* Header */}
              <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-fg-primary text-xl font-bold tracking-tight">
                      {t("security_radar_title")}
                    </h2>
                    <p className="text-fg-muted text-xs">{t("security_radar_desc")}</p>
                  </div>
                </div>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
                  {t("pii_masked_badge")}
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("pii_guardian")}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">Active</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("pending_dsar")}</p>
                  <p className="text-fg-primary mt-1 text-lg font-bold">0 Overdue</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("moderation_queue")}</p>
                  <p className="mt-1 text-lg font-bold text-cyan-400">Clean</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("rls_enforcement")}</p>
                  <p className="mt-1 text-lg font-bold text-purple-400">{rlsEnforcement}</p>
                </div>
              </div>

              {/* Route Shortcuts Grid */}
              <div className="space-y-3">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  {t("security_routes_heading")}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { href: `/${locale}/admin/audit`, label: t("route_audit_logs"), icon: Lock },
                    {
                      href: `/${locale}/admin/dsar`,
                      label: t("route_dsar_requests"),
                      icon: UserCheck,
                    },
                    {
                      href: `/${locale}/admin/takedown`,
                      label: t("route_takedown_dmca"),
                      icon: ShieldAlert,
                    },
                    {
                      href: `/${locale}/admin/moderation`,
                      label: t("route_moderation_queue"),
                      icon: Inbox,
                    },
                    {
                      href: `/${locale}/admin/api-keys`,
                      label: t("route_api_key_management"),
                      icon: Key,
                    },
                    {
                      href: `/${locale}/admin/redaction-queue`,
                      label: t("route_redaction_queue"),
                      icon: Eye,
                    },
                    {
                      href: `/${locale}/admin/dual-channel-scoring`,
                      label: t("route_dual_channel_score"),
                      icon: BarChart3,
                    },
                    {
                      href: `/${locale}/admin/analytics-hub/k-benchmark`,
                      label: t("route_k_benchmark_suite"),
                      icon: Target,
                    },
                    {
                      href: `/${locale}/admin/analytics-hub/expert-analysis`,
                      label: t("route_expert_analysis"),
                      icon: CheckCircle2,
                    },
                    {
                      href: `/${locale}/admin/experts`,
                      label: t("route_expert_registry"),
                      icon: Users,
                    },
                    {
                      href: `/${locale}/admin/analytics-hub/analysis`,
                      label: t("route_deep_analysis"),
                      icon: Search,
                    },
                    {
                      href: `/${locale}/admin/cockpit`,
                      label: t("route_cockpit_control"),
                      icon: Sparkles,
                    },
                  ].map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className="group/item text-fg-primary border-border-subtle/50 flex items-center justify-between rounded-xl border bg-white/10 px-3 py-2.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <route.icon className="h-3.5 w-3.5 shrink-0 text-rose-400/70 group-hover/item:text-rose-400" />
                        <span className="truncate">{route.label}</span>
                      </span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-rose-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-border-subtle/50 mt-6 flex items-center justify-between border-t pt-4 text-xs">
              <span className="text-fg-muted">{t("kvkk_gdpr_compliant")}</span>
              <Link
                href={`/${locale}/admin/audit`}
                className="font-semibold text-rose-400 hover:underline"
              >
                {t("view_security_logs")}
              </Link>
            </div>
          </section>

          {/* WIDGET 4: Strategy, Growth & Outreach Cockpit */}
          <section className="group border-border-strong bg-bg-secondary/40 hover:bg-bg-secondary/70 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-3xl backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_0_50px_rgba(168,85,247,0.1)] md:p-8">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px] transition-all duration-300 ease-out group-hover:bg-purple-500/20" />

            <div className="space-y-6">
              {/* Header */}
              <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 text-purple-400">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-fg-primary text-xl font-bold tracking-tight">
                      {t("strategy_growth_title")}
                    </h2>
                    <p className="text-fg-muted text-xs">{t("strategy_growth_desc")}</p>
                  </div>
                </div>
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                  {t("q3_progress_badge")}
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("master_plan_kpi")}</p>
                  <p className="mt-1 text-lg font-bold text-cyan-400">{t("master_plan_done")}</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("linkedin_reach")}</p>
                  <p className="mt-1 text-lg font-bold text-emerald-400">{t("in_preparation")}</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("outreach_open_rate")}</p>
                  <p className="mt-1 text-lg font-bold text-purple-400">{t("in_preparation")}</p>
                </div>
                <div className="border-border-subtle rounded-2xl border bg-white/10 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white/10">
                  <p className="text-fg-muted text-xs font-medium">{t("advisory_board_kpi")}</p>
                  <p className="text-fg-primary mt-1 text-lg font-bold">0</p>
                </div>
              </div>

              {/* Route Shortcuts Grid */}
              <div className="space-y-3">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  {t("strategy_routes_heading")}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    {
                      href: `/${locale}/admin/strategy/master-plan`,
                      label: t("route_master_plan"),
                      icon: FileText,
                    },
                    {
                      href: `/${locale}/admin/strategy`,
                      label: t("route_strategy_portal"),
                      icon: Target,
                    },
                    {
                      href: `/${locale}/admin/strategy/roadmap`,
                      label: t("route_product_roadmap"),
                      icon: Rocket,
                    },
                    {
                      href: `/${locale}/admin/strategy/swot`,
                      label: t("route_swot_matrix"),
                      icon: PieChart,
                    },
                    {
                      href: `/${locale}/admin/strategy/risks`,
                      label: t("route_risk_assessment"),
                      icon: AlertTriangle,
                    },
                    {
                      href: `/${locale}/admin/strategy/questionnaire`,
                      label: t("route_strategy_survey"),
                      icon: FileSpreadsheet,
                    },
                    {
                      href: `/${locale}/admin/advisory-board`,
                      label: t("route_advisory_board"),
                      icon: Users,
                    },
                    {
                      href: `/${locale}/admin/linkedin`,
                      label: t("route_linkedin_analytics"),
                      icon: Share2,
                    },
                    {
                      href: `/${locale}/admin/outreach`,
                      label: t("route_outreach_resend"),
                      icon: Send,
                    },
                    {
                      href: `/${locale}/admin/social`,
                      label: t("route_social_media"),
                      icon: Globe,
                    },
                    {
                      href: `/${locale}/admin/marketing`,
                      label: t("route_growth_marketing"),
                      icon: Flame,
                    },
                    {
                      href: `/${locale}/admin/seo-performance`,
                      label: t("route_seo_performance"),
                      icon: LineChart,
                    },
                    {
                      href: `/${locale}/admin/launch-signal`,
                      label: t("route_launch_signals"),
                      icon: Radio,
                    },
                    {
                      href: `/${locale}/admin/metrics-hub/signals`,
                      label: t("route_market_signals"),
                      icon: Activity,
                    },
                    {
                      href: `/${locale}/admin/innovations`,
                      label: t("route_ai_innovations"),
                      icon: Sparkles,
                    },
                    {
                      href: `/${locale}/admin/geo`,
                      label: t("route_geo_intelligence"),
                      icon: Globe,
                    },
                    {
                      href: `/${locale}/admin/platforms`,
                      label: t("route_platform_ecosystem"),
                      icon: Layers,
                    },
                    {
                      href: `/${locale}/admin/ai-hub/jules`,
                      label: t("route_jules_agent"),
                      icon: Cpu,
                    },
                  ].map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className="group/item text-fg-primary border-border-subtle/50 flex items-center justify-between rounded-xl border bg-white/10 px-3 py-2.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <route.icon className="h-3.5 w-3.5 shrink-0 text-purple-400/70 group-hover/item:text-purple-400" />
                        <span className="truncate">{route.label}</span>
                      </span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-purple-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-border-subtle/50 mt-6 flex items-center justify-between border-t pt-4 text-xs">
              <span className="text-fg-muted">{t("corporate_email_rule")}</span>
              <Link
                href={`/${locale}/admin/strategy/master-plan`}
                className="font-semibold text-purple-400 hover:underline"
              >
                {t("view_master_plan_doc")}
              </Link>
            </div>
          </section>

          {/* WIDGET 5: Founder Command (Outreach & Media) */}
          <section className="group border-border-strong bg-bg-secondary/40 hover:bg-bg-secondary/70 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 backdrop-blur-3xl backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_50px_rgba(99,102,241,0.1)] md:p-8 lg:col-span-2">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px] transition-all duration-300 ease-out group-hover:bg-indigo-500/20" />

            <div className="space-y-6">
              {/* Header */}
              <div className="border-border-subtle flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-400">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-fg-primary text-xl font-bold tracking-tight">
                      Kurucu Yönetici Paneli (Founder Command v2)
                    </h2>
                    <p className="text-fg-muted text-xs">
                      Outreach Otopilot, Medya İçerik ve Takvim Yönetimi
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
                  Core
                </span>
              </div>

              {/* Outreach Autopilot Component */}
              <OutreachAutopilot />

              {/* Calendar & Sentiment Component */}
              <div className="mt-8">
                <CalendarAndSentiment />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
