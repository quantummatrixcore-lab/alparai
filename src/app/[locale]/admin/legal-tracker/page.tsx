"use client";

import React from "react";
import { Gavel, Globe, Clock, ShieldCheck, AlertCircle, FileText } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function LegalTrackerPage() {
  const regulations = [
    {
      jurisdiction: "Avrupa Birliği (AB)",
      law: "EU AI Act (Regulation 2024/1689)",
      status: "YÜRÜRLÜKTE (Madde 5 Yasaklı AI)",
      nextDeadline: "Ağustos 2026: GPAI Yükümlülükleri",
      severity: "HIGH",
    },
    {
      jurisdiction: "Amerika Birleşik Devletleri (ABD)",
      law: "White House Executive Order 14110 & NIST AI RMF",
      status: "UYGULAMADA (Kritik Altyapı Denetimi)",
      nextDeadline: "Ekim 2026: Zorunlu Güvenlik Testleri",
      severity: "MEDIUM",
    },
    {
      jurisdiction: "Birleşik Krallık (UK)",
      law: "UK AI Safety Institute & Frontier Model Framework",
      status: "GÖNÜLLÜ TAAHHÜT -> YASAL DÜZENLEME",
      nextDeadline: "Aralık 2026: Yasal Denetim Paketi",
      severity: "MEDIUM",
    },
    {
      jurisdiction: "Çin (CAC)",
      law: "Generative AI Interim Measures & Algorithmic Registry",
      status: "YÜRÜRLÜKTE (Kayıt ve Güvenlik İncelemesi)",
      nextDeadline: "Sürekli Güncelleme",
      severity: "HIGH",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 1: HESAP VEREBİLİRLİK
            </span>
            <span className="font-sans text-xs font-semibold text-cyan-400">
              GLOBAL AI JURISDICTION RADAR
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Küresel Yapay Zeka Hukuk & Mevzuat Takipçisi (/legal-tracker)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            AB, ABD, Çin ve İngiltere'deki yapay zeka kanunları, resmi regülatif bültenler ve uyum
            takvimi
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="İzlenen Hukuki Yargı Alanı"
          value="34 Ülke / Birlik"
          subtext="AB, ABD, Çin, UK, Japonya, Singapur"
          icon={Globe}
        />
        <MetricCard
          label="Yaklaşan Yasal Son Tarihler"
          value="4 Kritik Tarih"
          subtext="GPAI ve Model Raporlama Zorunlulukları"
          changeType="alert"
          icon={Clock}
        />
        <MetricCard
          label="Alparai Regülatif Uyumu"
          value="%100 TAM UYUMLU"
          subtext="Tüm Küresel Standartlara Entegre"
          changeType="positive"
          icon={ShieldCheck}
        />
      </div>

      {/* Regulations Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Küresel AI Mevzuatları ve Yasal Geri Sayım Masası
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">YARGI ALANI</th>
                <th className="pb-2">YASA / MEVZUAT ADI</th>
                <th className="pb-2">MEVCUT HUKUKİ STATÜ</th>
                <th className="pb-2">SONRAKİ YASAL ZORUNLULUK</th>
                <th className="pb-2 text-right">ÖNEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {regulations.map((r) => (
                <tr
                  key={r.jurisdiction}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{r.jurisdiction}</td>
                  <td className="py-3 font-sans font-semibold text-cyan-400">{r.law}</td>
                  <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">{r.status}</td>
                  <td className="py-3 font-semibold text-amber-400">{r.nextDeadline}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        r.severity === "HIGH"
                          ? "border-rose-800 bg-rose-950/60 text-rose-300"
                          : "border-zinc-700 bg-zinc-800 text-[#656d76] dark:text-[#c9d1d9]"
                      }`}
                    >
                      {r.severity}
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
