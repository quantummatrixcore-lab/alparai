"use client";

import React from "react";
import { Lock, ShieldCheck, EyeOff, CheckCircle2, RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function VaultPage() {
  const logs = [
    {
      id: "PII-901",
      source: "ALP-2026-2908 (HR Chatbot)",
      detectedType: "TC Kimlik No (MERNIS Mod-10/11)",
      maskedValue: "3482******8",
      action: "ZERO_KNOWLEDGE_SCRUBBED",
      timestamp: "2026-08-28 22:15",
    },
    {
      id: "PII-902",
      source: "ALP-2026-2761 (Banking Assistant)",
      detectedType: "IBAN (ISO Mod-97)",
      maskedValue: "TR42 ****************** 90",
      action: "ZERO_KNOWLEDGE_SCRUBBED",
      timestamp: "2026-08-27 11:20",
    },
    {
      id: "PII-903",
      source: "ALP-2026-2758 (Credit Card Jailbreak)",
      detectedType: "Credit Card (Luhn Mod-10)",
      maskedValue: "4543 **** **** 8812",
      action: "ZERO_KNOWLEDGE_SCRUBBED",
      timestamp: "2026-08-26 09:40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 5: AKADEMİ & YÖNETİŞİM
            </span>
            <span className="font-sans text-xs font-semibold text-emerald-400">
              ZERO-KNOWLEDGE PII GUARDIAN
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Sıfır-Bilgi PII Kasası & Arındırma Günlüğü
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            MERNİS, IBAN ve Kredi Kartı algoritmalarıyla hassas kişisel verileri tek yönlü
            kriptografik maskeleme
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Arındırılan PII Veri Noktası"
          value="14.820 Kayıt"
          subtext="TC Kimlik, IBAN, Kredi Kartı ve Özel API Anahtarları"
          changeType="positive"
          icon={EyeOff}
        />
        <MetricCard
          label="Sıfır-Bilgi Güvenlik Skoru"
          value="%100.0"
          subtext="Veritabanında Tek Bir Çözülebilir PII Tutulmaz"
          changeType="positive"
          icon={ShieldCheck}
        />
        <MetricCard
          label="KVKK & GDPR Uyumu"
          value="TAM UYUMLU"
          subtext="Denetlenebilir Kriptografik İmha Günlüğü"
          icon={Lock}
        />
      </div>

      {/* Redaction Logs Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-sans text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Son Gerçekleşen Otomatik PII Maskeleme Olayları
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">İŞLEM NO</th>
                <th className="pb-2">KAYNAK VAKA</th>
                <th className="pb-2">TESPİT EDİLEN PII TÜRÜ</th>
                <th className="pb-2">MASKELEME ÇIKTISI</th>
                <th className="pb-2">ZAMAN</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {logs.map((l) => (
                <tr
                  key={l.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{l.id}</td>
                  <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">{l.source}</td>
                  <td className="py-3 font-semibold text-amber-400">{l.detectedType}</td>
                  <td className="py-3 font-sans text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {l.maskedValue}
                  </td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {l.timestamp}
                  </td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {l.action}
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
