"use client";

import React, { useState } from "react";
import {
  Gavel,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Calculator,
  CheckCircle2,
  FileDown,
  Building2,
  FileText,
  Scale,
  AlertOctagon,
  Download,
} from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

interface ComplianceArticle {
  articleCode: string;
  title: string;
  riskCategory: string;
  description: string;
  compliancePercentage: number;
  incidentCount: number;
}

const articlesData: ComplianceArticle[] = [
  {
    articleCode: "Madde 5",
    title: "Yasaklı Yapay Zeka Uygulamaları",
    riskCategory: "PROHIBITED",
    description:
      "Bilinçaltı manipülasyon, sosyal puanlama ve gerçek zamanlı uzaktan biyometrik tanıma.",
    compliancePercentage: 99.4,
    incidentCount: 4,
  },
  {
    articleCode: "Madde 6 & Ek III",
    title: "Yüksek Riskli AI Sistemleri (High-Risk)",
    riskCategory: "HIGH_RISK",
    description: "Kritik altyapı, İK işe alım, adalet ve kredi değerlendirme algoritmaları.",
    compliancePercentage: 93.2,
    incidentCount: 184,
  },
  {
    articleCode: "Madde 50",
    title: "Şeffaflık ve Sentetik Medya Etiketleme",
    riskCategory: "TRANSPARENCY",
    description:
      "Deepfake, sentetik ses ve AI çıktılarına yönelik C2PA filigran ve açıklanabilirlik zorunluluğu.",
    compliancePercentage: 98.7,
    incidentCount: 42,
  },
  {
    articleCode: "Madde 51-55",
    title: "Genel Amaçlı AI (GPAI) ve Sistemik Riskler",
    riskCategory: "SYSTEMIC_RISK",
    description:
      "10^25 FLOPs üzeri hesaplama gücüne sahip sınır (frontier) modeller ve siber savunma denetimleri.",
    compliancePercentage: 91.5,
    incidentCount: 29,
  },
  {
    articleCode: "Madde 73",
    title: "Ciddi Olayların Bildirimi (72 Saat SLA)",
    riskCategory: "INCIDENT_SLA",
    description:
      "Can kaybı veya kritik altyapı çökmesine yol açan AI zafiyetlerinin 72 saat içinde AI Office'e tebliği.",
    compliancePercentage: 96.8,
    incidentCount: 14,
  },
];

export default function CompliancePage() {
  const [annualTurnoverEur, setAnnualTurnoverEur] = useState<number>(500000000); // 500M €
  const [violationType, setViolationType] = useState<"ART_5" | "ART_6" | "ART_50">("ART_5");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatedReportSuccess, setGeneratedReportSuccess] = useState<string | null>(null);

  // Article 99 Calculation: Max of €35M OR 7% of Global Annual Turnover
  const calculatedFineEur =
    violationType === "ART_5"
      ? Math.max(35000000, annualTurnoverEur * 0.07)
      : violationType === "ART_6"
        ? Math.max(15000000, annualTurnoverEur * 0.035)
        : Math.max(7500000, annualTurnoverEur * 0.015);

  const handleGenerateAuditReport = () => {
    setIsGeneratingReport(true);
    setGeneratedReportSuccess(null);
    setTimeout(() => {
      setIsGeneratingReport(false);
      setGeneratedReportSuccess(
        "EU_AI_Act_Audit_Cert_ALPAR_2026_Q3.pdf (SHA-256: 9f8a...e12d) başarıyla üretildi ve imzalandı.",
      );
    }, 1500);
  };

  const exportComplianceJson = () => {
    const auditData = {
      standard: "EU AI Act (Regulation 2024/1689)",
      timestamp: new Date().toISOString(),
      complianceSummary: {
        overallScore: 93.2,
        prohibitedPracticesDetected: 4,
        highRiskSystemCount: 184,
        criticalSLACountdowns: 3,
      },
      articles: articlesData,
      fineSimulation: {
        violationType,
        annualTurnoverEur,
        calculatedFineEur,
      },
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alparai_eu_ai_act_compliance_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded border border-[#d0d7de] bg-[#eaeef2] px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
              KÜME 1: HESAP VEREBİLİRLİK & REGÜLASYON
            </span>
            <span className="font-sans text-xs font-semibold text-[#9a6700] dark:text-[#d29922]">
              EU AI ACT (REGULATION 2024/1689) & NIST RMF
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            EU AI Act Uyum Radarı & Ceza / Denetim Masası
          </h1>
          <p className="mt-0.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            Yapay zeka modellerinin yasal risk sınıflandırması, Madde 99 ceza hesaplayıcısı ve resmi
            denetim raporu ihracı
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportComplianceJson}
            className="flex items-center gap-1.5 rounded-md border border-[#d0d7de] bg-[#ffffff] px-3 py-1.5 font-sans text-xs font-medium text-[#1f2328] shadow-sm transition-colors hover:bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#f0f6fc] dark:hover:bg-[#30363d]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>JSON İndir</span>
          </button>
          <button
            onClick={handleGenerateAuditReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-1.5 rounded-md bg-[#238636] px-3 py-1.5 font-sans text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#2ea043] disabled:opacity-50"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>
              {isGeneratingReport ? "Rapor Üretiliyor..." : "Resmi Uyum Raporu Üret (PDF)"}
            </span>
          </button>
        </div>
      </div>

      {generatedReportSuccess && (
        <div className="animate-in fade-in flex items-center justify-between rounded-md border border-[#4ac26b]/40 bg-[#dafbe1] p-3 font-sans text-xs text-[#1a7f37] duration-200 dark:bg-[#04260f] dark:text-[#3fb950]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{generatedReportSuccess}</span>
          </div>
          <span className="cursor-pointer text-[10px] font-semibold underline">İndir</span>
        </div>
      )}

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Genel Uyum Skoru"
          value="%93.2"
          change="+2.8% son 30 gün"
          changeType="positive"
          subtext="Tüm denetlenen 2.908 olay üzerinden"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Madde 5 (Yasaklı AI)"
          value="4 Vaka"
          change="0 aktif yaptırım"
          changeType="neutral"
          subtext="Bilinçaltı manipülasyon ve sosyal puanlama"
          icon={AlertOctagon}
        />
        <MetricCard
          label="Madde 6 (Yüksek Risk)"
          value="184 Vaka"
          change="142 onaylı hafifletme"
          changeType="positive"
          subtext="Kritik altyapı, İK ve biyometrik sistemler"
          icon={Scale}
        />
        <MetricCard
          label="Madde 50 (Şeffaflık)"
          value="%98.7"
          change="C2PA uyumlu"
          changeType="positive"
          subtext="Sentetik içerik etiketleme & SHA-256"
          icon={CheckCircle2}
        />
      </div>

      {/* Article 99 Fine Simulator & Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Fine Simulator */}
        <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-4 shadow-sm lg:col-span-1 dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="flex items-center gap-2 border-b border-[#d0d7de] pb-3 dark:border-[#30363d]">
            <Calculator className="h-4 w-4 text-[#0969da] dark:text-[#58a6ff]" />
            <h3 className="font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
              Madde 99 İdari Para Cezası Hesaplayıcısı
            </h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div>
              <label className="mb-1 block text-[#656d76] dark:text-[#8b949e]">
                İhlal Edilen Yasa Maddesi:
              </label>
              <select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value as any)}
                className="w-full rounded border border-[#d0d7de] bg-[#ffffff] px-3 py-1.5 text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              >
                <option value="ART_5">Madde 5 (Yasaklı AI): €35M veya Cironun %7\'si</option>
                <option value="ART_6">Madde 6 (Yüksek Risk): €15M veya Cironun %3.5\'i</option>
                <option value="ART_50">Madde 50 (Şeffaflık): €7.5M veya Cironun %1.5\'i</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[#656d76] dark:text-[#8b949e]">
                Kurumun Küresel Yıllık Cirosu (€):
              </label>
              <input
                type="number"
                step="10000000"
                value={annualTurnoverEur}
                onChange={(e) => setAnnualTurnoverEur(Number(e.target.value))}
                className="w-full rounded border border-[#d0d7de] bg-[#ffffff] px-3 py-1.5 text-[#1f2328] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1.5 rounded-md border border-[#ff8182]/40 bg-[#ffebe9] p-3.5 dark:bg-[#490202]">
              <span className="block text-[10px] font-semibold tracking-wider text-[#cf222e] uppercase dark:text-[#ff7b72]">
                Maksimum Yasal Yaptırım Riski (Ceza Tavanı)
              </span>
              <div className="font-sans text-2xl font-bold text-[#cf222e] dark:text-[#ff7b72]">
                €{calculatedFineEur.toLocaleString("tr-TR")}
              </div>
              <p className="text-[11px] leading-relaxed text-[#cf222e]/80 dark:text-[#ff7b72]/80">
                Avrupa Yapay Zeka Ofisi (AI Office) ve ulusal veri otoriteleri tarafından
                uygulanabilecek tavan idari yaptırım.
              </p>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="flex flex-col overflow-hidden rounded-md border border-[#d0d7de] bg-[#ffffff] shadow-sm lg:col-span-2 dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="flex items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-2.5 dark:border-[#30363d] dark:bg-[#0d1117]">
            <span className="font-sans text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
              EU AI ACT MADDE BAZLI UYUM MATRİSİ
            </span>
            <span className="font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
              2.908 Vaka Korelasyonu
            </span>
          </div>

          <div className="flex-1 divide-y divide-[#d0d7de] dark:divide-[#30363d]">
            {articlesData.map((art, idx) => (
              <div
                key={idx}
                className="p-4 transition-colors hover:bg-[#f6f8fa]/50 dark:hover:bg-[#161b22]/70"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                        {art.articleCode}: {art.title}
                      </span>
                      <span className="py-0.2 rounded border border-[#d0d7de] bg-[#eaeef2] px-1.5 font-sans text-[10px] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
                        {art.riskCategory}
                      </span>
                    </div>
                    <p className="text-xs text-[#656d76] dark:text-[#8b949e]">{art.description}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                        %{art.compliancePercentage}
                      </span>
                      <span className="block font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
                        {art.incidentCount} Vaka
                      </span>
                    </div>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#eaeef2] dark:bg-[#21262d]">
                      <div
                        className={`h-full rounded-full ${
                          art.compliancePercentage >= 95
                            ? "bg-[#1a7f37] dark:bg-[#3fb950]"
                            : art.compliancePercentage >= 90
                              ? "bg-[#9a6700] dark:bg-[#d29922]"
                              : "bg-[#cf222e] dark:bg-[#ff7b72]"
                        }`}
                        style={{ width: `${art.compliancePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
