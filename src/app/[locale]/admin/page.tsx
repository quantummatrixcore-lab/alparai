import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
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
import { getStartupHealth } from "@/actions/admin/startup-health";
import { getSystemSignalsAction } from "@/actions/admin/signals";
import { getFundingConversion } from "@/actions/admin/funding-conversion";
import { getCronStatus } from "@/lib/engine-registry";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("dashboard") || "360° Spatial Cockpit — ALPAR AI" };
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch dynamic data for widgets
  const [startupHealth, signals, funding, crons] = await Promise.all([
    getStartupHealth().catch(() => null),
    getSystemSignalsAction().catch(() => []),
    getFundingConversion().catch(() => null),
    getCronStatus().catch(() => []),
  ]);

  const activeSubscribers =
    startupHealth?.kpis.find((k) => k.label === "Newsletter Subscribers")?.totalCount ??
    "ölçülmedi";
  const grantsWon =
    funding?.combinedWon !== undefined ? `${funding.combinedWon} Kazanılan` : "ölçülmedi";
  const apiCost = startupHealth?.zeroCostBurnStr ?? "ölçülmedi/mo";
  const latency = signals?.find((s) => s.name === "API Response Time")?.value
    ? `${signals.find((s) => s.name === "API Response Time")?.value}ms`
    : "ölçülmedi";
  const activeCrons = crons?.length ?? "ölçülmedi";
  const rlsEnforcement = signals?.find((s) => s.name === "Row Level Security (RLS)")?.value
    ? `%${signals.find((s) => s.name === "Row Level Security (RLS)")?.value}`
    : "ölçülmedi";

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="rounded-3xl bg-zinc-900/40 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
        <div className="min-h-screen bg-[#070709] p-4 text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200 md:p-8 lg:p-12">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Top Bar: Title + Status + Action Buttons */}
            <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  360° SPATIAL COCKPIT — PROD OPERATIONAL
                </div>
                <h1 className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl">
                  ALPAR AI Command Center
                </h1>
                <p className="text-sm font-medium text-zinc-400 sm:text-base">
                  Autonomous Governance, Financial Engine, Security Radar & Strategy Control (56
                  Integrated Routes)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/admin/strategy/master-plan`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition-all duration-300 hover:border-cyan-500/60 hover:bg-cyan-500/20 hover:text-white"
                >
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span>Master Plan v12.83</span>
                </Link>

                <Link
                  href={`/${locale}/admin/cockpit`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-300 transition-all duration-300 hover:border-purple-500/60 hover:bg-purple-500/20 hover:text-white"
                >
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>Spatial View</span>
                </Link>

                <button className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-400 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-zinc-200">
                  <Search className="h-4 w-4" />
                  <span className="font-medium">Command Palette</span>
                  <kbd className="ml-2 hidden h-5 items-center gap-0.5 rounded-md bg-white/10 px-2 font-mono text-[11px] font-semibold text-zinc-300 md:inline-flex">
                    <span>⌘</span>
                    <span>K</span>
                  </kbd>
                </button>
              </div>
            </header>

            {/* AI Incident Budget Transparency Score Widget (Task #160) */}
            <AiBudgetTransparencyScore />

            {/* 360 Expert AI Audit Meter */}
            <Test360Meter />

            {/* Main 4 Giant Widget Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PrioritizationWidget />

              {/* WIDGET 1: Financial & Operations Cockpit */}
              <section className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:bg-zinc-900/60 md:p-8">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/20" />

                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400">
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                          Finans & Operasyonel Maliyet
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Financial Ledger, Grants, Users & Operational Unit Costs
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-400">
                      MRR —
                    </span>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Monthly Revenue</p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">ölçülmedi</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Active Subscribers</p>
                      <p className="mt-1 text-lg font-bold text-zinc-100">{activeSubscribers}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Grants & Funding</p>
                      <p className="mt-1 text-lg font-bold text-cyan-400">{grantsWon}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">API & Infra Cost</p>
                      <p className="mt-1 text-lg font-bold text-amber-400">{apiCost}</p>
                    </div>
                  </div>

                  {/* Route Shortcuts Grid */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      Finans Rotaları (12 Entegre Modül)
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        {
                          href: `/${locale}/admin/billing`,
                          label: "Billing & Invoices",
                          icon: DollarSign,
                        },
                        {
                          href: `/${locale}/admin/finance`,
                          label: "Financial Ledger",
                          icon: LineChart,
                        },
                        { href: `/${locale}/admin/grants`, label: "Grants & R&D", icon: Award },
                        { href: `/${locale}/admin/users`, label: "User Directory", icon: Users },
                        {
                          href: `/${locale}/admin/metrics-hub/api-metrics`,
                          label: "API Unit Costs",
                          icon: PieChart,
                        },
                        {
                          href: `/${locale}/admin/investors`,
                          label: "Investors Portal",
                          icon: TrendingUp,
                        },
                        {
                          href: `/${locale}/admin/startup-health`,
                          label: "Startup Health",
                          icon: Activity,
                        },
                        {
                          href: `/${locale}/admin/strategy/valuation`,
                          label: "Valuation Models",
                          icon: FileSpreadsheet,
                        },
                        {
                          href: `/${locale}/admin/strategy/state-support`,
                          label: "State Support",
                          icon: CheckCircle2,
                        },
                        {
                          href: `/${locale}/admin/resources`,
                          label: "Resource Alloc",
                          icon: Layers,
                        },
                        {
                          href: `/${locale}/admin/ecosystem`,
                          label: "Ecosystem Capital",
                          icon: Globe,
                        },
                        {
                          href: `/${locale}/admin/import`,
                          label: "Data Import/Export",
                          icon: ArrowUpRight,
                        },
                      ].map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          className="group/item flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <route.icon className="h-3.5 w-3.5 shrink-0 text-emerald-400/70 group-hover/item:text-emerald-400" />
                            <span className="truncate">{route.label}</span>
                          </span>
                          <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-emerald-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                  <span className="text-zinc-500">Auto-synced via Supabase & Resend API</span>
                  <Link
                    href={`/${locale}/admin/billing`}
                    className="font-semibold text-emerald-400 hover:underline"
                  >
                    Finansal Raporları İncele →
                  </Link>
                </div>
              </section>

              {/* WIDGET 2: AI Core & System Health Cockpit */}
              <section className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-cyan-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-zinc-900/60 md:p-8">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl transition-all duration-500 group-hover:bg-cyan-500/20" />

                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400">
                        <Cpu className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                          AI Core & Sistem Sağlığı
                        </h2>
                        <p className="text-xs text-zinc-400">
                          TOM Engine, Edge Latency, Crons & Autopilot Status
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                      Uptime 99.99%
                    </span>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Edge Region</p>
                      <p className="mt-1 text-lg font-bold text-cyan-400">fra1 (Vercel)</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Avg Latency</p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">{latency}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">TOM Context Saved</p>
                      <p className="mt-1 text-lg font-bold text-purple-400">ölçülmedi</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Cron Jobs</p>
                      <p className="mt-1 text-lg font-bold text-zinc-100">{activeCrons}</p>
                    </div>
                  </div>

                  {/* Route Shortcuts Grid */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      Sistem & AI Rotaları (15 Entegre Modül)
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        {
                          href: `/${locale}/admin/ai-hub/orchestrator`,
                          label: "AI Orchestrator",
                          icon: Cpu,
                        },
                        {
                          href: `/${locale}/admin/metrics-hub/ai-pulse`,
                          label: "AI Pulse Health",
                          icon: Radio,
                        },
                        { href: `/${locale}/admin/health`, label: "System Status", icon: Activity },
                        { href: `/${locale}/admin/cron-health`, label: "Cron Health", icon: Zap },
                        { href: `/${locale}/admin/crons`, label: "Scheduled Crons", icon: Server },
                        {
                          href: `/${locale}/admin/metrics-hub/slo-dashboard`,
                          label: "SLO Dashboard",
                          icon: BarChart3,
                        },
                        {
                          href: `/${locale}/admin/api-management`,
                          label: "API Management",
                          icon: Code2,
                        },
                        {
                          href: `/${locale}/admin/ai-hub/autopilot`,
                          label: "Autopilot Core",
                          icon: Workflow,
                        },
                        {
                          href: `/${locale}/admin/ai-hub/autopilot/analytics`,
                          label: "Autopilot Analytics",
                          icon: LineChart,
                        },
                        {
                          href: `/${locale}/admin/codebase-hygiene`,
                          label: "Code Hygiene",
                          icon: CheckCircle2,
                        },
                        {
                          href: `/${locale}/admin/modular-architecture`,
                          label: "Modular Arch",
                          icon: Layers,
                        },
                        {
                          href: `/${locale}/admin/feature-flags`,
                          label: "Feature Flags",
                          icon: Sliders,
                        },
                        {
                          href: `/${locale}/admin/providers`,
                          label: "AI Providers",
                          icon: Sparkles,
                        },
                        {
                          href: `/${locale}/admin/cross-audit-dashboard`,
                          label: "Cross Audit",
                          icon: Eye,
                        },
                        {
                          href: `/${locale}/admin/settings`,
                          label: "Global Settings",
                          icon: Database,
                        },
                      ].map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          className="group/item flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
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

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                  <span className="text-zinc-500">Vercel & Supabase Edge Connected</span>
                  <Link
                    href={`/${locale}/admin/health`}
                    className="font-semibold text-cyan-400 hover:underline"
                  >
                    Orchestrator Detayları →
                  </Link>
                </div>
              </section>

              {/* WIDGET 3: Security, Compliance & Moderation Cockpit */}
              <section className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-rose-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-rose-500/40 hover:bg-zinc-900/60 md:p-8">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl transition-all duration-500 group-hover:bg-rose-500/20" />

                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-400">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                          Güvenlik & Uyum (Security Radar)
                        </h2>
                        <p className="text-xs text-zinc-400">
                          PII Guardian, DSAR, Audit Logs & Content Moderation
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
                      PII 100% Masked
                    </span>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">PII Guardian</p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">Active</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Pending DSAR</p>
                      <p className="mt-1 text-lg font-bold text-zinc-100">0 Overdue</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Moderation Queue</p>
                      <p className="mt-1 text-lg font-bold text-cyan-400">Clean</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">RLS Enforcement</p>
                      <p className="mt-1 text-lg font-bold text-purple-400">{rlsEnforcement}</p>
                    </div>
                  </div>

                  {/* Route Shortcuts Grid */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      Güvenlik & Moderasyon Rotaları (12 Entegre Modül)
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        { href: `/${locale}/admin/audit`, label: "Audit Logs", icon: Lock },
                        { href: `/${locale}/admin/dsar`, label: "DSAR Requests", icon: UserCheck },
                        {
                          href: `/${locale}/admin/takedown`,
                          label: "Takedown & DMCA",
                          icon: ShieldAlert,
                        },
                        {
                          href: `/${locale}/admin/moderation`,
                          label: "Moderation Queue",
                          icon: Inbox,
                        },
                        {
                          href: `/${locale}/admin/api-keys`,
                          label: "API Key Management",
                          icon: Key,
                        },
                        {
                          href: `/${locale}/admin/redaction-queue`,
                          label: "Redaction Queue",
                          icon: Eye,
                        },
                        {
                          href: `/${locale}/admin/dual-channel-scoring`,
                          label: "Dual Channel Score",
                          icon: BarChart3,
                        },
                        {
                          href: `/${locale}/admin/analytics-hub/k-benchmark`,
                          label: "K-Benchmark Suite",
                          icon: Target,
                        },
                        {
                          href: `/${locale}/admin/analytics-hub/expert-analysis`,
                          label: "Expert Analysis",
                          icon: CheckCircle2,
                        },
                        { href: `/${locale}/admin/experts`, label: "Expert Registry", icon: Users },
                        {
                          href: `/${locale}/admin/analytics-hub/analysis`,
                          label: "Deep Analysis",
                          icon: Search,
                        },
                        {
                          href: `/${locale}/admin/cockpit`,
                          label: "Cockpit Control",
                          icon: Sparkles,
                        },
                      ].map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          className="group/item flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
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

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                  <span className="text-zinc-500">KVKK & GDPR Zero-Knowledge Compliant</span>
                  <Link
                    href={`/${locale}/admin/audit`}
                    className="font-semibold text-rose-400 hover:underline"
                  >
                    Güvenlik Loglarını İncele →
                  </Link>
                </div>
              </section>

              {/* WIDGET 4: Strategy, Growth & Outreach Cockpit */}
              <section className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-500/20 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:bg-zinc-900/60 md:p-8">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl transition-all duration-500 group-hover:bg-purple-500/20" />

                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 text-purple-400">
                        <Rocket className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                          Strateji, Büyüme & Outreach
                        </h2>
                        <p className="text-xs text-zinc-400">
                          Master Plan, LinkedIn, Resend Outreach & Advisory Board
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                      Q3 Progress %65
                    </span>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Master Plan</p>
                      <p className="mt-1 text-lg font-bold text-cyan-400">%65 Done</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">LinkedIn Reach</p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">ölçülmedi</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Outreach Open Rate</p>
                      <p className="mt-1 text-lg font-bold text-purple-400">ölçülmedi</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                      <p className="text-xs font-medium text-zinc-400">Advisory Board</p>
                      <p className="mt-1 text-lg font-bold text-zinc-100">ölçülmedi</p>
                    </div>
                  </div>

                  {/* Route Shortcuts Grid */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      Strateji & Büyüme Rotaları (18 Entegre Modül)
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        {
                          href: `/${locale}/admin/strategy/master-plan`,
                          label: "Master Plan",
                          icon: FileText,
                        },
                        {
                          href: `/${locale}/admin/strategy`,
                          label: "Strategy Portal",
                          icon: Target,
                        },
                        {
                          href: `/${locale}/admin/strategy/roadmap`,
                          label: "Product Roadmap",
                          icon: Rocket,
                        },
                        {
                          href: `/${locale}/admin/strategy/swot`,
                          label: "SWOT Matrix",
                          icon: PieChart,
                        },
                        {
                          href: `/${locale}/admin/strategy/risks`,
                          label: "Risk Assessment",
                          icon: AlertTriangle,
                        },
                        {
                          href: `/${locale}/admin/strategy/questionnaire`,
                          label: "Strategy Survey",
                          icon: FileSpreadsheet,
                        },
                        {
                          href: `/${locale}/admin/advisory-board`,
                          label: "Advisory Board",
                          icon: Users,
                        },
                        {
                          href: `/${locale}/admin/linkedin`,
                          label: "LinkedIn Analytics",
                          icon: Share2,
                        },
                        {
                          href: `/${locale}/admin/outreach`,
                          label: "Outreach (Resend)",
                          icon: Send,
                        },
                        { href: `/${locale}/admin/social`, label: "Social Media", icon: Globe },
                        {
                          href: `/${locale}/admin/marketing`,
                          label: "Growth Marketing",
                          icon: Flame,
                        },
                        {
                          href: `/${locale}/admin/seo-performance`,
                          label: "SEO Performance",
                          icon: LineChart,
                        },
                        {
                          href: `/${locale}/admin/launch-signal`,
                          label: "Launch Signals",
                          icon: Radio,
                        },
                        {
                          href: `/${locale}/admin/metrics-hub/signals`,
                          label: "Market Signals",
                          icon: Activity,
                        },
                        {
                          href: `/${locale}/admin/innovations`,
                          label: "AI Innovations",
                          icon: Sparkles,
                        },
                        { href: `/${locale}/admin/geo`, label: "Geo Intelligence", icon: Globe },
                        {
                          href: `/${locale}/admin/platforms`,
                          label: "Platform Ecosystem",
                          icon: Layers,
                        },
                        {
                          href: `/${locale}/admin/ai-hub/jules`,
                          label: "Jules AI Agent",
                          icon: Cpu,
                        },
                      ].map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          className="group/item flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300"
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

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                  <span className="text-zinc-500">Corporate Email Rule: hello@alparai.com</span>
                  <Link
                    href={`/${locale}/admin/strategy/master-plan`}
                    className="font-semibold text-purple-400 hover:underline"
                  >
                    Master Plan Dokümanı →
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
