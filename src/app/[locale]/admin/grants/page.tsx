"use client";

import React, { useState } from "react";
import { Landmark, CheckCircle2, Clock, DollarSign, Plus } from "lucide-react";
import { MetricCard } from "@/components/admin-core/metric-card";
import { useTranslations } from "next-intl";

interface GrantItem {
  id: string;
  program: string;
  requestedBudgetTry: number;
  deadlineDate: string;
  completionPercentage: number;
  status: "APPROVED" | "UNDER_EVALUATION" | "IN_PREPARATION";
}

const initialGrants: GrantItem[] = [
  {
    id: "GR-01",
    program: "TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç",
    requestedBudgetTry: 2400000,
    deadlineDate: "2026-09-30",
    completionPercentage: 85,
    status: "UNDER_EVALUATION",
  },
  {
    id: "GR-02",
    program: "KOSGEB Ar-Ge, Ür-Ge ve İnovasyon",
    requestedBudgetTry: 1850000,
    deadlineDate: "2026-07-15",
    completionPercentage: 100,
    status: "APPROVED",
  },
  {
    id: "GR-03",
    program: "Horizon Europe CL4 AI Trust & Governance",
    requestedBudgetTry: 14500000,
    deadlineDate: "2026-11-20",
    completionPercentage: 60,
    status: "IN_PREPARATION",
  },
  {
    id: "GR-04",
    program: "Teknopark İstanbul Cube Go / Kuluçka (4691 Teşvik)",
    requestedBudgetTry: 5000000,
    deadlineDate: "2026-09-15",
    completionPercentage: 90,
    status: "UNDER_EVALUATION",
  },
];

export default function GrantsPage() {
  const t = useTranslations("admin.sidebar");
  const [grants] = useState<GrantItem[]>(initialGrants);

  const totalRequested = grants.reduce((acc, g) => acc + g.requestedBudgetTry, 0);
  const totalApproved = grants
    .filter((g) => g.status === "APPROVED")
    .reduce((acc, g) => acc + g.requestedBudgetTry, 0);
  const inEvalCount = grants.filter((g) => g.status === "UNDER_EVALUATION").length;

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#d0d7de] pb-4 md:flex-row md:items-center dark:border-[#30363d]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-[#656d76] dark:text-[#c9d1d9]">
              {t("cluster3Title")}
            </span>
            <span className="text-xs font-semibold text-cyan-400">
              NON-DILUTIVE GRANT AUTOPILOT
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
            {t("grants")}
          </h1>
          <p className="mt-0.5 text-xs text-[#656d76] dark:text-[#8b949e]">
            Non-dilutive R&D grant portfolio, application milestones, and budget tracking.
          </p>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 text-xs font-semibold !text-white shadow-sm transition-colors hover:bg-emerald-500">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="!text-white">New Grant Proposal</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Requested Grants"
          value={`${totalRequested.toLocaleString()} ₺`}
          subtext="TÜBİTAK, KOSGEB & Horizon Europe"
          changeType="positive"
          icon={Landmark}
        />
        <MetricCard
          label="Secured & Approved"
          value={`${totalApproved.toLocaleString()} ₺`}
          subtext="Executed & Sealed"
          changeType="positive"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Programs Under Evaluation"
          value={`${inEvalCount} Programs`}
          subtext="Jury & Peer Review Stage"
          icon={Clock}
        />
      </div>

      {/* Grants Table */}
      <div className="space-y-4 rounded-md border border-[#d0d7de] bg-[#ffffff] p-5 shadow-sm dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-none">
        <h2 className="text-sm font-bold text-[#1f2328] dark:text-[#f0f6fc]">
          Active Grant Programs & Pipeline
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#d0d7de] text-[#656d76] dark:border-[#30363d] dark:text-[#8b949e]">
                <th className="pb-2">PROGRAM</th>
                <th className="pb-2">REQUESTED BUDGET</th>
                <th className="pb-2">DEADLINE</th>
                <th className="pb-2">PREPARATION</th>
                <th className="pb-2 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {grants.map((g) => (
                <tr
                  key={g.id}
                  className="transition-colors hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
                >
                  <td className="py-3 font-bold text-[#1f2328] dark:text-[#f0f6fc]">{g.program}</td>
                  <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {g.requestedBudgetTry.toLocaleString()} ₺
                  </td>
                  <td className="py-3 text-[#656d76] dark:text-[#8b949e]">{g.deadlineDate}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{ width: `${g.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#656d76] dark:text-[#8b949e]">
                        %{g.completionPercentage}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
                        g.status === "APPROVED"
                          ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                          : "border-zinc-700 bg-zinc-800 text-[#656d76] dark:text-[#c9d1d9]"
                      }`}
                    >
                      {g.status.replace(/_/g, " ")}
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
