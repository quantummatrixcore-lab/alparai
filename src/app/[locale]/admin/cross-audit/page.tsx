"use client";

import React, { useState } from "react";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Play,
  Flame,
  Bot,
} from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

interface ModelVerdict {
  name: string;
  provider: string;
  latency: string;
  status: "VIOLATION" | "COMPLIANT" | "SUSPICIOUS";
  confidence: number;
  reason: string;
}

export default function CrossAuditPage() {
  const [models, setModels] = useState<ModelVerdict[]>([
    {
      name: "OpenAI GPT-4o",
      provider: "OpenAI",
      latency: "420ms",
      status: "VIOLATION",
      confidence: 94,
      reason: "Madde 6 Kapsamında Biyometrik Veri Ayrımcılığı ve Profilleme Tespit Edildi.",
    },
    {
      name: "Anthropic Claude 3.7 Sonnet",
      provider: "Anthropic",
      latency: "580ms",
      status: "VIOLATION",
      confidence: 96,
      reason: "CVSS-AI 8.4: Aday Puanlama Algoritmasında Demografik Sapma (Bias) Doğrulandı.",
    },
    {
      name: "Google Gemini 2.0 Pro",
      provider: "Google",
      latency: "310ms",
      status: "VIOLATION",
      confidence: 91,
      reason: "Kullanıcı İzinleri Olmaksızın Sesli Analiz Çıkarımı Yapıldı.",
    },
    {
      name: "DeepSeek R1",
      provider: "DeepSeek",
      latency: "1200ms",
      status: "VIOLATION",
      confidence: 98,
      reason: "Sistematik Mantık İhlali ve Regülatif Uyumsuzluk Teyit Edildi.",
    },
    {
      name: "Meta Llama 3.3 70B",
      provider: "Meta",
      latency: "640ms",
      status: "SUSPICIOUS",
      confidence: 78,
      reason: "Eğitim Verisi Dağılımında Bölgesel Sapma İhtimali Mevcut.",
    },
  ]);

  const [isRunningQuorum, setIsRunningQuorum] = useState(false);
  const [quorumResultMsg, setQuorumResultMsg] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState("ALP-2026-0842");

  const handleRunCrossAudit = () => {
    setIsRunningQuorum(true);
    setQuorumResultMsg(null);
    setTimeout(() => {
      setIsRunningQuorum(false);
      setQuorumResultMsg(
        "Byzantine Konsensüs Tamamlandı: 5 Modelden 4'ü Kesin İhlal Yönünde Oy Kullandı (%95.4 Ağırlıklı Güven Skoru).",
      );
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded border border-[#d0d7de] bg-[#eaeef2] px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
              KÜME 1: HESAP VEREBİLİRLİK & HAKEMLİK
            </span>
            <span className="font-sans text-xs font-semibold text-[#1a7f37] dark:text-[#3fb950]">
              %96.4 BYZANTINE KONSENSÜS QUORUM
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Çoklu Model Çapraz Denetim Masası (Cross-Audit)
          </h1>
          <p className="mt-0.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            Tek bir AI modeline bağımlılığı yok eden, 5 bağımsız frontier model ile Byzantine
            konsensüs denetimi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCrossAudit}
            disabled={isRunningQuorum}
            className="flex items-center gap-1.5 rounded-md bg-[#238636] px-3 py-1.5 font-sans text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#2ea043] disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 ${isRunningQuorum ? "animate-spin" : ""}`} />
            <span>
              {isRunningQuorum ? "Hakem Quorumu Çalışıyor..." : "Yeni Çapraz Denetim Tetikle"}
            </span>
          </button>
        </div>
      </div>

      {quorumResultMsg && (
        <div className="animate-in fade-in flex items-center gap-2 rounded-md border border-[#4ac26b]/40 bg-[#dafbe1] p-3 font-sans text-xs text-[#1a7f37] duration-200 dark:bg-[#04260f] dark:text-[#3fb950]">
          <ShieldCheck className="h-4 w-4 text-[#1a7f37] dark:text-[#3fb950]" />
          <span>{quorumResultMsg}</span>
        </div>
      )}

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Quorum Konsensüs Oranı"
          value="%96.4"
          change="+1.2% sapma toleransı"
          changeType="positive"
          subtext="Byzantine fault-tolerant denetim"
          icon={Scale}
        />
        <MetricCard
          label="Aktif Hakem Modeller"
          value="5 Frontier Model"
          change="OpenAI, Claude, Gemini, DeepSeek, Meta"
          changeType="neutral"
          subtext="Çoklu sağlayıcı bağımsızlığı"
          icon={Bot}
        />
        <MetricCard
          label="Ortalama Hakem Gecikmesi"
          value="524 ms"
          change="Paralel asenkron çağrı"
          changeType="positive"
          subtext="Eşzamanlı 5 API inferansı"
          icon={Cpu}
        />
        <MetricCard
          label="Çelişkili Kararlar (Disputes)"
          value="%3.6 Vaka"
          change="İnsan hakemine sevk"
          changeType="neutral"
          subtext="Human-in-the-loop incelemesi"
          icon={AlertTriangle}
        />
      </div>

      {/* Active Models Table */}
      <div className="overflow-hidden rounded-md border border-[#d0d7de] bg-[#ffffff] shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] px-4 py-2.5 dark:border-[#30363d] dark:bg-[#0d1117]">
          <span className="font-sans text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
            SEÇİLİ VAKA İÇİN MODEL HAKEM GÖRÜŞLERİ ({selectedIncidentId})
          </span>
          <span className="font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
            4/5 İhlal Kararı (Ağır İhlal Teyidi)
          </span>
        </div>

        <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
          {models.map((m, idx) => (
            <div
              key={idx}
              className="p-4 transition-colors hover:bg-[#f6f8fa]/50 dark:hover:bg-[#161b22]/70"
            >
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                      {m.name}
                    </span>
                    <span className="py-0.2 rounded border border-[#d0d7de] bg-[#eaeef2] px-1.5 font-sans text-[10px] text-[#656d76] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#8b949e]">
                      {m.provider}
                    </span>
                    <span
                      className={`py-0.2 rounded border px-1.5 font-sans text-[10px] ${
                        m.status === "VIOLATION"
                          ? "border-[#ff8182]/40 bg-[#ffebe9] text-[#cf222e] dark:bg-[#490202] dark:text-[#ff7b72]"
                          : m.status === "SUSPICIOUS"
                            ? "border-[#d4a72c]/40 bg-[#fff8c5] text-[#9a6700] dark:bg-[#3b2300] dark:text-[#d29922]"
                            : "border-[#4ac26b]/40 bg-[#dafbe1] text-[#1a7f37] dark:bg-[#04260f] dark:text-[#3fb950]"
                      }`}
                    >
                      {m.status === "VIOLATION"
                        ? "İhlal Tespiti"
                        : m.status === "SUSPICIOUS"
                          ? "Şüpheli"
                          : "Uyumlu"}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#656d76] dark:text-[#8b949e]">
                    Gerekçe: {m.reason}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-sans text-xs font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                      %{m.confidence} Güven
                    </span>
                    <span className="block font-sans text-[10px] text-[#656d76] dark:text-[#8b949e]">
                      {m.latency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
