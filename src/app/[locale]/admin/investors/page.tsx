"use client";

import React from "react";
import { Building2, DollarSign, Users, FileText, ArrowUpRight, Plus } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { mockInvestors } from "@/lib/admin-mock";

export default function InvestorsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 3: SERMAYE & FİNANS
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-400">
              SERIES SEED / A PIPELINE
            </span>
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            VC Yatırımcı CRM & Data Room Masası
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Tier-1 VC fonları, Y Combinator ve melek yatırımcı görüşmeleri ile Data Room erişim
            takibi
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-blue-500/40 bg-blue-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-blue-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Yatırımcı Ekle</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Aktif Yatırım Boru Hattı"
          value="$6.5M"
          subtext="Sequoia, Index ve YC Masada"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          label="Data Room Ziyaretleri"
          value="49 İnceleme"
          subtext="2.763 Vaka Veri Seti & Sözleşmeler İncelendi"
          icon={FileText}
        />
        <MetricCard
          label="Görüşülen Fon Sayısı"
          value="14 VC"
          subtext="Avrupa & Silikon Vadisi Derin Teknoloji Fonları"
          icon={Building2}
        />
      </div>

      {/* Investors Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-mono text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Öncelikli Yatırımcı Boru Hattı ve Aşama Durumu
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">FON ADI</th>
                <th className="pb-2">PARTNER</th>
                <th className="pb-2">HEDEF ÇEK</th>
                <th className="pb-2">AŞAMA</th>
                <th className="pb-2">DATA ROOM ERİŞİMİ</th>
                <th className="pb-2 text-right">NOTLAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {mockInvestors.map((inv) => (
                <tr
                  key={inv.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{inv.firmName}</td>
                  <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">{inv.partnerName}</td>
                  <td className="py-3 font-bold text-emerald-400">
                    ${(inv.ticketSizeUsd / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        inv.status === "TERM_SHEET"
                          ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                          : "border-zinc-700 bg-zinc-800 text-[#656d76] dark:text-[#c9d1d9]"
                      }`}
                    >
                      {inv.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {inv.dataRoomAccessCount} Oturum
                  </td>
                  <td className="max-w-xs truncate py-3 text-right font-sans text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {inv.notes}
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
