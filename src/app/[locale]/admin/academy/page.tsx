"use client";

import React from "react";
import { GraduationCap, BookOpen, Award, CheckCircle2, Plus } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function AcademyPage() {
  const reviews = [
    {
      id: "ACAD-101",
      paper: "Empirical Bounds on LLM Hallucination in Clinical Triage",
      institution: "Oxford University / AI Ethics Lab",
      referee: "Prof. Dr. Elizabeth Vance",
      status: "PEER_REVIEW_APPROVED",
      citations: 142,
    },
    {
      id: "ACAD-102",
      paper: "Mathematical Verification of EU AI Act Article 5 Prohibited Criteria",
      institution: "ETH Zürich / Safety Systems",
      referee: "Dr. Klaus Schmidt",
      status: "UNDER_EVALUATION",
      citations: 89,
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
              ACADEMIC REFEREE BOARD
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Üniversite & Bağımsız Hakem Kurulu Masası
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Oxford, ETH Zürich ve küresel üniversitelerle ortak akademik hakem denetimi ve makale
            doğrulama
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-emerald-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Akademik Hakem Ata</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Hakem Denetiminden Geçen Makaleler"
          value="48 Çalışma"
          subtext="Alparai Olay Veri Seti Kullanılarak Yayınlandı"
          changeType="positive"
          icon={BookOpen}
        />
        <MetricCard
          label="Bağımsız Akademik Hakemler"
          value="24 Profesör / Araştırmacı"
          subtext="Oxford, ETH, MIT, Boğaziçi ve ODTÜ"
          icon={GraduationCap}
        />
        <MetricCard
          label="Toplam Akademik Atıf Sayısı"
          value="1.420+"
          subtext="Google Scholar & ArXiv İndeksleri"
          changeType="positive"
          icon={Award}
        />
      </div>

      {/* Papers Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-sans text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Akademik Hakem Değerlendirmesindeki Araştırmalar
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">ID</th>
                <th className="pb-2">MAKALE BAŞLIĞI</th>
                <th className="pb-2">ÜNİVERSİTE / KURUM</th>
                <th className="pb-2">BAŞ HAKEM</th>
                <th className="pb-2">ATIF</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {reviews.map((r) => (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{r.id}</td>
                  <td className="max-w-sm truncate py-3 font-sans text-[#1f2328] dark:text-[#f0f6fc]">
                    {r.paper}
                  </td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {r.institution}
                  </td>
                  <td className="py-3 font-semibold text-[#656d76] dark:text-[#c9d1d9]">
                    {r.referee}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">{r.citations}</td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {r.status.replace(/_/g, " ")}
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
