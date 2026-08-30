"use client";

import React, { useState } from "react";
import {
  Database,
  Bot,
  RefreshCw,
  Layers,
  CheckCircle2,
  ArrowRight,
  Play,
  Flame,
  Search,
  Radio,
  FileSpreadsheet,
  Sparkles,
  Check,
} from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { CANONICAL_INCIDENT_COUNT } from "@/lib/constants";

interface ScraperSource {
  id: string;
  name: string;
  target: string;
  frequency: string;
  status: "ONLINE" | "CRAWLING" | "STANDBY";
  ingestedToday: number;
  successRate: number;
}

export default function DataMoatPage() {
  const [scrapers, setScrapers] = useState<ScraperSource[]>([
    {
      id: "1",
      name: "X / Twitter AI Fail Stream",
      target: "#ChatGPTFail #ClaudeLeak #GenAIError",
      frequency: "Canlı Akış (WebSocket)",
      status: "ONLINE",
      ingestedToday: 142,
      successRate: 98.4,
    },
    {
      id: "2",
      name: "Reddit AI Subreddits Crawler",
      target: "r/ChatGPT, r/LocalLLaMA, r/MachineLearning",
      frequency: "5 Dakikada Bir",
      status: "ONLINE",
      ingestedToday: 88,
      successRate: 99.1,
    },
    {
      id: "3",
      name: "GitHub Security Advisory & CVE",
      target: "CVE-2026-* AI Security Advisories",
      frequency: "15 Dakikada Bir",
      status: "ONLINE",
      ingestedToday: 12,
      successRate: 100,
    },
    {
      id: "4",
      name: "arXiv & Academic Hallucination Hub",
      target: "cs.CL, cs.AI Preprints & Benchmarks",
      frequency: "Saatlik",
      status: "ONLINE",
      ingestedToday: 6,
      successRate: 97.2,
    },
    {
      id: "5",
      name: "EU AI Office & Legal Register",
      target: "Official EU AI Act Enforcement Notices",
      frequency: "Günlük",
      status: "ONLINE",
      ingestedToday: 3,
      successRate: 100,
    },
  ]);

  const [isTriggeringAll, setIsTriggeringAll] = useState(false);
  const [activeCrawlerLog, setActiveCrawlerLog] = useState<string | null>(null);
  const [totalIncidentCount, setTotalIncidentCount] = useState<number>(CANONICAL_INCIDENT_COUNT);

  const handleTriggerScraper = (id: string) => {
    setScrapers((prev) => prev.map((s) => (s.id === id ? { ...s, status: "CRAWLING" } : s)));
    setActiveCrawlerLog(
      `Kaynak [${id}] taranıyor: Yeni vaka verileri çekiliyor ve SHA-256 ile mühürleniyor...`,
    );
    setTimeout(() => {
      setScrapers((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "ONLINE", ingestedToday: s.ingestedToday + 5 } : s,
        ),
      );
      setTotalIncidentCount((c) => c + 5);
      setActiveCrawlerLog(
        `Kaynak [${id}] başarıyla tamamlandı: +5 yeni vaka Data Moat havuzuna eklendi.`,
      );
    }, 1800);
  };

  const handleTriggerAll = () => {
    setIsTriggeringAll(true);
    setActiveCrawlerLog(
      "Küresel Otonom Tarayıcı Filosu Tetiklendi (5 Kaynak eşzamanlı taranıyor)...",
    );
    setScrapers((prev) => prev.map((s) => ({ ...s, status: "CRAWLING" })));
    setTimeout(() => {
      setIsTriggeringAll(false);
      setScrapers((prev) =>
        prev.map((s) => ({ ...s, status: "ONLINE", ingestedToday: s.ingestedToday + 12 })),
      );
      setTotalIncidentCount((c) => c + 60);
      setActiveCrawlerLog(
        `Tam tarama döngüsü tamamlandı: 60 yeni olay doğrulandı, vektörleştirildi ve ${CANONICAL_INCIDENT_COUNT.toLocaleString("tr-TR")} tabanına eklendi.`,
      );
    }, 2400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded border border-[#d0d7de] bg-[#eaeef2] px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
              KÜME 4: EKOSİSTEM & VERİ FABRİKASI
            </span>
            <span className="font-sans text-xs font-semibold text-[#0969da] dark:text-[#58a6ff]">
              VIRUSTOTAL-STYLE DATA FLYWHEEL ENGINE
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Veri Kalkanı & Otonom Tarayıcı Komutası (Data Moat)
          </h1>
          <p className="mt-0.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            {totalIncidentCount.toLocaleString("tr-TR")} hazır vaka ile başlayan küresel yapay zeka
            hata/zafiyet veri fabrikası
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerAll}
            disabled={isTriggeringAll}
            className="flex items-center gap-1.5 rounded-md bg-[#0969da] px-3 py-1.5 font-sans text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#0854ad] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTriggeringAll ? "animate-spin" : ""}`} />
            <span>{isTriggeringAll ? "Tüm Filo Taranıyor..." : "Tüm Tarayıcıları Tetikle"}</span>
          </button>
        </div>
      </div>

      {activeCrawlerLog && (
        <div className="animate-in fade-in flex items-center justify-between rounded-md border border-[#54aeff]/40 bg-[#ddf4ff] p-3 font-sans text-xs text-[#0969da] duration-200 dark:bg-[#04213d] dark:text-[#58a6ff]">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 animate-pulse" />
            <span>{activeCrawlerLog}</span>
          </div>
        </div>
      )}

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Toplam Doğrulanmış Vaka"
          value={totalIncidentCount.toLocaleString("tr-TR")}
          change="+24 bugün"
          changeType="positive"
          subtext="Kriptografik SHA-256 mühürlü"
          icon={Database}
        />
        <MetricCard
          label="Aktif Otonom Botlar"
          value="5/5 Çevrimiçi"
          change="%99.8 Uptime"
          changeType="positive"
          subtext="Reddit, X, CVE, arXiv, EU Register"
          icon={Bot}
        />
        <MetricCard
          label="Vektör Gömme (Embeddings)"
          value="1.536 Dim"
          change="Cosine Similarity > 0.88"
          changeType="neutral"
          subtext="Otomatik tekilleştirme motoru"
          icon={Layers}
        />
        <MetricCard
          label="Whistleblower İhbarları"
          value="38 Beklemede"
          change="Anonim PGP şifreli"
          changeType="neutral"
          subtext="İçeriden gelen şirket ihbarları"
          icon={Flame}
        />
      </div>

      {/* Scrapers Control Table */}
      <div className="overflow-hidden rounded-md border border-[#d0d7de] bg-[#ffffff] shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-2.5 dark:border-[#30363d] dark:bg-[#0d1117]">
          <span className="font-sans text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
            OTONOM KÜRESEL VERİ ÇEKME & ZENGİNLEŞTİRME FİLOSU
          </span>
          <span className="font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
            {scrapers.length} Aktif Tarayıcı Kulvarı
          </span>
        </div>

        <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
          {scrapers.map((s) => (
            <div
              key={s.id}
              className="p-4 transition-colors hover:bg-[#f6f8fa]/50 dark:hover:bg-[#161b22]/70"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                      {s.name}
                    </span>
                    <span
                      className={`py-0.2 rounded border px-1.5 font-sans text-[10px] ${
                        s.status === "CRAWLING"
                          ? "animate-pulse border-[#54aeff]/40 bg-[#ddf4ff] text-[#0969da] dark:bg-[#04213d] dark:text-[#58a6ff]"
                          : "border-[#4ac26b]/40 bg-[#dafbe1] text-[#1a7f37] dark:bg-[#04260f] dark:text-[#3fb950]"
                      }`}
                    >
                      {s.status === "CRAWLING" ? "Taranıyor..." : "Çevrimiçi"}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#656d76] dark:text-[#8b949e]">
                    Hedef: <code>{s.target}</code> • Periyot: {s.frequency}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                      +{s.ingestedToday} Vaka Bugün
                    </span>
                    <span className="block font-sans text-[10px] text-[#1a7f37] dark:text-[#3fb950]">
                      %{s.successRate} Doğruluk
                    </span>
                  </div>

                  <button
                    onClick={() => handleTriggerScraper(s.id)}
                    disabled={s.status === "CRAWLING"}
                    className="flex items-center gap-1 rounded border border-[#d0d7de] bg-[#ffffff] px-2.5 py-1 font-sans text-xs text-[#1f2328] transition-colors hover:bg-[#f6f8fa] disabled:opacity-50 dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:bg-[#30363d]"
                  >
                    <Play className="h-3 w-3 text-[#1a7f37] dark:text-[#3fb950]" />
                    <span>Şimdi Tara</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion Pipeline Visualization */}
      <div className="space-y-3 rounded-md border border-[#d0d7de] bg-[#ffffff] p-4 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
        <span className="flex items-center gap-2 font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          <Sparkles className="h-4 w-4 text-[#8250df] dark:text-[#a371f7]" />4 Aşamalı Otonom Veri
          Zenginleştirme & Değerleme Hattı
        </span>
        <div className="grid grid-cols-1 gap-3 pt-2 font-sans text-xs md:grid-cols-4">
          <div className="space-y-1 rounded border border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#0d1117]">
            <span className="block text-[10px] font-bold text-[#0969da] dark:text-[#58a6ff]">
              ADIM 1: CRAWL & SCRAPE
            </span>
            <p className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
              X, Reddit, GitHub ve akademik kaynaklardan ham hata ve sızıntı verisi toplanır.
            </p>
          </div>
          <div className="space-y-1 rounded border border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#0d1117]">
            <span className="block text-[10px] font-bold text-[#8250df] dark:text-[#a371f7]">
              ADIM 2: TEKİLLEŞTİRME & VEKTÖR
            </span>
            <p className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
              Cosine similarity ile mükerrer vakalar elenir, 1.536 boyutlu embedding üretilir.
            </p>
          </div>
          <div className="space-y-1 rounded border border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#0d1117]">
            <span className="block text-[10px] font-bold text-[#9a6700] dark:text-[#d29922]">
              ADIM 3: EU AI ACT ETİKETLEME
            </span>
            <p className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
              Madde 5, 6, 50, CVSS-AI ve ceza risk tavanı otomatik sınıflandırılır.
            </p>
          </div>
          <div className="space-y-1 rounded border border-[#d0d7de] bg-[#f6f8fa] p-3 dark:border-[#30363d] dark:bg-[#0d1117]">
            <span className="block text-[10px] font-bold text-[#1a7f37] dark:text-[#3fb950]">
              ADIM 4: B2B API FEED MONETIZATION
            </span>
            <p className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
              Doğrulanan vaka Allianz, AXA ve CISO tehdit akışına anlık iletilir ($94k MRR).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
