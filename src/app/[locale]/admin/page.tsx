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
    <div className="text-fg-primary selection:bg-brand-500/30 selection:text-brand-200 relative min-h-screen overflow-x-hidden bg-[#030303]">
      {/* 2026 Cinematic Deep Space Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[60%] w-[50%] rounded-[100%] bg-indigo-600/10 blur-[160px]" />
        <div className="absolute right-[-20%] bottom-[-10%] h-[60%] w-[50%] rounded-[100%] bg-fuchsia-600/10 blur-[160px]" />
        <div className="absolute top-[30%] left-[50%] h-[30%] w-[80%] -translate-x-1/2 rounded-[100%] bg-brand-600/5 blur-[180px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 md:p-8 lg:p-10 lg:space-y-8">
        {/* Top Bar: Glassmorphic Command Center Header */}
        <header className="group relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 ease-out hover:border-white/20 hover:bg-white/[0.04] md:flex-row md:items-center md:justify-between lg:p-8">
          <div className="pointer-events-none absolute -inset-x-20 -top-20 h-[150px] w-[200%] bg-gradient-to-r from-transparent via-brand-500/10 to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-emerald-400 uppercase shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
              {t("badge_spatial_cockpit")}
            </div>
            <h1 className="bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-3xl font-black tracking-tight text-transparent drop-shadow-sm sm:text-4xl lg:text-5xl">
              {t("command_center_title")}
            </h1>
            <p className="text-sm font-medium tracking-wide text-zinc-400/80">
              {t("command_center_subtitle")}
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/${locale}/admin/strategy/master-plan`}
              className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3.5 text-sm font-semibold text-amber-300 transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/20 hover:shadow-[0_0_30px_rgba(251,191,36,0.2)]"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-400/10 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <FileText className="h-4 w-4 text-amber-400" />
              <span>{t("header_master_plan")}</span>
            </Link>

            <Link
              href={`/${locale}/admin/cockpit`}
              className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3.5 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-500/40 hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>{t("spatial_view")}</span>
            </Link>

            <button
              aria-label={t("command_palette")}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-zinc-300 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Search className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" />
              <span>{t("command_palette")}</span>
              <kbd className="hidden h-5 items-center gap-0.5 rounded-md border border-white/10 bg-black/30 px-2 font-mono text-[10px] font-bold text-zinc-500 md:inline-flex">
                <span>⌘</span><span>K</span>
              </kbd>
            </button>
          </div>
        </header>

        {/* BENTO GRID LEVEL 1: High Level Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:gap-8">
          <div className="md:col-span-12 lg:col-span-4 h-full">
            <PlausibleVisitorCard />
          </div>
          <div className="md:col-span-6 lg:col-span-4 h-full">
            <AiBudgetTransparencyScore
              score={98.4}
              totalBudgetTokens={10000}
              consumedTokens={4820}
              hallucinationRate={1.2}
              verifiedClaimsCount={totalIncidents}
              savedTokens={18450}
            />
          </div>
          <div className="md:col-span-6 lg:col-span-4 h-full">
            <Test360Meter />
          </div>
        </div>

        {/* BENTO GRID LEVEL 2: Intelligence & Priority */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:gap-8">
          <div className="md:col-span-12 lg:col-span-4 h-full">
            <AdvisorRoster />
          </div>
          <div className="md:col-span-12 lg:col-span-8 h-full">
            <PrioritizationWidget items={masterPlan.items} error={masterPlan.error} />
          </div>
        </div>

        {/* BENTO GRID LEVEL 3: Deep Domain Cockpits */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 lg:gap-8">
          
          {/* WIDGET 1: Financial & Operations */}
          <section className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 ease-out hover:border-emerald-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_60px_rgba(16,185,129,0.15)] md:col-span-12 lg:col-span-6 lg:p-8">
            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-emerald-500/20 blur-[120px] transition-all duration-700 group-hover:bg-emerald-500/30" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">{t("financial_ops_title")}</h2>
                    <p className="text-xs font-medium text-zinc-400">{t("financial_ops_desc")}</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs font-bold text-zinc-300">
                  {t("mrr_label")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {[
                  { label: t("monthly_revenue"), value: mrr, color: "text-emerald-400" },
                  { label: "Total Users", value: totalUsers || 0, color: "text-white" },
                  { label: t("active_subscribers"), value: activeSubscribers, color: "text-white" },
                  { label: t("grants_funding"), value: grantsWon, color: "text-cyan-400" },
                  { label: t("api_infra_cost"), value: apiCost, color: "text-amber-400" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col justify-center rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md transition-colors hover:bg-black/40">
                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">{stat.label}</p>
                    <p className={`mt-1.5 text-lg font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{t("finance_routes_heading")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { href: `/${locale}/admin/billing`, label: t("route_billing_invoices"), icon: DollarSign },
                    { href: `/${locale}/admin/finance`, label: t("route_financial_ledger"), icon: LineChart },
                    { href: `/${locale}/admin/grants`, label: t("route_grants_rd"), icon: Award },
                    { href: `/${locale}/admin/users`, label: t("route_user_directory"), icon: Users },
                    { href: `/${locale}/admin/metrics-hub/api-metrics`, label: t("route_api_unit_costs"), icon: PieChart },
                    { href: `/${locale}/admin/investors`, label: t("route_investors_portal"), icon: TrendingUp },
                    { href: `/${locale}/admin/startup-health`, label: t("route_startup_health"), icon: Activity },
                    { href: `/${locale}/admin/strategy/valuation`, label: t("route_valuation_models"), icon: FileSpreadsheet },
                    { href: `/${locale}/admin/strategy/state-support`, label: t("route_state_support"), icon: CheckCircle2 },
                    { href: `/${locale}/admin/resources`, label: t("route_resource_alloc"), icon: Layers },
                    { href: `/${locale}/admin/ecosystem`, label: t("route_ecosystem_capital"), icon: Globe },
                    { href: `/${locale}/admin/import`, label: t("route_data_import_export"), icon: ArrowUpRight },
                  ].map((route) => (
                    <Link key={route.href} href={route.href} className="group/item flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3.5 py-3 text-xs font-semibold text-zinc-300 transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300">
                      <span className="flex items-center gap-2.5 truncate">
                        <route.icon className="h-4 w-4 shrink-0 text-emerald-400/50 transition-colors group-hover/item:text-emerald-400" />
                        <span className="truncate">{route.label}</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform group-hover/item:translate-x-1 group-hover/item:text-emerald-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs font-medium">
              <span className="text-zinc-500">{t("sync_supabase_resend")}</span>
              <Link href={`/${locale}/admin/billing`} className="text-emerald-400 transition-colors hover:text-emerald-300 hover:underline underline-offset-4">
                {t("view_financial_reports")}
              </Link>
            </div>
          </section>

          {/* WIDGET 2: AI Core & System Health */}
          <section className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 ease-out hover:border-cyan-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_60px_rgba(6,182,212,0.15)] md:col-span-12 lg:col-span-6 lg:p-8">
            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-500/20 blur-[120px] transition-all duration-700 group-hover:bg-cyan-500/30" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">{t("ai_core_system_health_title")}</h2>
                    <p className="text-xs font-medium text-zinc-400">{t("ai_core_system_health_desc")}</p>
                  </div>
                </div>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-bold text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  {t("uptime_badge")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: t("edge_region"), value: "fra1 (Vercel)", color: "text-cyan-400" },
                  { label: t("avg_latency"), value: latency, color: "text-emerald-400" },
                  { label: t("tom_context_saved"), value: "12.4M", color: "text-purple-400" },
                  { label: t("cron_jobs"), value: activeCrons, color: "text-white" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col justify-center rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md transition-colors hover:bg-black/40">
                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">{stat.label}</p>
                    <p className={`mt-1.5 text-lg font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{t("system_ai_routes_heading")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { href: `/${locale}/admin/ai-hub/orchestrator`, label: t("route_ai_orchestrator"), icon: Cpu },
                    { href: `/${locale}/admin/metrics-hub/ai-pulse`, label: t("route_ai_pulse_health"), icon: Radio },
                    { href: `/${locale}/admin/health`, label: t("route_system_status"), icon: Activity },
                    { href: `/${locale}/admin/cron-health`, label: t("route_cron_health"), icon: Zap },
                    { href: `/${locale}/admin/crons`, label: t("route_scheduled_crons"), icon: Server },
                    { href: `/${locale}/admin/metrics-hub/slo-dashboard`, label: t("route_slo_dashboard"), icon: BarChart3 },
                    { href: `/${locale}/admin/api-management`, label: t("route_api_management"), icon: Code2 },
                    { href: `/${locale}/admin/ai-hub/autopilot`, label: t("route_autopilot_core"), icon: Workflow },
                    { href: `/${locale}/admin/ai-hub/autopilot/analytics`, label: t("route_autopilot_analytics"), icon: LineChart },
                    { href: `/${locale}/admin/codebase-hygiene`, label: t("route_code_hygiene"), icon: CheckCircle2 },
                    { href: `/${locale}/admin/modular-architecture`, label: t("route_modular_arch"), icon: Layers },
                    { href: `/${locale}/admin/feature-flags`, label: t("route_feature_flags"), icon: Sliders },
                    { href: `/${locale}/admin/providers`, label: t("route_ai_providers"), icon: Sparkles },
                    { href: `/${locale}/admin/cross-audit-dashboard`, label: t("route_cross_audit"), icon: Eye },
                    { href: `/${locale}/admin/settings`, label: t("route_global_settings"), icon: Database },
                  ].map((route) => (
                    <Link key={route.href} href={route.href} className="group/item flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3.5 py-3 text-xs font-semibold text-zinc-300 transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300">
                      <span className="flex items-center gap-2.5 truncate">
                        <route.icon className="h-4 w-4 shrink-0 text-cyan-400/50 transition-colors group-hover/item:text-cyan-400" />
                        <span className="truncate">{route.label}</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform group-hover/item:translate-x-1 group-hover/item:text-cyan-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs font-medium">
              <span className="text-zinc-500">{t("edge_connected")}</span>
              <Link href={`/${locale}/admin/health`} className="text-cyan-400 transition-colors hover:text-cyan-300 hover:underline underline-offset-4">
                {t("view_orchestrator_details")}
              </Link>
            </div>
          </section>

          {/* WIDGET 3: Security, Compliance & Moderation */}
          <section className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 ease-out hover:border-rose-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_60px_rgba(244,63,94,0.15)] md:col-span-12 lg:col-span-6 lg:p-8">
            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-rose-500/20 blur-[120px] transition-all duration-700 group-hover:bg-rose-500/30" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">{t("security_radar_title")}</h2>
                    <p className="text-xs font-medium text-zinc-400">{t("security_radar_desc")}</p>
                  </div>
                </div>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                  {t("pii_masked_badge")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: t("pii_guardian"), value: "Active", color: "text-emerald-400" },
                  { label: t("pending_dsar"), value: "0 Overdue", color: "text-white" },
                  { label: t("moderation_queue"), value: "Clean", color: "text-cyan-400" },
                  { label: t("rls_enforcement"), value: rlsEnforcement, color: "text-purple-400" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col justify-center rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md transition-colors hover:bg-black/40">
                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">{stat.label}</p>
                    <p className={`mt-1.5 text-lg font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{t("security_routes_heading")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { href: `/${locale}/admin/audit`, label: t("route_audit_logs"), icon: Lock },
                    { href: `/${locale}/admin/dsar`, label: t("route_dsar_requests"), icon: UserCheck },
                    { href: `/${locale}/admin/takedown`, label: t("route_takedown_dmca"), icon: ShieldAlert },
                    { href: `/${locale}/admin/moderation`, label: t("route_moderation_queue"), icon: Inbox },
                    { href: `/${locale}/admin/api-keys`, label: t("route_api_key_management"), icon: Key },
                    { href: `/${locale}/admin/redaction-queue`, label: t("route_redaction_queue"), icon: Eye },
                    { href: `/${locale}/admin/dual-channel-scoring`, label: t("route_dual_channel_score"), icon: BarChart3 },
                    { href: `/${locale}/admin/analytics-hub/k-benchmark`, label: t("route_k_benchmark_suite"), icon: Target },
                    { href: `/${locale}/admin/analytics-hub/expert-analysis`, label: t("route_expert_analysis"), icon: CheckCircle2 },
                    { href: `/${locale}/admin/experts`, label: t("route_expert_registry"), icon: Users },
                    { href: `/${locale}/admin/analytics-hub/analysis`, label: t("route_deep_analysis"), icon: Search },
                    { href: `/${locale}/admin/cockpit`, label: t("route_cockpit_control"), icon: Sparkles },
                  ].map((route) => (
                    <Link key={route.href} href={route.href} className="group/item flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3.5 py-3 text-xs font-semibold text-zinc-300 transition-all duration-300 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300">
                      <span className="flex items-center gap-2.5 truncate">
                        <route.icon className="h-4 w-4 shrink-0 text-rose-400/50 transition-colors group-hover/item:text-rose-400" />
                        <span className="truncate">{route.label}</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform group-hover/item:translate-x-1 group-hover/item:text-rose-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs font-medium">
              <span className="text-zinc-500">{t("kvkk_gdpr_compliant")}</span>
              <Link href={`/${locale}/admin/audit`} className="text-rose-400 transition-colors hover:text-rose-300 hover:underline underline-offset-4">
                {t("view_security_logs")}
              </Link>
            </div>
          </section>

          {/* WIDGET 4: Strategy, Growth & Outreach */}
          <section className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 ease-out hover:border-purple-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_60px_rgba(168,85,247,0.15)] md:col-span-12 lg:col-span-6 lg:p-8">
            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-purple-500/20 blur-[120px] transition-all duration-700 group-hover:bg-purple-500/30" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">{t("strategy_growth_title")}</h2>
                    <p className="text-xs font-medium text-zinc-400">{t("strategy_growth_desc")}</p>
                  </div>
                </div>
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-bold text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  {t("q3_progress_badge")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: t("master_plan_kpi"), value: t("master_plan_done"), color: "text-cyan-400" },
                  { label: t("linkedin_reach"), value: t("in_preparation"), color: "text-emerald-400" },
                  { label: t("outreach_open_rate"), value: t("in_preparation"), color: "text-purple-400" },
                  { label: t("advisory_board_kpi"), value: "0", color: "text-white" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col justify-center rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-md transition-colors hover:bg-black/40">
                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">{stat.label}</p>
                    <p className={`mt-1.5 text-lg font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">{t("strategy_routes_heading")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { href: `/${locale}/admin/strategy/master-plan`, label: t("route_master_plan"), icon: FileText },
                    { href: `/${locale}/admin/strategy`, label: t("route_strategy_portal"), icon: Target },
                    { href: `/${locale}/admin/strategy/roadmap`, label: t("route_product_roadmap"), icon: Rocket },
                    { href: `/${locale}/admin/strategy/swot`, label: t("route_swot_matrix"), icon: PieChart },
                    { href: `/${locale}/admin/strategy/risks`, label: t("route_risk_assessment"), icon: AlertTriangle },
                    { href: `/${locale}/admin/strategy/questionnaire`, label: t("route_strategy_survey"), icon: FileSpreadsheet },
                    { href: `/${locale}/admin/advisory-board`, label: t("route_advisory_board"), icon: Users },
                    { href: `/${locale}/admin/linkedin`, label: t("route_linkedin_analytics"), icon: Share2 },
                    { href: `/${locale}/admin/outreach`, label: t("route_outreach_resend"), icon: Send },
                    { href: `/${locale}/admin/social`, label: t("route_social_media"), icon: Globe },
                    { href: `/${locale}/admin/marketing`, label: t("route_growth_marketing"), icon: Flame },
                    { href: `/${locale}/admin/seo-performance`, label: t("route_seo_performance"), icon: LineChart },
                    { href: `/${locale}/admin/launch-signal`, label: t("route_launch_signals"), icon: Radio },
                    { href: `/${locale}/admin/metrics-hub/signals`, label: t("route_market_signals"), icon: Activity },
                    { href: `/${locale}/admin/innovations`, label: t("route_ai_innovations"), icon: Sparkles },
                    { href: `/${locale}/admin/geo`, label: t("route_geo_intelligence"), icon: Globe },
                    { href: `/${locale}/admin/platforms`, label: t("route_platform_ecosystem"), icon: Layers },
                    { href: `/${locale}/admin/ai-hub/jules`, label: t("route_jules_agent"), icon: Cpu },
                  ].map((route) => (
                    <Link key={route.href} href={route.href} className="group/item flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3.5 py-3 text-xs font-semibold text-zinc-300 transition-all duration-300 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300">
                      <span className="flex items-center gap-2.5 truncate">
                        <route.icon className="h-4 w-4 shrink-0 text-purple-400/50 transition-colors group-hover/item:text-purple-400" />
                        <span className="truncate">{route.label}</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform group-hover/item:translate-x-1 group-hover/item:text-purple-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs font-medium">
              <span className="text-zinc-500">{t("corporate_email_rule")}</span>
              <Link href={`/${locale}/admin/strategy/master-plan`} className="text-purple-400 transition-colors hover:text-purple-300 hover:underline underline-offset-4">
                {t("view_master_plan_doc")}
              </Link>
            </div>
          </section>

          {/* WIDGET 5: Founder Command */}
          <section className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 ease-out hover:border-indigo-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_60px_rgba(99,102,241,0.15)] md:col-span-12 lg:p-8">
            <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-indigo-500/20 blur-[120px] transition-all duration-700 group-hover:bg-indigo-500/30" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">Kurucu Yönetici Paneli (Founder Command v2)</h2>
                    <p className="text-xs font-medium text-zinc-400">Outreach Otopilot, Medya İçerik ve Takvim Yönetimi</p>
                  </div>
                </div>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  Core
                </span>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-white/5 bg-black/20 p-6 backdrop-blur-md">
                  <OutreachAutopilot />
                </div>
                <div className="rounded-[2rem] border border-white/5 bg-black/20 p-6 backdrop-blur-md">
                  <CalendarAndSentiment />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
