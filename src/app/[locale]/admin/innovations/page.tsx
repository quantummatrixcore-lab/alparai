"use client";

import React from "react";
import { Sparkles, Lightbulb, GitBranch, Rocket, CheckCircle2, Plus } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function InnovationsPage() {
  const roadmap = [
    {
      phase: "Q3 2026 (Mevcut)",
      title: "Alparai Admin & B2B API Gateway",
      status: "COMPLETED",
      progress: 100,
      desc: "5-Küme kurumsal mimari, 2.908 vaka veri kalkanı ve Tier 1-3 API dağıtımı.",
    },
    {
      phase: "Q4 2026",
      title: "Otonom Sigorta Aktüeryal Risk Simülatörü v2",
      status: "IN_DEVELOPMENT",
      progress: 65,
      desc: "Allianz ve Munich Re için anlık Monte Carlo kaza simülasyon motoru.",
    },
    {
      phase: "Q1 2027",
      title: "Edge Hardware AI Safety Dongle & On-Prem Entegrasyon",
      status: "RESEARCHING",
      progress: 25,
      desc: "Bankaların hava boşluklu (air-gapped) sistemlerinde yerel zafiyet denetimi.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 4: EKOSİSTEM & TEKNOLOJİ
            </span>
            <span className="font-sans text-xs font-semibold text-cyan-400">
              R&D & PATENT INNOVATION PIPELINE
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            İnovasyon & Ar-Ge Yol Haritası Masası (/innovations)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Patent başvuruları, yeni yapay zeka denetim algoritmaları ve geleceğin Ar-Ge ürün yol
            haritası
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-cyan-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Ar-Ge İnovasyonu Ekle</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Patent Başvuruları"
          value="4 Patent Dosyası"
          subtext="Byzantine Multi-LLM Consensus & Zero-Knowledge PII"
          changeType="positive"
          icon={Sparkles}
        />
        <MetricCard
          label="Aktif Ar-Ge Projeleri"
          value="6 İnovasyon"
          subtext="TÜBİTAK 1507 & Horizon Destekli"
          icon={Lightbulb}
        />
        <MetricCard
          label="Yol Haritası Gerçekleşme"
          value="%96.2"
          subtext="Sprint Hedeflerine Tam Uyum"
          changeType="positive"
          icon={Rocket}
        />
      </div>

      {/* Roadmap List */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Stratejik Ürün & İnovasyon Yol Haritası
        </h2>

        <div className="space-y-4">
          {roadmap.map((r) => (
            <div
              key={r.title}
              className="space-y-2 rounded-lg border border-[#d0d7de] bg-zinc-950 p-4 dark:border-[#30363d]"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400">{r.phase}</span>
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                    r.status === "COMPLETED"
                      ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                      : "border-zinc-700 bg-zinc-800 text-[#656d76] dark:text-[#c9d1d9]"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <h3 className="font-sans text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                {r.title}
              </h3>
              <p className="font-sans text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                {r.desc}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${r.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
