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
import { mockTelemetry, mockComplianceSummary, mockIncidents, mockApiKeys } from "@/lib/admin-mock";

export default function AdminV2OverviewPage() {
  const t = useTranslations("admin");

  const params = useParams();
  const locale = (params?.locale as string) || "en";

  return (
    <div className="space-y-6">
      {/* 1. Executive OS Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              EXECUTIVE OS
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              360° MASTER COMMAND DECK
            </span>
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-[#1f2328] md:text-2xl dark:text-[#f0f6fc]">
            {t("enterprise_command_deck")}
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            2.763 Olaylık Veri Kalkanı, EU AI Act Uyum Radarı ve B2B Kurumsal API Operasyonları
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href={`/${locale}/admin/incidents`}
            className="flex items-center gap-1.5 rounded-md border border-[#d0d7de] bg-zinc-900/80 px-3 py-1.5 font-mono text-xs text-[#656d76] shadow-sm transition-colors hover:border-cyan-500/30 hover:text-[#1f2328] dark:border-[#30363d] dark:text-[#c9d1d9] dark:text-[#f0f6fc]"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span>Olay Masası</span>
          </Link>
          <Link
            href={`/${locale}/admin/api-keys`}
            className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-cyan-500"
          >
            <KeyRound className="h-3.5 w-3.5 text-white" />
            <span className="!text-white">B2B API & Hunter</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Deck (4 Core Pillars) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Toplam İndekslenen Olay"
          value={mockTelemetry.totalIndexedIncidents.toLocaleString()}
          subtext={`%82 Kamu Taraması (${mockTelemetry.publicScrapedCount}) / %18 İhbar (${mockTelemetry.humanWhistleblowerCount})`}
          change="+24 vaka/gün"
          changeType="positive"
          icon={Database}
          badge="DATA MOAT"
          sparkline="up"
        />

        <MetricCard
          label="B2B API Geliri & Hızı"
          value="$94.2k MRR"
          subtext={`Ortalama Gecikme: ${mockTelemetry.averageApiLatencyMs}ms / %${mockTelemetry.apiDeliveryUptime} Uptime`}
          change="+%18.4 MoM"
          changeType="positive"
          icon={KeyRound}
          badge="TIER 1-3"
          sparkline="up"
        />

        <MetricCard
          label="EU AI Act Ceza Riski"
          value="€87.5M"
          subtext={`Madde 99 Kapsamında ${mockComplianceSummary.prohibitedPracticesDetected} Yasaklı / ${mockComplianceSummary.totalMonitoredSystems} Yüksek Riskli Sistem`}
          change="35M€ Max Vaka"
          changeType="alert"
          icon={Gavel}
          badge="ART 99"
          sparkline="down"
        />

        <MetricCard
          label="Madde 73 SLA Geri Sayımı"
          value={`${mockComplianceSummary.criticalSLACountdowns} Kritik Vaka`}
          subtext="72 Saatlik Yasal Bildirim Penceresi İçinde Kalan Olaylar"
          change="< 14.5h Kalan"
          changeType="negative"
          icon={Clock}
          badge="72h SLA"
          sparkline="down"
        />
      </div>

      {/* 3. Mid Grid: Live Incident Triage + EU AI Act Compliance Barometer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Real-Time Incident Ingestion Stream */}
        <div className="space-y-4 rounded-xl border border-[#d0d7de] bg-zinc-950/70 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl lg:col-span-2 dark:border-[#30363d]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              <h2 className="font-mono text-sm font-bold tracking-wide text-[#1f2328] dark:text-[#f0f6fc]">
                Canlı Olay Masası & SLA Takibi
              </h2>
            </div>
            <Link
              href={`/${locale}/admin/incidents`}
              className="flex items-center gap-1 font-mono text-xs text-zinc-400 transition-colors hover:text-cyan-300 dark:text-[#8b949e] dark:text-[#656d76]"
            >
              <span>Tüm 2.763 Olayı İncele</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                  <th className="w-32 pb-2.5 font-medium">TAKİP NO</th>
                  <th className="w-44 pb-2.5 font-medium">HEDEF MODEL</th>
                  <th className="w-36 pb-2.5 font-medium">KAYNAK</th>
                  <th className="w-40 pb-2.5 font-medium">AB MADDESİ</th>
                  <th className="w-28 pb-2.5 font-medium">SLA KALAN</th>
                  <th className="w-28 pb-2.5 text-right font-medium">DURUM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {mockIncidents.slice(0, 4).map((inc) => (
                  <tr
                    key={inc.id}
                    className="group transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                  >
                    <td className="py-3 font-semibold text-cyan-400 tabular-nums">
                      {inc.trackingNumber}
                    </td>
                    <td className="py-3 text-zinc-200">
                      <div className="truncate font-medium">{inc.modelTarget}</div>
                      <span className="font-mono text-[10px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                        {inc.provider}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge type="source" value={inc.source} />
                    </td>
                    <td className="py-3">
                      <StatusBadge type="compliance" value={inc.euAiActTag} />
                    </td>
                    <td className="py-3 font-mono tabular-nums">
                      {inc.slaRemainingHours > 0 ? (
                        <span
                          className={`font-semibold ${
                            inc.slaRemainingHours < 24
                              ? "animate-pulse text-rose-400"
                              : "text-amber-400"
                          }`}
                        >
                          {inc.slaRemainingHours} saat
                        </span>
                      ) : (
                        <span className="text-[#656d76] dark:text-[#8b949e]">Tamamlandı</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge type="status" value={inc.status} />
                    </td>
                  </tr>
                ))}
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
                <h2 className="font-mono text-sm font-bold tracking-wide text-[#1f2328] dark:text-[#f0f6fc]">
                  B2B Kurumsal API Akışı
                </h2>
              </div>
              <Link
                href={`/${locale}/admin/api-keys`}
                className="font-mono text-xs text-zinc-400 transition-colors hover:text-cyan-300 dark:text-[#8b949e] dark:text-[#656d76]"
              >
                Yönet
              </Link>
            </div>

            <p className="text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              Allianz, JPMorgan ve Swiss Re dahil 18 kurumsal aboneye sağlanan gerçek zamanlı AI
              tehdit ve aktüeryal kaza verisi akışı.
            </p>

            <div className="space-y-2.5 pt-2">
              {mockApiKeys.slice(0, 3).map((key) => (
                <div
                  key={key.id}
                  className="space-y-1.5 rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="max-w-[180px] truncate font-semibold text-zinc-200">
                      {key.organizationName}
                    </span>
                    <span className="font-mono font-medium text-emerald-400 tabular-nums">
                      ${key.monthlyRateUsd.toLocaleString()}/ay
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    <span className="tabular-nums">
                      {(key.requestsThisMonth / 1000).toFixed(0)}k /{" "}
                      {(key.requestQuotaMonthly / 1000).toFixed(0)}k İstek
                    </span>
                    <span className="font-semibold text-emerald-400">Aktif</span>
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
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#d0d7de] pt-3 font-mono text-xs text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
            <span>Toplam Aylık Tüketim:</span>
            <span className="font-bold text-zinc-200 tabular-nums">12.9M İstek</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom 5-Cluster Navigation Quick Deck */}
      <div className="space-y-3 rounded-xl border border-[#d0d7de] bg-zinc-950/70 p-5 shadow-2xl shadow-black/80 backdrop-blur-xl dark:border-[#30363d]">
        <h3 className="font-mono text-xs font-bold tracking-wider text-zinc-400 uppercase dark:text-[#8b949e] dark:text-[#656d76]">
          360° Yönetim Kümeleri Hızlı Erişim
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          <Link
            href={`/${locale}/admin/cross-audit`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>Çoklu Model</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              5-Model Konsensüs Denetimi
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/social`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>Sosyal Stüdyo</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              Peak-Hour İçerik & Veo 2
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/investors`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>VC & Data Room</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              Sequoia & Index Pipeline
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/grants`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>Hibe Otopilotu</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              18.7M₺ TÜBİTAK / KOSGEB
            </p>
          </Link>

          <Link
            href={`/${locale}/admin/data-moat`}
            className="group transform-gpu rounded-lg border border-white/[0.05] bg-zinc-900/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-500/30"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
              <span>Veri Kalkanı</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#656d76] group-hover:text-cyan-400 dark:text-[#8b949e]" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              2.763 Olay & Bot Taraması
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
