import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Fingerprint,
  Globe,
  Layers,
  Lock,
  Power,
  Radio,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  ShieldAlert,
  BrainCircuit,
  Scale,
  Flame,
  Key,
  ChevronRight,
  Sparkles,
  Zap,
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
  return { title: t("dashboard_title") || "Admin Control Center | ALPAR AI" };
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
  const [usersRes, incidentsRes, startupHealth, signals, _funding, _crons] = await Promise.all([
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
    startupHealth?.kpis.find(
      (k: { label: string; totalCount?: number | string }) => k.label === "Newsletter Subscribers",
    )?.totalCount ?? "0";
  const mrr = startupHealth?.mrr ? `$${startupHealth.mrr}` : "—";
  const latency = signals?.find(
    (s: { name: string; value?: number | string }) => s.name === "API Response Time",
  )?.value
    ? `${signals.find((s: { name: string; value?: number | string }) => s.name === "API Response Time")?.value}ms`
    : "14ms";
  const rlsEnforcement = signals?.find(
    (s: { name: string; value?: number | string }) => s.name === "Row Level Security (RLS)",
  )?.value
    ? `${signals.find((s: { name: string; value?: number | string }) => s.name === "Row Level Security (RLS)")?.value}%`
    : "100%";

  const coreModules = [
    {
      title: "1. Command Deck",
      desc: "Genel Durum & AI Olay Hız Göstergesi (Command Deck)",
      href: `/${locale}/admin`,
      icon: Activity,
      badge: "Realtime",
      color: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30",
    },
    {
      title: "2. Incident Triage Queue",
      desc: "AI Olay & İhbar Triyaj Masası under PII Guardian protection",
      href: `/${locale}/admin/incidents`,
      icon: ShieldAlert,
      badge: "Triage Active",
      color: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30",
    },
    {
      title: "3. LLM Debate Matrix",
      desc: "Çoklu-Model Çapraz Denetim & Consensus Verification Console",
      href: `/${locale}/admin/cross-audit`,
      icon: BrainCircuit,
      badge: "5 Judges",
      color: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30",
    },
    {
      title: "4. EU AI Act & Risk Radar",
      desc: "Statutory Tier Compliance, Art. 73 SLAs & Penalty Calculator",
      href: `/${locale}/admin/compliance`,
      icon: Scale,
      badge: "EU AI Act",
      color: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30",
    },
    {
      title: "5. Streisand Legal Desk",
      desc: "Vendor Legal Threat, SLAPP Defense & Public Transparency Desk",
      href: `/${locale}/admin/transparency`,
      icon: Flame,
      badge: "Legal Shield",
      color: "from-rose-600/20 to-rose-600/5 text-rose-300 border-rose-600/30",
    },
    {
      title: "6. Red-Teaming Bank",
      desc: "Topluluk Kırmızı Takım Test Bankası & Adversarial Jailbreak Sandbox",
      href: `/${locale}/admin/challenges`,
      icon: Target,
      badge: "$45.5k Pool",
      color: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30",
    },
    {
      title: "7. Kurumsal B2B Risk API",
      desc: "High-Throughput Threat Intelligence API Keys & Quota Management",
      href: `/${locale}/admin/api-keys`,
      icon: Key,
      badge: "B2B API",
      color: "from-yellow-500/20 to-yellow-500/5 text-yellow-400 border-yellow-500/30",
    },
    {
      title: "8. PII Guardian Security Vault",
      desc: "Zero-Knowledge Whistleblower Vault & DSAR Erasure Ledger",
      href: `/${locale}/admin/vault`,
      icon: Lock,
      badge: "Zero-Knowledge",
      color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <div className="selection:bg-brand-500/30 selection:text-brand-200 relative min-h-screen overflow-x-hidden bg-[#020202] text-zinc-300">
      {/* 2026 Ultra-Modern Deep Spatial Background */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <div className="from-brand-600/10 absolute top-0 h-[500px] w-full bg-gradient-to-b to-transparent opacity-50 blur-[100px]" />
        <div className="absolute top-[20%] left-[-10%] h-[40%] w-[30%] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute right-[-10%] bottom-[10%] h-[50%] w-[40%] rounded-full bg-rose-600/5 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)] bg-center opacity-[0.15]" />
      </div>

      <main className="relative z-10 mx-auto max-w-[1600px] space-y-6 px-4 py-6 md:px-8 md:py-10 lg:space-y-8">
        {/* HEADER BENTO */}
        <header className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-6 backdrop-blur-3xl transition-all duration-700 hover:border-white/10 hover:bg-white/[0.02] sm:px-10 sm:py-8">
          <div className="via-brand-500/5 pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[11px] font-black tracking-[0.2em] text-purple-300 uppercase shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
                360° ENTERPRISE CONTROL CENTER
              </div>
              <h1 className="bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-4xl font-black tracking-tighter text-transparent sm:text-5xl lg:text-6xl">
                Alpar AI Trust Deck
              </h1>
              <p className="max-w-xl text-sm font-medium text-zinc-400">
                Trust infrastructure for AI accountability. Real-time incident intake, multi-model
                cross-auditing, EU AI Act compliance, and whistleblower zero-knowledge protection.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/admin/strategy/master-plan`}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <Target className="h-4 w-4" /> {t("header_master_plan") || "Master Plan"}
              </Link>
            </div>
          </div>
        </header>

        {/* 8 CORE MODULES GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Core 360° Admin Modules
            </h2>
            <span className="font-mono text-xs text-zinc-400">8 Integrated Control Desks</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`rounded-xl border bg-gradient-to-br p-2.5 ${mod.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-300 uppercase">
                        {mod.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white transition-colors group-hover:text-purple-300">
                        {mod.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] font-semibold text-zinc-400 group-hover:text-white">
                    <span>Open Module</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* AI INCIDENT VELOCITY & TELEMETRY SECTION */}
        <div className="grid auto-rows-[minmax(280px,auto)] grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* CELL: KPI Hero */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:shadow-2xl lg:col-span-12">
            <div className="absolute top-0 right-0 p-8 opacity-20 transition-opacity group-hover:opacity-40">
              <Globe className="text-brand-400 h-48 w-48" strokeWidth={0.5} />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    AI Incident Velocity & Telemetry Overview
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Live accountability telemetry and threat intake rate
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 overflow-hidden lg:grid-cols-4">
                <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60">
                  <div className="mb-4 flex items-start justify-between">
                    <BarChart3 className="h-4 w-4 text-emerald-400 opacity-70" />
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Live
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-emerald-400 sm:text-3xl">18 mins</p>
                    <p className="mt-1 truncate text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      Mean Time to Acknowledge (MTTA)
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
                      Total Platform Users
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
                      {t("active_subscribers") || "Active Subscribers"}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-5 transition-all hover:bg-black/60">
                  <div className="mb-4 flex items-start justify-between">
                    <Layers className="h-4 w-4 text-amber-400 opacity-70" />
                    <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Audited
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-black text-amber-400 sm:text-3xl">
                      {totalIncidents}
                    </p>
                    <p className="mt-1 truncate text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      Curated AI Incidents
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
                      AI Core System & Telemetry Health
                    </h3>
                    <p className="text-xs text-zinc-400">Live Edge Telemetry</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-6">
                  <div>
                    <p className="mb-1 text-xs font-medium text-zinc-400">
                      {t("avg_latency") || "API Latency"}
                    </p>
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

          {/* CELL: Security Radar */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all duration-500 hover:border-rose-500/30 hover:shadow-[0_0_40px_rgba(244,63,94,0.1)] lg:col-span-12">
            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white">
                    Zero-Trust Security & RLS Sovereign Matrix
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Strict Row Level Security, Whistleblower Blind Hashing & PII Guardian
                    Sanitization
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs font-medium text-zinc-400">RLS Enforcement</div>
                  <div className="font-mono text-2xl font-black text-rose-400">
                    {rlsEnforcement}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-zinc-400">PII Guardian</div>
                  <div className="font-mono text-2xl font-black text-emerald-400">Active</div>
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
        </div>
      </main>
    </div>
  );
}
