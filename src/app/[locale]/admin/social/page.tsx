"use client";

import React, { useState } from "react";
import {
  Share2,
  Video,
  Send,
  Clock,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Shield,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

interface SocialChannel {
  id: string;
  name: string;
  category: "DEV_SECURITY" | "B2B_EXECUTIVE" | "VIRAL_MASS";
  handle: string;
  followers: string;
  engagement: string;
  status: "CONNECTED" | "NEEDS_AUTH" | "SYNCING";
  unreadDMs: number;
}

export default function SocialStudioPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const channels: SocialChannel[] = [
    {
      id: "x",
      name: "X (Twitter)",
      category: "B2B_EXECUTIVE",
      handle: "@AlparAI",
      followers: "48.2k",
      engagement: "%4.8",
      status: "CONNECTED",
      unreadDMs: 14,
    },
    {
      id: "linkedin",
      name: "LinkedIn Company",
      category: "B2B_EXECUTIVE",
      handle: "alpar-ai",
      followers: "32.1k",
      engagement: "%6.2",
      status: "CONNECTED",
      unreadDMs: 8,
    },
    {
      id: "reddit",
      name: "Reddit (r/AlparAI & r/LocalLLaMA)",
      category: "DEV_SECURITY",
      handle: "u/AlparAI_Official",
      followers: "18.4k",
      engagement: "%8.9",
      status: "CONNECTED",
      unreadDMs: 23,
    },
    {
      id: "hackerone",
      name: "HackerOne Bug Bounty Program",
      category: "DEV_SECURITY",
      handle: "alparai_security",
      followers: "420 Hunters",
      engagement: "100% SLA",
      status: "CONNECTED",
      unreadDMs: 2,
    },
    {
      id: "hackernews",
      name: "Hacker News Show HN Radar",
      category: "DEV_SECURITY",
      handle: "alpar_core",
      followers: "Top 5 Frontpage",
      engagement: "98 pts",
      status: "CONNECTED",
      unreadDMs: 0,
    },
    {
      id: "instagram",
      name: "Instagram Broadcast",
      category: "VIRAL_MASS",
      handle: "@alparai.official",
      followers: "64.5k",
      engagement: "%5.1",
      status: "CONNECTED",
      unreadDMs: 19,
    },
    {
      id: "tiktok",
      name: "TikTok AI Investigation Shorts",
      category: "VIRAL_MASS",
      handle: "@alpar.ai",
      followers: "112.0k",
      engagement: "%11.4",
      status: "CONNECTED",
      unreadDMs: 41,
    },
    {
      id: "youtube",
      name: "YouTube Veo 2 / 4K Documentary",
      category: "VIRAL_MASS",
      handle: "@AlparAISafety",
      followers: "28.9k",
      engagement: "%7.8",
      status: "CONNECTED",
      unreadDMs: 5,
    },
  ];

  const posts = [
    {
      id: "SOC-01",
      platform: "LinkedIn & X",
      hook: "🚨 2.908 AI Zafiyeti Açıklandı: EU AI Act Madde 73 Neden Tüm Şirketleri Değiştirecek?",
      time: "Bugün 09:30 (Peak Hour)",
      status: "SCHEDULED",
      reach: "Est. 45k",
    },
    {
      id: "SOC-02",
      platform: "Reddit & Hacker News",
      hook: "⚡ Show HN: Alparai – Open-source 2,880 AI Incident Dataset with EU AI Act Mapping & Live API",
      time: "Bugün 14:00 (SF Peak)",
      status: "READY_TO_POST",
      reach: "Est. 80k",
    },
    {
      id: "SOC-03",
      platform: "TikTok & Instagram",
      hook: "⚠️ ChatGPT bu banka şifrelerini sızdırdı mı? İşte 10 saniyede gerçek!",
      time: "Bugün 19:00",
      status: "READY_TO_POST",
      reach: "Est. 150k",
    },
    {
      id: "SOC-04",
      platform: "YouTube / Google Flow",
      hook: "🎬 4K Sinematik AI Soruşturma: Autonomous Mobility Gece Görüş Zafiyeti",
      time: "Yarın 18:00",
      status: "GENERATING_VIDEO",
      reach: "Est. 30k",
    },
  ];

  const filteredChannels = channels.filter(
    (c) => selectedCategory === "ALL" || c.category === selectedCategory,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-sans text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              KÜME 2: BÜYÜME & İLETİŞİM
            </span>
            <span className="font-sans text-xs font-semibold text-cyan-400">
              8 MERKEZİ PLATFORM & GOOGLE FLOW
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            360° Sosyal Medya & Topluluk Komuta Stüdyosu
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            X, LinkedIn, Reddit, HackerOne, Hacker News, Instagram, TikTok ve YouTube merkezi yayın
            ve etkileşim masası
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-purple-500/40 bg-purple-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-purple-500">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Tüm Kanallara Çoklu Yayın Hazırla</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Toplam Topluluk Erişimi"
          value="346.000+"
          subtext="8 Platformdaki Toplam Takipçi & Geliştirici"
          change="+%28.4 MoM"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          label="Aylık Organik Gösterim"
          value="1.82M"
          subtext="B2B Karar Vericiler & Güvenlik Araştırmacıları"
          changeType="positive"
          icon={Eye}
        />
        <MetricCard
          label="Geliştirici & Red-Team Ağı"
          value="HackerOne + HN"
          subtext="420+ Onaylı Güvenlik Araştırmacısı"
          icon={Shield}
        />
        <MetricCard
          label="Flow 4K Video Stüdyosu"
          value="10.000 Kredi"
          subtext="Google AI Ultra & Veo 2 Motoru Aktif"
          changeType="positive"
          icon={Video}
        />
      </div>

      {/* 8 Channels Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-xs font-bold tracking-wider text-zinc-400 uppercase dark:text-[#8b949e] dark:text-[#656d76]">
            Bağlı 8 Sosyal & Geliştirici Kanalı
          </h2>
          <div className="flex items-center gap-1">
            {["ALL", "B2B_EXECUTIVE", "DEV_SECURITY", "VIRAL_MASS"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded px-2 py-0.5 font-mono text-[11px] transition-colors ${
                  selectedCategory === cat
                    ? "bg-zinc-200 font-bold text-zinc-950"
                    : "border border-[#d0d7de] bg-zinc-900 text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 font-sans text-xs sm:grid-cols-2 lg:grid-cols-4">
          {filteredChannels.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between space-y-2 rounded-md border border-[#d0d7de] bg-[#ffffff] p-3.5 shadow-sm transition-colors hover:border-zinc-700 dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">{c.name}</span>
                <span className="py-0.2 rounded border border-emerald-800 bg-emerald-950/60 px-1.5 text-[10px] text-emerald-300">
                  {c.status}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                {c.handle}
              </div>
              <div className="flex items-center justify-between border-t border-[#d0d7de] pt-2 text-[11px] dark:border-[#30363d]/60">
                <span className="font-semibold text-[#656d76] dark:text-[#c9d1d9]">
                  {c.followers}
                </span>
                <span className="font-medium text-emerald-400">Etk: {c.engagement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Queue Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 font-mono text-xs shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Zamanlanmış Çok Kanallı Gönderi & Video Kuyruğu
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">KOD</th>
                <th className="pb-2">KANALLAR</th>
                <th className="pb-2">VİRAL KANCA & BAŞLIK</th>
                <th className="pb-2">YAYIN VAKTİ</th>
                <th className="pb-2">BEKLENEN ERİŞİM</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {posts.map((p) => (
                <tr
                  key={p.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{p.id}</td>
                  <td className="py-3 font-semibold text-cyan-400">{p.platform}</td>
                  <td className="max-w-sm truncate py-3 font-sans text-[#656d76] dark:text-[#c9d1d9]">
                    {p.hook}
                  </td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {p.time}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">{p.reach}</td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-[#656d76] dark:text-[#c9d1d9]">
                      {p.status}
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
