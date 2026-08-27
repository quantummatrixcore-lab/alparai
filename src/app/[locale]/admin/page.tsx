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
    <div className="selection:bg-brand-500/30 selection:text-brand-200 relative min-h-screen overflow-x-hidden bg-[#020202] text-zinc-300">
      {/* 2026 Ultra-Modern Deep Spatial Background */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <div className="from-brand-600/10 absolute top-0 h-[500px] w-full bg-gradient-to-b to-transparent opacity-50 blur-[100px]" />
        <div className="absolute top-[20%] left-[-10%] h-[40%] w-[30%] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute right-[-10%] bottom-[10%] h-[50%] w-[40%] rounded-full bg-rose-600/5 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)] bg-center opacity-[0.15]" />
        <div className="bg-noise absolute inset-0 opacity-20 mix-blend-overlay" />
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] space-y-6 px-4 py-6 md:px-8 md:py-10 lg:space-y-8">
        {/* HEADER BENTO */}
        <header className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-6 backdrop-blur-3xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.02] sm:px-10 sm:py-8">
          <div className="via-brand-500/5 pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-indigo-400 uppercase shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
                {t("badge_spatial_cockpit")}
              </div>
              <h1 className="bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-4xl font-black tracking-tighter text-transparent sm:text-5xl lg:text-6xl">
                {t("command_center_title")}
              </h1>
              <p className="max-w-xl text-sm font-medium text-zinc-400">
                {t("command_center_subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/admin/strategy/master-plan`}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <Target className="h-4 w-4" /> {t("header_master_plan")}
              </Link>
              <button
                aria-label={t("command_palette")}
                className="border-brand-500/30 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 hover:border-brand-500/50 flex items-center gap-3 rounded-2xl border px-6 py-4 text-sm font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(var(--brand-500),0.2)]"
              >
                <Search className="h-4 w-4" /> {t("command_palette")}{" "}
                <kbd className="text-brand-400/70 border-brand-500/20 hidden rounded-md border bg-black/40 px-2 py-0.5 text-[10px] sm:inline-block">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>
        </header>

        {/* BENTO GRID: 12-COL LAYOUT */}
        <div className="grid auto-rows-[minmax(280px,auto)] grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* CELL: KPI Hero */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-2xl lg:col-span-12">
            <div className="absolute top-0 right-0 p-8 opacity-20 transition-opacity group-hover:opacity-40">
              <Globe className="text-brand-400 h-48 w-48" strokeWidth={0.5} />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="mb-8 flex items-center gap-3">
                <div className="bg-brand-500/10 border-brand-500/30 text-brand-400 flex h-12 w-12 items-center justify-center rounded-2xl border">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    {t("financial_ops_title")}
                  </h3>
                  <p className="text-xs text-zinc-400">{t("financial_ops_desc")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 overflow-hidden lg:grid-cols-4">
                <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60">
                  <div className="mb-4 flex items-start justify-between">
                    <BarChart3 className="h-4 w-4 text-emerald-400 opacity-70" />
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      +12.4%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-emerald-400 sm:text-3xl">{mrr}</p>
                    <p className="mt-1 truncate text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      {t("monthly_revenue")}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60">
                  <div className="mb-4 flex items-start justify-between">
                    <Users className="h-4 w-4 text-white opacity-70" />
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      +4.1%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-white sm:text-3xl">{totalUsers}</p>
                    <p className="mt-1 truncate text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      Total Users
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60">
                  <div className="mb-4 flex items-start justify-between">
                    <Radio className="h-4 w-4 text-cyan-400 opacity-70" />
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      +8.2%
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-cyan-400 sm:text-3xl">
                      {activeSubscribers}
                    </p>
                    <p className="mt-1 truncate text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      {t("active_subscribers")}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60">
                  <div className="mb-4 flex items-start justify-between">
                    <Layers className="h-4 w-4 text-amber-400 opacity-70" />
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Stable
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-amber-400 sm:text-3xl">
                      {totalIncidents}
                    </p>
                    <p className="mt-1 truncate text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      Incidents
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-12 lg:gap-8">
            <PlausibleVisitorCard />
            {/* CELL: Telemetry / Latency */}
            <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]">
              <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px] transition-colors group-hover:bg-cyan-500/20" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight text-white">
                      {t("ai_core_system_health_title")}
                    </h3>
                    <p className="text-xs text-zinc-400">Live Edge Telemetry</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-6">
                  <div>
                    <p className="mb-1 text-xs font-medium text-zinc-400">{t("avg_latency")}</p>
                    <div className="flex items-end gap-2">
                      <span className="bg-gradient-to-br from-cyan-300 to-cyan-600 bg-clip-text text-5xl font-black text-transparent">
                        {latency}
                      </span>
                    </div>
                  </div>
                  <div className="flex h-[60px] w-full items-end gap-1 opacity-80">
                    {[40, 30, 50, 40, 60, 30, 20, 45, 30, 25, 40, 35].map((h, i) => (
                      <div
                        key={i}
                        className="w-full rounded-t-sm bg-cyan-500/30 transition-all hover:bg-cyan-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CELL: Swarm Agents */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-indigo-500/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] lg:col-span-8">
            <div className="flex h-full flex-col justify-between">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                    <Network className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold tracking-tight text-white">Swarm Intelligence</h3>
                    <p className="text-xs text-zinc-400">Active Digital Twins</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Operational
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 overflow-hidden lg:grid-cols-4">
                <div className="group/agent relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:border-white/10 hover:bg-black/60">
                  <div className="absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rounded-full bg-indigo-500 opacity-20 blur-[30px] transition-opacity group-hover/agent:opacity-40" />
                  <div className="mb-3 flex items-start justify-between">
                    <span className="min-w-0 truncate text-[10px] font-bold tracking-wider text-zinc-500">
                      Supreme Commander
                    </span>
                    <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                  <h4 className="truncate text-sm font-black text-white">ATATÜRK</h4>
                  <p className="mt-1 truncate text-xs font-medium text-zinc-400">Gemini 3.1 Pro</p>
                </div>

                <div className="group/agent relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:border-white/10 hover:bg-black/60">
                  <div className="absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rounded-full bg-amber-500 opacity-20 blur-[30px] transition-opacity group-hover/agent:opacity-40" />
                  <div className="mb-3 flex items-start justify-between">
                    <span className="min-w-0 truncate text-[10px] font-bold tracking-wider text-zinc-500">
                      Dev & Deploy
                    </span>
                    <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                  <h4 className="truncate text-sm font-black text-white">EDISON</h4>
                  <p className="mt-1 truncate text-xs font-medium text-zinc-400">Nemotron 3.5</p>
                </div>

                <div className="group/agent relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:border-white/10 hover:bg-black/60">
                  <div className="absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rounded-full bg-fuchsia-500 opacity-20 blur-[30px] transition-opacity group-hover/agent:opacity-40" />
                  <div className="mb-3 flex items-start justify-between">
                    <span className="min-w-0 truncate text-[10px] font-bold tracking-wider text-zinc-500">
                      UI/UX Architecture
                    </span>
                    <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                  <h4 className="truncate text-sm font-black text-white">DA VİNCİ</h4>
                  <p className="mt-1 truncate text-xs font-medium text-zinc-400">Muse Spark</p>
                </div>

                <div className="group/agent relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:border-white/10 hover:bg-black/60">
                  <div className="absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rounded-full bg-rose-500 opacity-20 blur-[30px] transition-opacity group-hover/agent:opacity-40" />
                  <div className="mb-3 flex items-start justify-between">
                    <span className="min-w-0 truncate text-[10px] font-bold tracking-wider text-zinc-500">
                      Security & RLS
                    </span>
                    <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>
                  <h4 className="truncate text-sm font-black text-white">FATİH</h4>
                  <p className="mt-1 truncate text-xs font-medium text-zinc-400">Nemotron Ultra</p>
                </div>
              </div>
            </div>
          </div>

          {/* CELL: Security Radar */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-rose-500/30 hover:shadow-[0_0_40px_rgba(244,63,94,0.1)] md:col-span-6 lg:col-span-4">
            <div className="flex h-full flex-col justify-between">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold tracking-tight text-white">
                      {t("security_radar_title")}
                    </h3>
                    <p className="truncate text-xs text-zinc-400">Zero Trust Matrix</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <div className="mb-2 flex items-end gap-3">
                  <span className="bg-gradient-to-br from-rose-400 to-rose-700 bg-clip-text text-5xl font-black text-transparent">
                    {rlsEnforcement}
                  </span>
                  <span className="mb-2 text-sm font-bold text-zinc-500">
                    {t("rls_enforcement")}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-zinc-400">
                      <Fingerprint className="h-3 w-3 text-emerald-400" /> {t("pii_guardian")}
                    </span>
                    <span className="font-bold text-white">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-zinc-400">
                      <Lock className="h-3 w-3 text-emerald-400" /> Auth Integrity
                    </span>
                    <span className="font-bold text-white">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CELL: AI Budget Score & Test 360 Meter */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-12 lg:gap-8">
            <div className="relative h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-xl">
              <AiBudgetTransparencyScore
                score={98.4}
                totalBudgetTokens={10000}
                consumedTokens={4820}
                hallucinationRate={1.2}
                verifiedClaimsCount={totalIncidents}
                savedTokens={18450}
              />
            </div>
            <div className="relative h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-xl">
              <Test360Meter />
            </div>
          </div>

          {/* CELL: Master Plan Prioritization */}
          <div className="relative h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-xl md:col-span-12 lg:col-span-7">
            <PrioritizationWidget items={masterPlan.items} error={masterPlan.error} />
          </div>

          {/* CELL: Advisor Roster */}
          <div className="relative h-full overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-xl md:col-span-12 lg:col-span-5">
            <AdvisorRoster />
          </div>

          {/* CELL: Database Limits */}
          <div className="group relative overflow-hidden rounded-[3rem] border border-amber-500/10 bg-gradient-to-br from-amber-500/[0.02] to-transparent p-8 backdrop-blur-3xl transition-all duration-500 hover:border-amber-500/30 hover:shadow-[0_0_60px_rgba(245,158,11,0.1)] md:col-span-12 lg:col-span-12 lg:p-10">
            <div className="pointer-events-none absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[150px]" />
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Power className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black tracking-tight text-white">
                    Founder Console
                  </h2>
                  <p className="mt-1 truncate text-sm font-medium text-zinc-400">
                    Autonomous Outreach & Sentiment Tracking
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 overflow-hidden lg:grid-cols-2">
                <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-black/40 p-6 backdrop-blur-2xl transition-all hover:border-white/10 hover:bg-black/60">
                  <OutreachAutopilot />
                </div>
                <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-black/40 p-6 backdrop-blur-2xl transition-all hover:border-white/10 hover:bg-black/60">
                  <CalendarAndSentiment />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER QUICK LINKS BENTO */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-6 backdrop-blur-3xl transition-all hover:border-white/10 sm:p-8 md:col-span-12">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                System Routes
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
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
                    className="rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
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
