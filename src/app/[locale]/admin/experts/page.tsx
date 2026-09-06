"use client";

import React from "react";
import { UserCheck, Award, GraduationCap, Shield, Star, Plus } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function ExpertsPage() {
  const experts = [
    {
      id: "EXP-01",
      name: "Prof. Dr. Elizabeth Vance",
      title: "Oxford AI Ethics Lab Direktörü",
      domain: "Biyometrik Ayrımcılık & Etik",
      verifiedCases: 48,
      status: "ACTIVE_AVAILABLE",
      rating: "5.0 / 5.0",
    },
    {
      id: "EXP-02",
      name: "Dr. Marcus Lindqvist",
      title: "ETH Zürich Güvenilirlik Sistemleri",
      domain: "Model Zafiyeti & Kırmızı Takım",
      verifiedCases: 36,
      status: "ON_TRIAL_AUDIT",
      rating: "4.9 / 5.0",
    },
    {
      id: "EXP-03",
      name: "Av. Zeynep Kaya",
      title: "Avrupa Bilişim Hukuku & AI Barosu",
      domain: "EU AI Act Madde 73 & CE Denetimi",
      verifiedCases: 54,
      status: "ACTIVE_AVAILABLE",
      rating: "5.0 / 5.0",
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
              EXPERT WITNESS & SPECIALIST NETWORK
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Bağımsız AI Güvenlik Uzmanları & Bilirkişi Ağı (/experts)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Mahkemeler, sigorta şirketleri ve regülatörler için bağımsız AI bilirkişiliği ve vaka
            denetçileri ağı
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-emerald-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Uzman Davet Et</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Kayıtlı Bilirkişi & Uzman"
          value="42 Uzman"
          subtext="Oxford, ETH, MIT ve Uluslararası Barolar"
          changeType="positive"
          icon={GraduationCap}
        />
        <MetricCard
          label="Tamamlanan Bilirkişi Raporu"
          value="184 Rapor"
          subtext="Sigorta ve Mahkeme Delil Dosyaları"
          icon={Award}
        />
        <MetricCard
          label="Ortalama Uzman Puanı"
          value="4.95 / 5.0"
          subtext="Yüksek Akademik & Hukuki Yetkinlik"
          changeType="positive"
          icon={Star}
        />
      </div>

      {/* Experts Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Akredite Bilirkişi ve Güvenlik Uzmanı Listesi
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">KOD</th>
                <th className="pb-2">UZMAN ADI & KURUMU</th>
                <th className="pb-2">UZMANLIK ALANI</th>
                <th className="pb-2">ONAYLANAN VAKA</th>
                <th className="pb-2">DEĞERLENDİRME</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {experts.map((e) => (
                <tr
                  key={e.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{e.id}</td>
                  <td className="py-3">
                    <div className="font-semibold text-[#1f2328] dark:text-[#f0f6fc]">{e.name}</div>
                    <div className="font-sans text-[10px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                      {e.title}
                    </div>
                  </td>
                  <td className="py-3 text-cyan-400">{e.domain}</td>
                  <td className="py-3 font-bold text-zinc-200">{e.verifiedCases} Vaka</td>
                  <td className="py-3 font-semibold text-amber-400">{e.rating}</td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {e.status.replace(/_/g, " ")}
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
