"use client";

import React from "react";
import { Vote, CheckCircle2, AlertTriangle, Users, Plus, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function DilemmasPage() {
  const dilemmas = [
    {
      id: "DIL-01",
      title: "Otonom Araç Kazalarında Yolcu mu Yaya mı Korunmalı?",
      category: "ETİK & DONANIM",
      totalVotes: 14280,
      consensusA: "%68 Yaya Önceliği",
      consensusB: "%32 Yolcu Önceliği",
      status: "ACTIVE_VOTING",
    },
    {
      id: "DIL-02",
      title: "Tıbbi Teşhiste AI Hatası Durumunda Hukuki Sorumluluk Kime Ait?",
      category: "HUKUK & SAĞLIK",
      totalVotes: 9840,
      consensusA: "%81 AI Üreticisi Şirket",
      consensusB: "%19 Doktor / Hastane",
      status: "ACTIVE_VOTING",
    },
    {
      id: "DIL-03",
      title:
        "İşe Alım LLM'lerinin Özgeçmiş Elemesinde Cinsiyet / Etnik Körleştirme Zorunlu Olmalı mı?",
      category: "EU AI ACT MADDE 6",
      totalVotes: 21400,
      consensusA: "%94 Evet Zorunlu",
      consensusB: "%6 Hayır Serbest",
      status: "RESOLVED_CONSENSUS",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 2: BÜYÜME & TOPLULUK
            </span>
            <span className="font-sans text-xs font-semibold text-cyan-400">
              COMMUNITY DILEMMAS & PUBLIC CONSENSUS
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Topluluk İkilemleri & Kamu Oylama Masası (/dilemmas)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            alparai.com/dilemmas üzerindeki kamu oylamaları, etik ikilemler ve yapay zeka anayasası
            kamuoyu konsensüsü
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-cyan-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Kamuoyu İkilemi Yayınla</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Toplam Kullanılan Oy"
          value="184.200 Oy"
          subtext="Küresel Topluluk Katılımı"
          change="+%34.2"
          changeType="positive"
          icon={Vote}
        />
        <MetricCard
          label="Aktif İkilem Konuları"
          value="12 Konu"
          subtext="Otonom Araç, Sağlık, Hukuk, İstihdam"
          icon={Users}
        />
        <MetricCard
          label="Konsensüse Ulaşanlar"
          value="8 Anayasa Maddesi"
          subtext="Küresel AI Anayasası Taslağına Eklendi"
          changeType="positive"
          icon={CheckCircle2}
        />
      </div>

      {/* Dilemmas Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Canlı Topluluk İkilemleri ve Kamuoyu Dağılımı
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">ID</th>
                <th className="pb-2">İKİLEM SORUSU</th>
                <th className="pb-2">KATEGORİ</th>
                <th className="pb-2">OY SAYISI</th>
                <th className="pb-2">KONSENSÜS EĞİLİMİ</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {dilemmas.map((d) => (
                <tr
                  key={d.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{d.id}</td>
                  <td className="max-w-sm py-3 font-sans font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                    {d.title}
                  </td>
                  <td className="py-3 text-cyan-400">{d.category}</td>
                  <td className="py-3 font-bold text-emerald-400">
                    {d.totalVotes.toLocaleString()}
                  </td>
                  <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">
                    <div className="text-[11px]">{d.consensusA}</div>
                    <div className="text-[10px] text-[#656d76] dark:text-[#8b949e]">
                      {d.consensusB}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-[#656d76] dark:text-[#c9d1d9]">
                      {d.status.replace(/_/g, " ")}
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
