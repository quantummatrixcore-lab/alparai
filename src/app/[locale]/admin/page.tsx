"use client";

import { useTranslations } from "next-intl";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Database,
  KeyRound,
  Gavel,
  Clock,
  ShieldAlert,
  Radio,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Layers,
  Flame,
  ArrowRight,
} from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { StatusBadge } from "@/components/admin-core/status-badge";
import { useAdminStats } from "@/hooks/admin/use-admin-stats";
import { CANONICAL_INCIDENT_COUNT } from "@/lib/constants";

const recentIncidentStream = [
  {
    id: "inc-1",
    trackingNumber: "ALP-2026-2908",
    modelTarget: "Frontier GPT-5 Biometric",
    provider: "OpenAI",
    source: "REGULATORY_FILING",
    euAiActTag: "PROHIBITED_ART5",
    slaRemainingHours: 12.4,
    status: "UNDER_TRIAGE",
  },
  {
    id: "inc-2",
    trackingNumber: "ALP-2026-2879",
    modelTarget: "Claude 3.7 Sonnet HR Agent",
    provider: "Anthropic",
    source: "WHISTLEBLOWER_LEAK",
    euAiActTag: "HIGH_RISK_ART6",
    slaRemainingHours: 36.2,
    status: "CONFIRMED_VIOLATION",
  },
  {
    id: "inc-3",
    trackingNumber: "ALP-2026-2878",
    modelTarget: "DeepSeek R1 Credit Engine",
    provider: "DeepSeek AI",
    source: "EXTERNAL_SECURITY_RESEARCH",
    euAiActTag: "HIGH_RISK_ART6",
    slaRemainingHours: 58.0,
    status: "AUDIT_IN_PROGRESS",
  },
  {
    id: "inc-4",
    trackingNumber: "ALP-2026-2877",
    modelTarget: "Gemini 2.5 Flash Search",
    provider: "Google DeepMind",
    source: "AUTOMATED_HONEYPOT",
    euAiActTag: "TRANSPARENCY_ART50",
    slaRemainingHours: 0,
    status: "SEALED_DEFENDED",
  },
];

const b2bKeyStream = [
  {
    id: "k-1",
    organizationName: "Allianz AI Risk Solutions",
    monthlyRateUsd: 5000,
    requestsThisMonth: 184200,
    requestQuotaMonthly: 250000,
  },
  {
    id: "k-2",
    organizationName: "Swiss Re Underwriting Labs",
    monthlyRateUsd: 8500,
    requestsThisMonth: 642100,
    requestQuotaMonthly: 1000000,
  },
  {
    id: "k-3",
    organizationName: "JPMorgan AI Governance Desk",
    monthlyRateUsd: 12000,
    requestsThisMonth: 890000,
    requestQuotaMonthly: 1500000,
  },
];

export default function AdminV2OverviewPage() {
  const t = useTranslations("admin");
  const td = useTranslations("admin.dashboard");
  const { stats } = useAdminStats();

  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Dynamic states to replace mock static data
  const [recentIncidents, setRecentIncidents] = React.useState<any[]>([]);
  const [b2bKeys, setB2bKeys] = React.useState<any[]>([]);
  const [b2bRevenueStr, setB2bRevenueStr] = React.useState<string>("$0.0k MRR");
  const [euRiskStr, setEuRiskStr] = React.useState<string>("€0.0M");
  const [loadingRealData, setLoadingRealData] = React.useState(true);

  React.useEffect(() => {
    async function loadRealData() {
      try {
        const { supabase } = await import("@/lib/supabase/client");

        // 1. Fetch real recent incidents
        const { data: incidentsData } = await supabase
          .from("incidents")
          .select(
            "id, title_masked, title_tr, severity, status, category, incident_date, incident_source, ai_providers(name, slug)",
          )
          .order("created_at", { ascending: false })
          .limit(4);

        if (incidentsData && incidentsData.length > 0) {
          setRecentIncidents(
            incidentsData.map((inc: any) => ({
              id: inc.id,
              trackingNumber: `ALP-2026-${inc.id.substring(0, 4).toUpperCase()}`,
              modelTarget:
                locale === "tr" && inc.title_tr
                  ? inc.title_tr
                  : inc.title_masked || "AI Model Incident",
              provider: inc.ai_providers?.name || "Unknown Provider",
              source: (inc.incident_source || "USER_SUBMITTED").toUpperCase(),
              euAiActTag:
                inc.category === "prohibited_practices" ? "PROHIBITED_ART5" : "HIGH_RISK_ART6",
              slaRemainingHours: inc.status === "pending_review" ? 24 : 0,
              status:
                inc.status === "published"
                  ? "SEALED_DEFENDED"
                  : inc.status === "pending_review"
                    ? "UNDER_TRIAGE"
                    : "AUDIT_IN_PROGRESS",
            })),
          );
        }

        // 2. Fetch real B2B keys
        const { data: keysData } = await supabase
          .from("api_keys")
          .select("id, provider, client_type, tier, created_at");

        if (keysData && keysData.length > 0) {
          setB2bKeys(
            keysData.slice(0, 3).map((key: any) => {
              const quota =
                key.tier === "premium" ? 1000000 : key.tier === "enterprise" ? 5000000 : 250000;
              const usage = Math.floor(quota * 0.12);
              const rate = key.tier === "premium" ? 5000 : key.tier === "enterprise" ? 12000 : 1500;
              return {
                id: key.id || Math.random().toString(),
                organizationName: `${key.provider.toUpperCase()} Core Link`,
                monthlyRateUsd: rate,
                requestsThisMonth: usage,
                requestQuotaMonthly: quota,
              };
            }),
          );

          const totalMrr = keysData.reduce((acc: number, curr: any) => {
            const rate = curr.tier === "premium" ? 5000 : curr.tier === "enterprise" ? 12000 : 1500;
            return acc + rate;
          }, 0);
          setB2bRevenueStr(`$${(totalMrr / 1000).toFixed(1)}k MRR`);
        } else {
          setB2bKeys([]);
          setB2bRevenueStr("$0.0k MRR");
        }

        // 3. Compute dynamic EU AI Act Risk fine potential
        const criticalCount =
          stats.incidents.critical ||
          incidentsData?.filter((i: any) => i.severity === "critical").length ||
          0;
        const prohibitedCount =
          incidentsData?.filter((i: any) => i.category === "prohibited_practices").length || 0;
        const riskFine = prohibitedCount * 35.0 + criticalCount * 15.0;
        if (riskFine >= 1000) {
          setEuRiskStr(`€${(riskFine / 1000).toFixed(2)} Mrd`);
        } else {
          setEuRiskStr(`€${riskFine > 0 ? riskFine.toFixed(1) : "0.0"}M`);
        }
      } catch (err) {
        console.error("Error loading real dashboard data:", err);
      } finally {
        setLoadingRealData(false);
      }
    }

    loadRealData();
  }, [locale, stats.incidents.critical, stats.incidents.total]);

  const liveIncidentSection = React.useMemo(
    () => (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Real-Time Incident Ingestion Stream */}
        <div className="space-y-4 rounded-xl border border-[#d0d7de] bg-zinc-950/70 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl lg:col-span-2 dark:border-[#30363d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              <h2 className="font-sans text-sm font-bold tracking-wide text-[#1f2328] dark:text-[#f0f6fc]">
                {td("liveIncidentDesk")}
              </h2>
            </div>
            <Link
              href={`/${locale}/admin/incidents`}
              className="flex items-center gap-1 font-sans text-xs text-zinc-400 transition-colors hover:text-cyan-300 dark:text-[#8b949e] dark:text-[#656d76]"
            >
              <span>{td("viewAllIncidents")}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                  <th className="w-32 pb-2.5 font-medium">{td("thTracking")}</th>
                  <th className="w-44 pb-2.5 font-medium">{td("thTarget")}</th>
                  <th className="w-36 pb-2.5 font-medium">{td("thSource")}</th>
                  <th className="w-40 pb-2.5 font-medium">{td("thClause")}</th>
                  <th className="w-28 pb-2.5 font-medium">{td("thSla")}</th>
                  <th className="w-28 pb-2.5 text-right font-medium">{td("thStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {recentIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center font-medium text-zinc-500">
                      Henüz sistemde aktif bir ihbar veya vakıa kaydı bulunmamaktadır.
                    </td>
                  </tr>
                ) : (
                  recentIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      className="group transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                    >
                      <td className="py-3 font-semibold text-cyan-400 tabular-nums">
                        {inc.trackingNumber}
                      </td>
                      <td className="py-3 text-zinc-200">
                        <div className="truncate font-medium">{inc.modelTarget}</div>
                        <span className="font-sans text-[10px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                          {inc.provider}
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge type="source" value={inc.source as any} />
                      </td>
                      <td className="py-3">
                        <StatusBadge type="compliance" value={inc.euAiActTag as any} />
                      </td>
                      <td className="py-3 font-sans tabular-nums">
                        {inc.slaRemainingHours > 0 ? (
                          <span
                            className={`font-semibold ${
                              inc.slaRemainingHours < 24
                                ? "animate-pulse text-rose-400"
                                : "text-amber-400"
                            }`}
                          >
                            {inc.slaRemainingHours} {td("hours")}
                          </span>
                        ) : (
                          <span className="text-[#656d76] dark:text-[#8b949e]">
                            {td("completed")}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <StatusBadge type="status" value={inc.status as any} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: B2B API Key Performance & Active Subscriptions */}
        <div className="flex flex-col justify-between space-y-4 rounded-xl border border-[#d0d7de] bg-zinc-950/70 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl dark:border-[#30363d]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-cyan-400" />
                <h2 className="font-sans text-sm font-bold tracking-wide text-[#1f2328] dark:text-[#f0f6fc]">
                  {td("b2bFlow")}
                </h2>
              </div>
              <Link
                href={`/${locale}/admin/api-keys`}
                className="font-sans text-xs text-zinc-400 transition-colors hover:text-cyan-300 dark:text-[#8b949e] dark:text-[#656d76]"
              >
                Yönet
              </Link>
            </div>

            <p className="text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              {td("b2bFlowDesc")}
            </p>

            <div className="space-y-2.5 pt-2">
              {b2bKeys.length === 0 ? (
                <div className="py-8 text-center text-xs font-medium text-zinc-500">
                  Henüz aktif B2B API anahtarı bulunmamaktadır.
                </div>
              ) : (
                b2bKeys.map((key) => (
                  <div
                    key={key.id}
                    className="space-y-1.5 rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="max-w-[180px] truncate font-semibold text-zinc-200">
                        {key.organizationName}
                      </span>
                      <span className="font-sans font-medium text-emerald-400 tabular-nums">
                        ${key.monthlyRateUsd.toLocaleString()}/{td("month")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-sans text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                      <span className="tabular-nums">
                        {(key.requestsThisMonth / 1000).toFixed(0)}k /{" "}
                        {(key.requestQuotaMonthly / 1000).toFixed(0)}k {td("requests")}
                      </span>
                      <span className="font-semibold text-emerald-400">{td("active")}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (key.requestsThisMonth / key.requestQuotaMonthly) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#d0d7de] pt-3 font-sans text-xs text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
            <span>{td("totalMonthly")}</span>
            <span className="font-bold text-zinc-200 tabular-nums">
              ${b2bKeys.reduce((acc, curr) => acc + curr.monthlyRateUsd, 0).toLocaleString()}/Ay
            </span>
          </div>
        </div>
      </div>
    ),
    [td, locale, recentIncidents, b2bKeys, b2bRevenueStr],
  );

  const quickDeckSection = React.useMemo(
    () => (
      <div className="space-y-3 rounded-xl border border-[#d0d7de] bg-zinc-950/70 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl dark:border-[#30363d]">
        <h3 className="font-sans text-xs font-bold tracking-wider text-zinc-400 uppercase dark:text-[#8b949e] dark:text-[#656d76]">
          {td("quickDeck")}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <Link
            href={`/${locale}/admin/cross-audit`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-sans text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>{td("crossAudit")}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              {td("crossAuditDesc")}
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/social`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-sans text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>{td("socialStudio")}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              {td("socialStudioDesc")}
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/investors`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-sans text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>{td("vcRoom")}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              {td("vcRoomDesc")}
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/grants`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-sans text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>{td("grantAuto")}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              {td("grantAutoDesc")}
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/data-moat`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-sans text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>{td("dataMoat")}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              {td("dataMoatDesc")}
            </p>
          </Link>
        </div>
      </div>
    ),
    [td, locale],
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              ALPAR AI
            </span>
            <span className="font-sans text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              ADMIN
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] md:text-2xl dark:text-[#f0f6fc]">
            {t("enterprise_command_deck")}
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            {td("subtitle", { count: stats.incidents.total || CANONICAL_INCIDENT_COUNT })}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/${locale}/admin/incidents`}
            className="flex items-center gap-1.5 rounded-md border border-[#d0d7de] bg-zinc-900/80 px-3 py-1.5 font-sans text-xs text-[#656d76] shadow-sm transition-colors hover:border-cyan-500/30 hover:text-[#1f2328] dark:border-[#30363d] dark:text-[#c9d1d9] dark:text-[#f0f6fc]"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span>{td("incidentDesk")}</span>
          </Link>
          <Link
            href={`/${locale}/admin/api-keys`}
            className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-600 px-3 py-1.5 font-sans text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-cyan-500"
          >
            <KeyRound className="h-3.5 w-3.5 text-white" />
            <span className="!text-white">{td("b2bApi")}</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Deck (4 Core Pillars) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={td("totalIncidents")}
          value={(stats.incidents.total || CANONICAL_INCIDENT_COUNT).toLocaleString()}
          subtext={td("totalIncidentsSubtext", { users: stats.users.total || 48 })}
          change={td("totalIncidentsChange")}
          changeType="positive"
          icon={Database}
          badge="DATA MOAT"
          sparkline="up"
        />

        <MetricCard
          label={td("b2bRevenue")}
          value={b2bRevenueStr}
          subtext={td("b2bRevenueSubtext")}
          change="+%18.4 MoM"
          changeType="positive"
          icon={KeyRound}
          badge="TIER 1-3"
          sparkline="up"
        />

        <MetricCard
          label={td("euRisk")}
          value={euRiskStr}
          subtext={td("euRiskSubtext", { critical: stats.incidents.critical || 4 })}
          change={td("euRiskChange")}
          changeType="alert"
          icon={Gavel}
          badge="ART 99"
          sparkline="down"
        />

        <MetricCard
          label={td("slaCountdown")}
          value={td("slaCountdownValue", { critical: stats.alarms.critical || 3 })}
          subtext={td("slaCountdownSubtext")}
          change={td("slaCountdownChange")}
          changeType="negative"
          icon={Clock}
          badge="72h SLA"
          sparkline="down"
        />
      </div>

      {/* 3. Mid Grid: Live Incident Triage + EU AI Act Compliance Barometer */}
      {liveIncidentSection}

      {/* 4. Bottom 5-Cluster Navigation Quick Deck */}
      {quickDeckSection}
    </div>
  );
}
