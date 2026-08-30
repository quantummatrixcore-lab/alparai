"use client";

import React from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Plus, Users } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";

export default function MailHubPage() {
  const campaigns = [
    {
      id: "EML-01",
      subject: "🚨 EU AI Act 72-Hour SLA Alert: New Incident Ingested",
      audience: "CISO & Risk Officers (540 Alıcı)",
      openRate: "%78.4",
      status: "SENT",
    },
    {
      id: "EML-02",
      subject: "Monthly AI Safety & Actuarial Loss Risk Digest #08",
      audience: "Insurance Underwriters (182 Alıcı)",
      openRate: "%64.1",
      status: "SENT",
    },
    {
      id: "EML-03",
      subject: "Alparai Q3 Growth & Data Moat Investor Update",
      audience: "VC & Angel Pipeline (42 Alıcı)",
      openRate: "%92.5",
      status: "SCHEDULED",
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
            <span className="font-sans text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
              RESEND & GOOGLE WORKSPACE
            </span>
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            Kurumsal E-Posta & Bildirim Hub'ı
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
            CISO kritik vaka uyarıları, yatırımcı bültenleri ve aktüeryal risk bildirim akışı
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-600 px-3 py-1.5 font-mono text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-cyan-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Yeni Kampanya / Bildirim Başlat</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Ortalama Açılma Oranı"
          value="%74.2"
          subtext="B2B Güvenlik & Hukuk Odaklı Yüksek İlgi"
          changeType="positive"
          icon={Mail}
        />
        <MetricCard
          label="Kayıtlı Kurumsal Alıcı"
          value="1.840"
          subtext="CISO, Risk Yöneticisi ve VC Listesi"
          icon={Users}
        />
        <MetricCard
          label="İletim Başarısı"
          value="%99.8"
          subtext="Sıfır Spam, Dedicated Kurumsal IP"
          changeType="positive"
          icon={CheckCircle2}
        />
      </div>

      {/* Campaigns Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="font-sans text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Son E-Posta Gönderimleri ve SLA Bildirimleri
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#d0d7de] text-zinc-400 dark:border-[#30363d] dark:text-[#8b949e] dark:text-[#656d76]">
                <th className="pb-2">ID</th>
                <th className="pb-2">KONU BAŞLIĞI</th>
                <th className="pb-2">HEDEF KİTLE</th>
                <th className="pb-2">AÇILMA ORANI</th>
                <th className="pb-2 text-right">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-zinc-200">{c.id}</td>
                  <td className="max-w-sm truncate py-3 font-sans text-[#656d76] dark:text-[#c9d1d9]">
                    {c.subject}
                  </td>
                  <td className="py-3 text-zinc-400 dark:text-[#8b949e] dark:text-[#656d76]">
                    {c.audience}
                  </td>
                  <td className="py-3 font-bold text-emerald-400">{c.openRate}</td>
                  <td className="py-3 text-right">
                    <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-[#656d76] dark:text-[#c9d1d9]">
                      {c.status}
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
