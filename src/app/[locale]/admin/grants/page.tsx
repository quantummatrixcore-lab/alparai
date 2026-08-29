"use client";

import React from "react";
import { Landmark, CheckCircle2, Clock, DollarSign, Plus } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { mockGrants } from "@/lib/admin-mock";

export default function GrantsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 3: SERMAYE & FİNANS
            </span>
            <span className="font-mono text-xs font-semibold text-cyan-400">
              NON-DILUTIVE GRANT AUTOPILOT
            </span>
          </div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Devlet Destekleri & Hibe Otopilotu (TÜBİTAK / KOSGEB / AB)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Hisse kaybı olmadan (non-dilutive) Ar-Ge hibe programlarının durum takibi ve bütçe
            yönetimi
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-emerald-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Hibe Başvurusu Ekle</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Toplam Talep Edilen Hibe"
          value="18.750.000 ₺"
          subtext="TÜBİTAK 1507, KOSGEB ve Horizon Europe AI"
          changeType="positive"
          icon={Landmark}
        />
        <MetricCard
          label="Onaylanan Fon"
          value="1.850.000 ₺"
          subtext="KOSGEB Ar-Ge İnovasyon Desteği Mühürlendi"
          changeType="positive"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Değerlendirmedeki Proje"
          value="2 Program"
          subtext="TÜBİTAK Hakem Değerlendirme Aşamasında"
          icon={Clock}
        />
      </div>

      {/* Grants Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-mono text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Aktif Devlet Desteği ve Hibe Programları
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">PROGRAM</th>
                <th className="pb-2">TALEP EDİLEN BÜTÇE</th>
                <th className="pb-2">SON TARİH</th>
                <th className="pb-2">HAZIRLIK ORANI</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {mockGrants.map((g) => (
                <tr
                  key={g.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{g.program.replace(/_/g, " ")}</td>
                  <td className="py-3 font-bold text-emerald-400">
                    {g.requestedBudgetTry.toLocaleString()} ₺
                  </td>
                  <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">{g.deadlineDate}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{ width: `${g.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                        %{g.completionPercentage}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        g.status === "APPROVED"
                          ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                          : "border-zinc-700 bg-zinc-800 text-[#656d76] dark:text-[#c9d1d9]"
                      }`}
                    >
                      {g.status.replace(/_/g, " ")}
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
