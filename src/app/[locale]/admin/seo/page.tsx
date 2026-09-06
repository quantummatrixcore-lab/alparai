"use client";

import React from "react";
import {
  Search,
  TrendingUp,
  Globe,
  Award,
  Users,
  UserCheck,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function SEOPage() {
  const keywords = [
    {
      kw: "EU AI Act Article 73 incident reporting",
      rank: "#1",
      volume: "14.200/ay",
      intent: "High-Value B2B",
    },
    {
      kw: "AI liability incident database",
      rank: "#1",
      volume: "8.900/ay",
      intent: "Commercial Insurance",
    },
    {
      kw: "OpenAI GPT-4o vulnerability tracker",
      rank: "#2",
      volume: "22.400/ay",
      intent: "Tech / Red Team",
    },
    {
      kw: "AI safety whistleblowing platform",
      rank: "#1",
      volume: "6.100/ay",
      intent: "Whistleblower Lead",
    },
  ];

  const ceoMentions = [
    {
      outlet: "Financial Times Tech Digest",
      title: "Why Alparai's 2,880 Incident Dataset is the Real Benchmark for AI Safety",
      date: "2026-08-25",
      impact: "Tier 1 Global Press",
    },
    {
      outlet: "Bloomberg AI Governance Podcast",
      title: "CEO Interview: Regulating Frontier Models via Statutory Fine Simulators",
      date: "2026-08-20",
      impact: "Institutional Reach",
    },
    {
      outlet: "TechCrunch Enterprise",
      title: "Alparai Raises the Bar on EU AI Act Whistleblower Protection",
      date: "2026-08-12",
      impact: "Silicon Valley Reach",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 2: BÜYÜME & İLETİŞİM
            </span>
            <span className="font-sans text-xs font-semibold text-emerald-400">
              SEO, CEO VISIBILITY & TRAFFIC TELEMETRY
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            SEO, CEO Görünürlüğü & Ziyaretçi Analitiği Masası (/seo)
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            Ziyaretçi telemetrisi, Google 1. sıra anahtar kelime hakimiyeti ve CEO/Kurucu küresel
            basın görünürlüğü
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Aylık Tekil Ziyaretçi"
          value="184.200+"
          subtext="Ort. Oturum Süresi: 4dk 12sn"
          change="+%38.4"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          label="1. Sıradaki Anahtar Kelimeler"
          value="42 Terim"
          subtext="EU AI Act & LLM Zafiyet Arama Terimleri"
          changeType="positive"
          icon={Search}
        />
        <MetricCard
          label="Domain Otoritesi (DA)"
          value="68 / 100"
          subtext="Oxford & AB Resmi Bülten Backlinkleri"
          change="+4 puan"
          changeType="positive"
          icon={Award}
        />
        <MetricCard
          label="CEO / Basın Görünürlüğü"
          value="14 Manşet"
          subtext="FT, Bloomberg, TechCrunch"
          changeType="positive"
          icon={UserCheck}
        />
      </div>

      {/* Main Grid: Keywords + CEO Mentions */}
      <div className="grid grid-cols-1 gap-6 font-sans text-xs lg:grid-cols-2">
        {/* Keywords */}
        <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
          <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
            Stratejik B2B Arama Kelimeleri Sıralaması
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                  <th className="pb-2">ANAHTAR KELİME</th>
                  <th className="pb-2">SIRA</th>
                  <th className="pb-2">HACİM</th>
                  <th className="pb-2 text-right">NİYET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {keywords.map((k) => (
                  <tr
                    key={k.kw}
                    className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                  >
                    <td className="py-3 font-semibold text-zinc-200">{k.kw}</td>
                    <td className="py-3 font-bold text-emerald-400">{k.rank}</td>
                    <td className="py-3 text-[#656d76] dark:text-[#c9d1d9]">{k.volume}</td>
                    <td className="py-3 text-right font-medium text-cyan-400">{k.intent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CEO Press Mentions */}
        <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
          <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
            CEO & Kurucu Basın / Medya Görünürlüğü
          </h2>

          <div className="space-y-3 font-sans text-xs">
            {ceoMentions.map((m) => (
              <div
                key={m.title}
                className="space-y-1 rounded-md border border-[#d0d7de] bg-zinc-950 p-3 transition-colors hover:border-zinc-700 dark:border-[#30363d]"
              >
                <div className="flex items-center justify-between font-sans text-[10px]">
                  <span className="font-bold text-cyan-400">{m.outlet}</span>
                  <span className="text-[#656d76] dark:text-[#8b949e]">{m.date}</span>
                </div>
                <div className="font-semibold text-[#1f2328] dark:text-[#f0f6fc]">{m.title}</div>
                <div className="font-sans text-[11px] text-emerald-400">{m.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
