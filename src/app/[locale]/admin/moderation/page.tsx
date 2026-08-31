"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Eye, Filter } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function ModerationPage() {
  const flags = [
    {
      id: "MOD-801",
      target: "ALP-2026-2908 Yorumu",
      author: "anon_researcher_99",
      reason: "Hakaret / Şirket Karalama İddiası",
      severity: "MEDIUM",
      status: "PENDING_REVIEW",
    },
    {
      id: "MOD-802",
      target: "Kullanıcı İhbarı #419",
      author: "whistleblower_xyz",
      reason: "PII Sızıntısı Şüphesi (Maskeleme Gerekiyor)",
      severity: "HIGH",
      status: "AUTOMATIC_QUARANTINED",
    },
    {
      id: "MOD-803",
      target: "Dilemma #02 Yorumu",
      author: "legal_advocate",
      reason: "Spam / Link Gönderimi",
      severity: "LOW",
      status: "CLEARED",
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
            <span className="font-sans text-xs font-semibold text-amber-400">
              COMMUNITY & SUBMISSION MODERATION
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Topluluk İçerik & İhbar Moderasyon Masası
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Kullanıcı yorumları, şüpheli spam ihbarlar ve karantinaya alınan içeriklerin denetim
            merkezi
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="İnceleme Bekleyenler"
          value="4 Bildirim"
          subtext="Otomatik Filtre Tarafından Bayraklananlar"
          changeType="alert"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Otomatik Karantina"
          value="18 Kayıt"
          subtext="PII Guardian Tarafından İzole Edildi"
          changeType="positive"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Onaylanan Temiz İçerikler"
          value="1.420 Yorum"
          subtext="Topluluk Tartışmaları Canlıda"
          icon={CheckCircle}
        />
      </div>

      {/* Moderation Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Bayraklanan İçerik ve İhbar Kuyruğu
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">ID</th>
                <th className="pb-2">HEDEF İÇERİK</th>
                <th className="pb-2">YAZAR</th>
                <th className="pb-2">BAYRAKLANMA SEBEBİ</th>
                <th className="pb-2">ÖNEM</th>
                <th className="pb-2 text-right">AKSİYON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {flags.map((f) => (
                <tr
                  key={f.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{f.id}</td>
                  <td className="py-3 font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                    {f.target}
                  </td>
                  <td className="py-3 text-cyan-400">{f.author}</td>
                  <td className="py-3 font-sans text-[#656d76] dark:text-[#c9d1d9]">{f.reason}</td>
                  <td className="py-3">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        f.severity === "HIGH"
                          ? "border-rose-800 bg-rose-950/60 text-rose-300"
                          : "border-amber-800 bg-amber-950/60 text-amber-300"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-zinc-950 hover:bg-emerald-500">
                        Onayla
                      </button>
                      <button className="rounded border border-rose-800 bg-rose-950/60 px-2 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-900">
                        Reddet
                      </button>
                    </div>
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
