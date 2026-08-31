"use client";

import React from "react";
import { ShieldCheck, Lock, FileText, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function TransparencyPage() {
  const threats = [
    {
      id: "SLAPP-01",
      firm: "Enterprise AI Vendor Legal Counsel",
      target: "ALP-2026-2908 (Biometric Bias)",
      status: "DEFENDED_SEALED",
      date: "2026-08-27",
      defense: "Anti-SLAPP Directive (EU 2024/1069) Uyarınca Kamu Yararı Koruması Devreye Alındı.",
    },
    {
      id: "SLAPP-02",
      firm: "FinTech Algorithmic Lending LLM",
      target: "ALP-2026-2761 (KYC Leak)",
      status: "COUNTER_NOTICE_SENT",
      date: "2026-08-25",
      defense: "SHA-256 Değiştirilemez Delil Kaydı Resmi İhlal Raporuna Eklendi.",
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
            <span className="font-sans text-xs font-semibold text-blue-400">
              STREISAND LEGAL THREAT SHIELD
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Streisand Hukuk Kalkanı & CE Doğrulama
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Büyük teknoloji şirketlerinden gelen haksız yayından kaldırma (SLAPP) ihtarlarına karşı
            kriptografik koruma
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Püskürtülen Tehditler"
          value="18 İhtar"
          subtext="%100 Savunma Başarısı / Sıfır Geri Adım"
          changeType="positive"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Kriptografik Mühürler"
          value="2.908 Vaka"
          subtext="SHA-256 Zaman Damgasıyla Değiştirilemez Delil"
          icon={Lock}
        />
        <MetricCard
          label="CE İşareti Uyumu"
          value="Madde 48"
          subtext="AB Standartlarında Conformity Dossier"
          icon={FileText}
        />
      </div>

      {/* Threats Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-sans text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Aktif ve Püskürtülmüş Yasal İhtarlar Günlüğü
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">İHTAR KODU</th>
                <th className="pb-2">GÖNDEREN TARAF</th>
                <th className="pb-2">HEDEF VAKA</th>
                <th className="pb-2">HUKUKİ SAVUNMA REÇETESİ</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {threats.map((t) => (
                <tr
                  key={t.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{t.id}</td>
                  <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">{t.firm}</td>
                  <td className="py-3 font-semibold text-blue-400">{t.target}</td>
                  <td className="max-w-xs py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {t.defense}
                  </td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {t.status}
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
