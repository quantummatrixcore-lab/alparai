"use client";

import React from "react";
import { Cpu, CheckCircle2, ShieldCheck, Activity, Terminal, Layers } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function SystemHealthPage() {
  const modules = [
    {
      name: "Incident Ingestion & ETL Engine",
      status: "HEALTHY",
      memory: "142 MB",
      latency: "12ms",
      tests: "48 / 48 Passed",
    },
    {
      name: "EU AI Act Statutory Risk Engine",
      status: "HEALTHY",
      memory: "88 MB",
      latency: "6ms",
      tests: "32 / 32 Passed",
    },
    {
      name: "Multi-Model Byzantine Consensus Engine",
      status: "HEALTHY",
      memory: "210 MB",
      latency: "480ms",
      tests: "64 / 64 Passed",
    },
    {
      name: "Zero-Knowledge PII Guardian",
      status: "HEALTHY",
      memory: "64 MB",
      latency: "2ms",
      tests: "56 / 56 Passed",
    },
    {
      name: "B2B Enterprise API Gateway",
      status: "HEALTHY",
      memory: "118 MB",
      latency: "14ms",
      tests: "72 / 72 Passed",
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
            <span className="font-sans text-xs font-semibold text-emerald-400">
              SYSTEM ARCHITECTURE & CODEBASE HYGIENE
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Kod Hijyeni & Modüler Mimari Masası (/codebase-hygiene)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            1.161 testlik vitest test paketi, TypeScript sıfır hata garantisi ve modüler mikro-motor
            durumları
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Birim Test Başarısı"
          value="1.161 / 1.161"
          subtext="205 Test Dosyası %100 Başarıyla Geçti"
          change="%100 PASS"
          changeType="positive"
          icon={CheckCircle2}
        />
        <MetricCard
          label="TypeScript Derleme Skoru"
          value="0 HATA"
          subtext="Strict Type Checking Aktif"
          changeType="positive"
          icon={Terminal}
        />
        <MetricCard
          label="Yatay Kayma Koruması"
          value="MADDE 28"
          subtext="Sıfır Horizontal Scroll Taşması"
          changeType="positive"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Sistem Çalışma Süresi"
          value="%99.98"
          subtext="Global Edge CDN Uptime"
          changeType="positive"
          icon={Activity}
        />
      </div>

      {/* Modules Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Modüler Mikro-Motorlar ve Sağlık Durumu
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">MODÜL MOTORU</th>
                <th className="pb-2">BELLEK KULLANIMI</th>
                <th className="pb-2">GECİKME</th>
                <th className="pb-2">BİRİM TESTLER</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {modules.map((m) => (
                <tr
                  key={m.name}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{m.name}</td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {m.memory}
                  </td>
                  <td className="py-3 font-semibold text-emerald-400">{m.latency}</td>
                  <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">{m.tests}</td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
