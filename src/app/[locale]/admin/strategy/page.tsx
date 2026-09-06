"use client";

import React, { useState } from "react";
import { Target, TrendingUp, ShieldAlert, DollarSign, Layers, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<"SWOT" | "VALUATION" | "RISKS">("VALUATION");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 3: SERMAYE & STRATEJİ
            </span>
            <span className="font-sans text-xs font-semibold text-emerald-400">
              EXECUTIVE STRATEGY & VALUATION RADAR
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Kurumsal Strateji, SWOT & Şirket Değerleme Masası (/strategy)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            SaaS şirket değerlemesi ($48M - $120M), 360° SWOT matrisi ve kurumsal tehdit/risk
            haritası
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-[#d0d7de] bg-zinc-900 p-1 dark:border-[#30363d]">
          {(["VALUATION", "SWOT", "RISKS"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded px-3 py-1.5 font-mono text-xs transition-colors ${
                activeTab === tab
                  ? "border border-zinc-700 bg-zinc-800 font-bold text-[#1f2328] shadow-sm dark:text-[#f0f6fc]"
                  : "text-zinc-400 hover:text-zinc-200 dark:text-[#8b949e] dark:text-[#656d76]"
              }`}
            >
              {tab === "VALUATION"
                ? "Değerleme Modeli"
                : tab === "SWOT"
                  ? "SWOT Matrisi"
                  : "Kurumsal Riskler"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Hesaplanan Şirket Değerlemesi"
          value="$48.5M - $85.0M"
          subtext="2.908 Vaka Veri Kalkanı & B2B ARR Çarpanı (25x - 40x)"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          label="Data Moat Savunulabilirlik"
          value="%94.8 MOAT"
          subtext="Eşsiz Vaka Sayısı ve VirusTotal Çarkı"
          changeType="positive"
          icon={Target}
        />
        <MetricCard
          label="Pazar Fırsat Büyüklüğü (TAM)"
          value="$48.2 Milyar"
          subtext="2030 Küresel AI Güvenlik & Liability Sigorta Pazarı"
          icon={TrendingUp}
        />
      </div>

      {/* Tab 1: Valuation */}
      {activeTab === "VALUATION" && (
        <div className="grid grid-cols-1 gap-6 font-sans text-xs lg:grid-cols-2">
          <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
            <h2 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              B2B Veri & SaaS Değerleme Metodolojisi
            </h2>
            <div className="space-y-3 font-sans text-xs leading-relaxed text-[#656d76] dark:text-[#c9d1d9]">
              <p>
                Alparai salt bir yazılım firması değil;{" "}
                <strong>AI Hata ve Zafiyet Veri Tekelidir (Data Moat).</strong> Şirket değerlemesi
                geleneksel 10x SaaS çarpanı yerine, Bloomberg ve Veri Güvenliği şirketlerinin
                uyguladığı <strong>25x - 40x ARR çarpanı</strong> ile hesaplanır.
              </p>
              <div className="space-y-1.5 rounded border border-[#d0d7de] bg-zinc-950 p-3 font-sans text-xs dark:border-[#30363d]">
                <div className="flex justify-between text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                  <span>Mevcut Yıllıklandırılmış Gelir (ARR):</span>
                  <span className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">$1.33M</span>
                </div>
                <div className="flex justify-between text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                  <span>Veri Kalkanı Premium Katsayısı:</span>
                  <span className="font-bold text-emerald-400">+35x Çarpan</span>
                </div>
                <div className="flex justify-between border-t border-[#d0d7de] pt-2 text-sm font-bold text-emerald-400 dark:border-[#30363d]">
                  <span>Mevcut Seed/Seri A Değerlemesi:</span>
                  <span>$46.5M - $53.2M</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
            <h2 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              3 Yıllık Değerleme Projeksiyonu
            </h2>
            <div className="space-y-3 font-sans text-xs text-[#656d76] dark:text-[#c9d1d9]">
              <div className="flex items-center justify-between rounded border border-[#d0d7de] bg-zinc-950 p-2.5 font-sans dark:border-[#30363d]">
                <span>1. Yıl Sonu (2026):</span>
                <span className="font-bold text-zinc-200">
                  $1.95M ARR → <strong>$48M-$78M Değerleme</strong>
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#d0d7de] bg-zinc-950 p-2.5 font-sans dark:border-[#30363d]">
                <span>2. Yıl Sonu (2027):</span>
                <span className="font-bold text-cyan-400">
                  $8.12M ARR → <strong>$160M-$240M Değerleme</strong>
                </span>
              </div>
              <div className="flex items-center justify-between rounded border border-[#d0d7de] bg-zinc-950 p-2.5 font-sans dark:border-[#30363d]">
                <span>3. Yıl Sonu (2028):</span>
                <span className="font-bold text-emerald-400">
                  $25.0M ARR → <strong>$500M+ Unicorn Adayı</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SWOT */}
      {activeTab === "SWOT" && (
        <div className="grid grid-cols-1 gap-4 font-sans text-xs sm:grid-cols-2">
          <div className="space-y-2 rounded-lg border border-emerald-800/60 bg-emerald-950/30 p-4">
            <h3 className="text-sm font-bold text-emerald-300">GÜÇLÜ YÖNLER (STRENGTHS)</h3>
            <ul className="list-inside list-disc space-y-1 font-sans text-xs text-[#656d76] dark:text-[#c9d1d9]">
              <li>2.908 hazır vaka ile pazarın en büyük açık & doğrulanmış veri seti</li>
              <li>EU AI Act Madde 73 (72h SLA) ve Madde 99 ceza hesaplama tekeli</li>
              <li>5-Model Byzantine çapraz denetim mimarisi (Sıfır tek model bağımlılığı)</li>
              <li>Sıfır-Bilgi PII temizliği (MERNİS, IBAN, Luhn)</li>
            </ul>
          </div>

          <div className="space-y-2 rounded-lg border border-amber-800/60 bg-amber-950/30 p-4">
            <h3 className="text-sm font-bold text-amber-300">FIRSATLAR (OPPORTUNITIES)</h3>
            <ul className="list-inside list-disc space-y-1 font-sans text-xs text-[#656d76] dark:text-[#c9d1d9]">
              <li>Allianz / Swiss Re gibi sigorta devlerinin aktüeryal veri açlığı</li>
              <li>Ağustos 2026 EU AI Act zorunluluklarının yarattığı devasa panik dalgası</li>
              <li>VirusTotal benzeri topluluk büyüme çarkıyla milyonlarca ihbar çekimi</li>
            </ul>
          </div>

          <div className="space-y-2 rounded-lg border border-blue-800/60 bg-blue-950/30 p-4">
            <h3 className="text-sm font-bold text-blue-300">ZAYIF YÖNLER (WEAKNESSES)</h3>
            <ul className="list-inside list-disc space-y-1 font-sans text-xs text-[#656d76] dark:text-[#c9d1d9]">
              <li>Kamuoyu bilinirliğinin erken aşamada olması (Growth ekibi ölçekleniyor)</li>
              <li>Manuel ihbar inceleme ekibinin büyüme hızına yetiştirilmesi gereği</li>
            </ul>
          </div>

          <div className="space-y-2 rounded-lg border border-rose-800/60 bg-rose-950/30 p-4">
            <h3 className="text-sm font-bold text-rose-300">TEHDİTLER (THREATS)</h3>
            <ul className="list-inside list-disc space-y-1 font-sans text-xs text-[#656d76] dark:text-[#c9d1d9]">
              <li>
                Büyük teknoloji şirketlerinden gelebilecek SLAPP yayından kaldırma davaları
                (Streisand kalkanı ile önlendi)
              </li>
              <li>Kapalı model üreticilerinin güvenlik verilerini gizleme çabaları</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Risks */}
      {activeTab === "RISKS" && (
        <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
          <h2 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
            Kurumsal Risk & Tehdit Matrisi
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded border border-[#d0d7de] bg-zinc-950 p-3 dark:border-[#30363d]">
              <div>
                <span className="font-bold text-zinc-200">Hukuki SLAPP Riski:</span>
                <p className="mt-0.5 font-sans text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                  Büyük firmaların zafiyet ifşalarına karşı dava tehditleri.
                </p>
              </div>
              <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-1 font-bold text-emerald-300">
                MİTİGE EDİLDİ (Anti-SLAPP Kalkanı)
              </span>
            </div>
            <div className="flex items-center justify-between rounded border border-[#d0d7de] bg-zinc-950 p-3 dark:border-[#30363d]">
              <div>
                <span className="font-bold text-zinc-200">Veri Sızıntısı & PII Riski:</span>
                <p className="mt-0.5 font-sans text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                  İhbarcının kişisel verilerinin yanlışlıkla yayılması.
                </p>
              </div>
              <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-1 font-bold text-emerald-300">
                SIFIR RİSK (Zero-Knowledge Hash)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
