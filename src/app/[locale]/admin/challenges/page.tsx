"use client";

import React from "react";
import { Award, ShieldAlert, CheckCircle2, DollarSign, Plus } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { StatusBadge } from "@/components/admin-core/status-badge";
import { mockBounties } from "@/lib/admin-mock";

export default function ChallengesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 1: HESAP VEREBİLİRLİK
            </span>
            <span className="font-mono text-xs font-semibold text-purple-400">
              RED-TEAMING & BUG BOUNTIES
            </span>
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Kırmızı Takım & Zafiyet Ödül Masası (Bug Bounty)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Etik hackerlar ve güvenlik araştırmacılarının model açıklarını (Jailbreak, PII
            Sızıntısı) bildirdiği ödül havuzu
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-rose-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Bounty Yarışması Aç</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Dağıtılan Ödül Havuzu"
          value="€48.500"
          subtext="Doğrulanan 32 Zafiyet İhbarı İçin Ödendi"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          label="İnceleme Bekleyen Başvurular"
          value="6 Vaka"
          subtext="SLA Kapsamında 24 Saat İçinde Değerlendirilecek"
          changeType="alert"
          icon={ShieldAlert}
        />
        <MetricCard
          label="Kayıtlı Güvenlik Araştırmacısı"
          value="420+"
          subtext="Küresel Red-Team Topluluğu"
          icon={Award}
        />
      </div>

      {/* Bounties Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-mono text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Son Gelen Zafiyet Bildirimleri ve Ödül Talepleri
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">BOUNTY ID</th>
                <th className="pb-2">ARAŞTIRMACI</th>
                <th className="pb-2">HEDEF MODEL</th>
                <th className="pb-2">ZAFİYET TÜRÜ</th>
                <th className="pb-2">ÖDÜL TUTARI</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {mockBounties.map((b) => (
                <tr
                  key={b.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{b.id}</td>
                  <td className="py-3 font-semibold text-purple-400">{b.challengerHandle}</td>
                  <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">{b.targetModel}</td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {b.vulnerabilityType.replace(/_/g, " ")}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">
                    €{b.payoutEur.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        b.status === "VERIFIED_PAID"
                          ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                          : "border-amber-800 bg-amber-950/60 text-amber-300"
                      }`}
                    >
                      {b.status.replace(/_/g, " ")}
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
