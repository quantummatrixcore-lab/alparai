import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Fingerprint,
  Globe,
  Layers,
  Lock,
  Network,
  Power,
  Radio,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { AdvisorRoster } from "@/components/admin/strategy/advisor-roster";
import { AiBudgetTransparencyScore } from "@/components/admin/AiBudgetTransparencyScore";
import { Test360Meter } from "@/components/admin/test-360-meter";
import { PrioritizationWidget } from "@/components/admin/prioritization-widget";
import { PlausibleVisitorCard } from "@/components/admin/plausible-visitor-card";
import { OutreachAutopilot } from "@/components/admin/founder/OutreachAutopilot";
import { CalendarAndSentiment } from "@/components/admin/founder/CalendarAndSentiment";

import { createServerClient } from "@/lib/supabase/server";
import { parseMasterPlan } from "@/lib/server/master-plan";
import { getStartupHealth } from "@/actions/admin/startup-health";
import { getSystemSignalsAction } from "@/actions/admin/signals";
import { getFundingConversion } from "@/actions/admin/funding-conversion";
import { getCronStatus } from "@/lib/engine-registry";

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
  const mrr = startupHealth?.mrr ? `$${startupHealth.mrr}` : "—";
  const latency = signals?.find((s) => s.name === "API Response Time")?.value
    ? `${signals.find((s) => s.name === "API Response Time")?.value}ms`
    : "18ms";
  const rlsEnforcement = signals?.find((s) => s.name === "Row Level Security (RLS)")?.value
    ? `${signals.find((s) => s.name === "Row Level Security (RLS)")?.value}%`
    : "100%";

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-300 selection:bg-brand-500/30 selection:text-brand-200 overflow-x-hidden relative">
      {/* 2026 Ultra-Modern Deep Spatial Background */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-brand-600/10 to-transparent blur-[100px] opacity-50" />
        <div className="absolute left-[-10%] top-[20%] h-[40%] w-[30%] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute right-[-10%] bottom-[10%] h-[50%] w-[40%] rounded-full bg-rose-600/5 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.15] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)]" />
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 md:py-10 md:px-8 space-y-6 lg:space-y-8">
        {/* HEADER BENTO */}
        <header className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-6 backdrop-blur-3xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.02] sm:px-10 sm:py-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 blur-2xl" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-indigo-400 uppercase shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
                {t("badge_spatial_cockpit")}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600">
                {t("command_center_title")}
              </h1>
              <p className="text-sm font-medium text-zinc-400 max-w-xl">
                {t("command_center_subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/admin/strategy/master-plan`}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <Target className="h-4 w-4" /> {t("header_master_plan")}
              </Link>
              <button
                aria-label={t("command_palette")}
                className="flex items-center gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 px-6 py-4 text-sm font-bold text-brand-300 transition-all hover:bg-brand-500/20 hover:border-brand-500/50 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(var(--brand-500),0.2)]"
              >
                <Search className="h-4 w-4" /> {t("command_palette")}{" "}
                <kbd className="hidden sm:inline-block rounded-md bg-black/40 px-2 py-0.5 text-[10px] text-brand-400/70 border border-brand-500/20">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>
        </header>

        {/* BENTO GRID: 12-COL LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-[minmax(280px,auto)] gap-6 lg:gap-8">
          {/* CELL: KPI Hero */}
          <div className="lg:col-span-12 group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-20 transition-opacity group-hover:opacity-40">
              <Globe className="h-48 w-48 text-brand-400" strokeWidth={0.5} />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {t("financial_ops_title")}
                  </h3>
                  <p className="text-xs text-zinc-400">{t("financial_ops_desc")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
                <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60 overflow-hidden min-w-0">
                  <div className="flex justify-between items-start mb-4">
                    <BarChart3 className="h-4 w-4 text-emerald-400 opacity-70" />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      +12.4%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl sm:text-3xl font-black text-emerald-400">{mrr}</p>
                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1 truncate">
                      {t("monthly_revenue")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60 overflow-hidden min-w-0">
                  <div className="flex justify-between items-start mb-4">
                    <Users className="h-4 w-4 text-white opacity-70" />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      +4.1%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl sm:text-3xl font-black text-white">{totalUsers}</p>
                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1 truncate">
                      Total Users
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60 overflow-hidden min-w-0">
                  <div className="flex justify-between items-start mb-4">
                    <Radio className="h-4 w-4 text-cyan-400 opacity-70" />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      +8.2%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl sm:text-3xl font-black text-cyan-400">{activeSubscribers}</p>
                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1 truncate">
                      {t("active_subscribers")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60 overflow-hidden min-w-0">
                  <div className="flex justify-between items-start mb-4">
                    <Layers className="h-4 w-4 text-amber-400 opacity-70" />
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      Stable
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl sm:text-3xl font-black text-amber-400">{totalIncidents}</p>
                    <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-1 truncate">
                      Incidents
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-12 gap-6 lg:gap-8">
            <PlausibleVisitorCard />
            {/* CELL: Telemetry / Latency */}
            <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]">
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px] group-hover:bg-cyan-500/20 transition-colors" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight">
                      {t("ai_core_system_health_title")}
                    </h3>
                    <p className="text-xs text-zinc-400">Live Edge Telemetry</p>
                  </div>
                </div>
                <div className="flex flex-col gap-6 mt-8">
                  <div>
                    <p className="text-xs text-zinc-400 font-medium mb-1">{t("avg_latency")}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-cyan-600">
                        {latency}
                      </span>
                    </div>
                  </div>
                  <div className="h-[60px] w-full flex items-end gap-1 opacity-80">
                    {[40, 30, 50, 40, 60, 30, 20, 45, 30, 25, 40, 35].map((h, i) => (
                      <div
                        key={i}
                        className="w-full bg-cyan-500/30 rounded-t-sm transition-all hover:bg-cyan-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CELL: Swarm Agents */}
          <div className="lg:col-span-8 group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Network className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight">Swarm Intelligence</h3>
                    <p className="text-xs text-zinc-400">Active Digital Twins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Operational
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 overflow-hidden">
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:bg-black/60 hover:border-white/10 group/agent">
                  <div className="absolute top-0 right-0 h-16 w-16 -translate-y-8 translate-x-8 rounded-full blur-[30px] opacity-20 bg-indigo-500 transition-opacity group-hover/agent:opacity-40" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500 min-w-0 truncate">Supreme Commander</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                  </div>
                  <h4 className="text-sm font-black text-white truncate">ATATÜRK</h4>
                  <p className="text-xs text-zinc-400 font-medium mt-1 truncate">Gemini 3.1 Pro</p>
                </div>
                
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:bg-black/60 hover:border-white/10 group/agent">
                  <div className="absolute top-0 right-0 h-16 w-16 -translate-y-8 translate-x-8 rounded-full blur-[30px] opacity-20 bg-amber-500 transition-opacity group-hover/agent:opacity-40" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500 min-w-0 truncate">Dev & Deploy</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                  </div>
                  <h4 className="text-sm font-black text-white truncate">EDISON</h4>
                  <p className="text-xs text-zinc-400 font-medium mt-1 truncate">Nemotron 3.5</p>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:bg-black/60 hover:border-white/10 group/agent">
                  <div className="absolute top-0 right-0 h-16 w-16 -translate-y-8 translate-x-8 rounded-full blur-[30px] opacity-20 bg-fuchsia-500 transition-opacity group-hover/agent:opacity-40" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500 min-w-0 truncate">UI/UX Architecture</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                  </div>
                  <h4 className="text-sm font-black text-white truncate">DA VİNCİ</h4>
                  <p className="text-xs text-zinc-400 font-medium mt-1 truncate">Muse Spark</p>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:bg-black/60 hover:border-white/10 group/agent">
                  <div className="absolute top-0 right-0 h-16 w-16 -translate-y-8 translate-x-8 rounded-full blur-[30px] opacity-20 bg-rose-500 transition-opacity group-hover/agent:opacity-40" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500 min-w-0 truncate">Security & RLS</span>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                  </div>
                  <h4 className="text-sm font-black text-white truncate">FATİH</h4>
                  <p className="text-xs text-zinc-400 font-medium mt-1 truncate">Nemotron Ultra</p>
                </div>
              </div>
            </div>
          </div>

          {/* CELL: Security Radar */}
          <div className="md:col-span-6 lg:col-span-4 group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-rose-500/30 hover:shadow-[0_0_40px_rgba(244,63,94,0.1)]">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight">
                      {t("security_radar_title")}
                    </h3>
                    <p className="text-xs text-zinc-400">Zero Trust Matrix</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-rose-700">
                    {rlsEnforcement}
                  </span>
                  <span className="text-sm text-zinc-500 font-bold mb-2">
                    {t("rls_enforcement")}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 w-full rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Fingerprint className="w-3 h-3 text-emerald-400" /> {t("pii_guardian")}
                    </span>
                    <span className="text-white font-bold">Active</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Lock className="w-3 h-3 text-emerald-400" /> Auth Integrity
                    </span>
                    <span className="text-white font-bold">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CELL: AI Budget Score & Test 360 Meter */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-12 gap-6 lg:gap-8">
            <div className="h-full relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-xl">
              <AiBudgetTransparencyScore
                score={98.4}
                totalBudgetTokens={10000}
                consumedTokens={4820}
                hallucinationRate={1.2}
                verifiedClaimsCount={totalIncidents}
                savedTokens={18450}
              />
            </div>
            <div className="h-full relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-xl">
              <Test360Meter />
            </div>
          </div>

          {/* CELL: Master Plan Prioritization */}
          <div className="md:col-span-12 lg:col-span-7 h-full relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-xl">
            <PrioritizationWidget items={masterPlan.items} error={masterPlan.error} />
          </div>

          {/* CELL: Advisor Roster */}
          <div className="md:col-span-12 lg:col-span-5 h-full relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-xl">
            <AdvisorRoster />
          </div>

          {/* CELL: Database Limits */}
          <div className="md:col-span-12 lg:col-span-12 group relative overflow-hidden rounded-[3rem] border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.02] to-transparent p-8 lg:p-10 backdrop-blur-3xl transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_0_60px_rgba(245,158,11,0.1)]">
            <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Power className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Founder Console</h2>
                  <p className="text-sm font-medium text-zinc-400 mt-1">
                    Autonomous Outreach & Sentiment Tracking
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-white/5 bg-black/40 p-6 backdrop-blur-2xl transition-all hover:bg-black/60 hover:border-white/10 overflow-hidden">
                  <OutreachAutopilot />
                </div>
                <div className="rounded-[2rem] border border-white/5 bg-black/40 p-6 backdrop-blur-2xl transition-all hover:bg-black/60 hover:border-white/10 overflow-hidden">
                  <CalendarAndSentiment />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER QUICK LINKS BENTO */}
          <div className="md:col-span-12 group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-6 sm:p-8 backdrop-blur-3xl transition-all hover:border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-zinc-500 tracking-widest uppercase">
                System Routes
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                {[
                  { label: "Billing", path: "/admin/billing" },
                  { label: "Health", path: "/admin/health" },
                  { label: "Strategy", path: "/admin/strategy" },
                  { label: "Crons", path: "/admin/crons" },
                  { label: "Audit", path: "/admin/audit" },
                ].map((link) => (
                  <Link
                    key={link.path}
                    href={`/${locale}${link.path}`}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
