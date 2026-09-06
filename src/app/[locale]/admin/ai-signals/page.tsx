"use client";

import React from "react";
import { Radio, AlertTriangle, ShieldCheck, Flame, ArrowUpRight } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function AISignalsPage() {
  const alerts = [
    {
      id: "SIG-901",
      model: "GPT-4o Tool-Calling Agent",
      type: "Prompt Injection Spike",
      zScore: 4.82,
      velocity: "142 bahs/dk",
      status: "CRITICAL_ALARM",
      defense: "WAF Kuralı SecRule #100982 CISO Webhook İle Fırlatıldı",
    },
    {
      id: "SIG-902",
      model: "Claude 3.5 Sonnet Vision",
      type: "PII Extraction Attempt",
      zScore: 3.91,
      velocity: "88 bahs/dk",
      status: "HIGH_ALERT",
      defense: "İlgili Endpointler Geçici Olarak İzolasyona Alındı",
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
            <span className="font-sans text-xs font-semibold text-rose-400">
              EWMA Z-SCORE SPIKE DETECTION
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            AI Ekosistem Sinyalleri & Tehdit Patlaması Radarı
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            İnternet genelinde belirli modellerde anlık zafiyet ve kaza patlamalarını yakalayan
            erken uyarı radarı
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Aktif Tehdit Patlaması"
          value="2 Kriz Sinyali"
          subtext="Z-Score >= 3.5 Eşiği Aşıldı"
          change="P0 Alarmı"
          changeType="alert"
          icon={Flame}
        />
        <MetricCard
          label="CISO Webhook İletimleri"
          value="48 İmzalı Olay"
          subtext="HMAC-SHA256 Doğrulanmış Savunma Reçeteleri"
          changeType="positive"
          icon={Radio}
        />
        <MetricCard
          label="İzlenen Model Ekosistemi"
          value="84 LLM / VLM"
          subtext="OpenAI, Anthropic, Google, Meta, Mistral"
          icon={ShieldCheck}
        />
      </div>

      {/* Signals Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-sans text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Anlık Algılanan Tehdit Sinyalleri ve Karşı Savunma Aksiyonları
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">SİNYAL NO</th>
                <th className="pb-2">HEDEF MODEL</th>
                <th className="pb-2">TEHDİT TÜRÜ</th>
                <th className="pb-2">Z-SCORE / DEBİ</th>
                <th className="pb-2">OTOMATİK SAVUNMA REÇETESİ</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {alerts.map((a) => (
                <tr
                  key={a.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{a.id}</td>
                  <td className="py-3 font-semibold text-[#656d76] dark:text-[#c9d1d9]">
                    {a.model}
                  </td>
                  <td className="py-3 text-rose-400">{a.type}</td>
                  <td className="py-3 font-bold text-amber-400">
                    Z={a.zScore} ({a.velocity})
                  </td>
                  <td className="max-w-xs truncate py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {a.defense}
                  </td>
                  <td className="py-3 text-right">
                    <span className="animate-pulse rounded border border-rose-800 bg-rose-950/60 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                      {a.status}
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
