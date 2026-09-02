"use client";

import React, { useState } from "react";
import { Building2, DollarSign, FileText, Plus } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { useTranslations } from "next-intl";

interface InvestorItem {
  id: string;
  firmName: string;
  contactPartner: string;
  stage: string;
  checkSizeUsd: string;
  dataRoomAccessCount: number;
  status: "TERM_SHEET" | "DILIGENCE" | "FIRST_CALL" | "INTRO";
}

const initialInvestors: InvestorItem[] = [
  {
    id: "INV-01",
    firmName: "Sequoia Capital Europe",
    contactPartner: "Luciana Lixandru",
    stage: "Series Seed",
    checkSizeUsd: "$2.5M - $4M",
    dataRoomAccessCount: 18,
    status: "DILIGENCE",
  },
  {
    id: "INV-02",
    firmName: "Index Ventures",
    contactPartner: "Jan Hammer",
    stage: "Seed Lead",
    checkSizeUsd: "$3.0M",
    dataRoomAccessCount: 14,
    status: "TERM_SHEET",
  },
  {
    id: "INV-03",
    firmName: "Y Combinator (W26)",
    contactPartner: "Garry Tan Batch Review",
    stage: "Pre-Seed / Batch",
    checkSizeUsd: "$500k",
    dataRoomAccessCount: 22,
    status: "DILIGENCE",
  },
  {
    id: "INV-04",
    firmName: "Yapay Zeka Fabrikası (İş Bankası / Maxis)",
    contactPartner: "İş Kuleleri YZF Komitesi & SoftTech",
    stage: "Seed / Acceleration",
    checkSizeUsd: "$250k - $500k + PoC",
    dataRoomAccessCount: 16,
    status: "FIRST_CALL",
  },
];

export default function InvestorsPage() {
  const t = useTranslations("admin.sidebar");
  const [investors] = useState<InvestorItem[]>(initialInvestors);

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              {t("cluster3Title")}
            </span>
            <span className="text-xs font-semibold text-emerald-400">SERIES SEED / A PIPELINE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            {t("investors")}
          </h1>
          <p className="mt-0.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            Institutional VC pipeline, diligence dataroom telemetry, and investment rounds.
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-blue-500/40 bg-blue-600 px-3 py-1.5 text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-blue-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">Add Investor</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Active Investment Pipeline"
          value="$6.5M"
          subtext="Sequoia, Index & Y Combinator"
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          label="Data Room Visits"
          value="54 Audits"
          subtext="Dataset & Legal Vault Reviewed"
          icon={FileText}
        />
        <MetricCard
          label="Engaged VC Funds"
          value="14 VCs"
          subtext="Europe & Silicon Valley Tier-1"
          icon={Building2}
        />
      </div>

      {/* Investors Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Institutional Investor Roster & Status
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-[#656d76] dark:border-[#30363d] dark:text-[#8b949e]">
                <th className="pb-2">FIRM / FUND</th>
                <th className="pb-2">PARTNER</th>
                <th className="pb-2">STAGE</th>
                <th className="pb-2">TARGET CHECK</th>
                <th className="pb-2">DATA ROOM</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {investors.map((inv) => (
                <tr
                  key={inv.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-[#1f2328] dark:text-[#f0f6fc]">
                    {inv.firmName}
                  </td>
                  <td className="py-3 font-semibold text-blue-500 dark:text-blue-400">
                    {inv.contactPartner}
                  </td>
                  <td className="py-3 text-[#656d76] dark:text-[#8b949e]">{inv.stage}</td>
                  <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {inv.checkSizeUsd}
                  </td>
                  <td className="py-3 text-[#656d76] dark:text-[#8b949e]">
                    {inv.dataRoomAccessCount} Visits
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        inv.status === "TERM_SHEET"
                          ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                          : inv.status === "DILIGENCE"
                            ? "border-blue-800 bg-blue-950/60 text-blue-300"
                            : "border-zinc-700 bg-zinc-800 text-[#656d76] dark:text-[#c9d1d9]"
                      }`}
                    >
                      {inv.status.replace(/_/g, " ")}
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
