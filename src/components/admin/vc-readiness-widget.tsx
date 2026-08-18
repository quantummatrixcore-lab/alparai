"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, ArrowUpRight, Award } from "lucide-react";

export interface ReadinessCategory {
  id: string;
  name: string;
  score: number;
  weight: string;
  status: "ready" | "in_progress" | "action_needed";
  highlights: string[];
  blockers?: string[];
}

export function VcReadinessWidget() {
  const categories: ReadinessCategory[] = [
    {
      id: "tech_sec",
      name: "Teknik Mimari & Güvenlik",
      score: 100,
      weight: "25%",
      status: "ready",
      highlights: [
        "Kimlik doğrulama bayrağı kapalı (production-level auth)",
        "0 @ts-nocheck & 0 gevşek repo kök dosyası",
        "CI/CD workflow master branch tam senkronizasyonu"
      ]
    },
    {
      id: "reg_data",
      name: "Regülasyon & Data Moat",
      score: 96,
      weight: "ready",
      status: "ready",
      highlights: [
        "371 belgelenmiş ve doğrulanmış kamuya açık AI ihlali",
        "AB Yapay Zeka Yasası Madde 73 taksonomi uyumluluğu",
        "KVKK Madde 11 & EU AI Act Madde 50 toolkit entegrasyonu"
      ]
    },
    {
      id: "founder_team",
      name: "Kurucu & Uyum (İş Bankası YZ Fabrikası Kriteri)",
      score: 100,
      weight: "20%",
      status: "ready",
      highlights: [
        "En az 1 Türk Kurucu Şartı: %100 Uyumlu",
        "Otonom Ajan Mimarisi & Agent-OS Yetkinliği",
        "Derin Yapay Zeka Güvenliği Etik Kurul Yapısı"
      ]
    },
    {
      id: "monetization",
      name: "Monetizasyon & B2B Pazarı",
      score: 90,
      weight: "15%",
      status: "ready",
      highlights: [
        "ALP Risk API Alpha Aktüeryal Veri beslemesi",
        "B2B SaaS Uyum Rozeti & Kurumsal Risk Paneli",
        "Lloyd's & Reasürans modellerine uygun veri mimarisi"
      ]
    },
    {
      id: "pr_community",
      name: "Topluluk & Küresel Etki (Global Anayasa)",
      score: 88,
      weight: "15%",
      status: "in_progress",
      highlights: [
        "Yapay Zekanın Global Anayasası (/constitution) yayında",
        "Halk ve Topluluk Odaklı Şeffaf İhbar Yönetimi",
        "Devlet/Şirket Vesayetine Karşı Demokratik Yapay Zeka Hareketi"
      ]
    }
  ];

  const overallScore = 95;

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Award className="h-3.5 w-3.5" /> VC & Yatırım Uyum Skor Kartı
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
            İş Bankası Yapay Zeka Fabrikası & VC Hazırlık Endeksi
          </h2>
          <p className="mt-1 text-sm font-medium text-zinc-400">
            Yatırımcı Veri Odası (Data Room), Teknik Güvenlik ve Kurucu Şartları canlı denetimi.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Toplam Uyum Oranı</div>
            <div className="text-3xl font-black text-emerald-300">%{overallScore}</div>
          </div>
          <ShieldCheck className="h-10 w-10 text-emerald-400" />
        </div>
      </div>

      {/* Target Funders Matrix */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
          <div className="text-xs font-bold text-zinc-400">İş Bankası YZ Fabrikası</div>
          <div className="mt-1 text-base font-black text-emerald-400">HAZIR (%98)</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
          <div className="text-xs font-bold text-zinc-400">500 Emerging Europe</div>
          <div className="mt-1 text-base font-black text-emerald-400">HAZIR (%95)</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
          <div className="text-xs font-bold text-zinc-400">Melek Yatırım Ağı</div>
          <div className="mt-1 text-base font-black text-emerald-400">HAZIR (%92)</div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 text-center">
          <div className="text-xs font-bold text-zinc-400">Kurucu Ortak Ekosistemi</div>
          <div className="mt-1 text-base font-black text-cyan-400">TAM TAMAMLAMA</div>
        </div>
      </div>

      {/* Categories Breakdown Grid */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-950/60 p-5 transition-all duration-300 hover:border-purple-500/30"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                  Ağırlık: {cat.weight}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-400">
                  %{cat.score}
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold text-white">{cat.name}</h3>

              <ul className="mt-3 space-y-2">
                {cat.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-medium text-zinc-300">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span>Durum: <strong className="text-emerald-400 uppercase">{cat.status}</strong></span>
              <span className="text-purple-400 hover:underline cursor-pointer inline-flex items-center gap-0.5">
                Detay <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
