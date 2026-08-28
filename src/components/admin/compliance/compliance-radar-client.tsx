"use client";

import * as React from "react";
import { useState } from "react";
import { Scale, ShieldCheck, FileSpreadsheet, Clock, Euro, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/admin/admin-design-kit";

interface ComplianceCheckItem {
  id: string;
  article: string;
  title: string;
  tier: "unacceptable" | "high_risk" | "transparency" | "gpai";
  status: "compliant" | "in_progress" | "action_required";
  responsibleTeam: string;
  description: string;
}

const CHECKLIST_ITEMS: ComplianceCheckItem[] = [
  {
    id: "art-5",
    article: "Article 5",
    title: "Prohibition of Cognitive Manipulation & Social Scoring",
    tier: "unacceptable",
    status: "compliant",
    responsibleTeam: "Safety Alignment",
    description:
      "Zero deployment of subliminal techniques, vulnerability exploitation, or social classification systems.",
  },
  {
    id: "art-9",
    article: "Article 9",
    title: "Risk Management System for High-Risk AI",
    tier: "high_risk",
    status: "compliant",
    responsibleTeam: "Risk Engineering",
    description:
      "Continuous lifecycle testing, residual risk mitigation, and post-market monitoring protocols established.",
  },
  {
    id: "art-10",
    article: "Article 10",
    title: "Data Governance & Training Bias Auditing",
    tier: "high_risk",
    status: "in_progress",
    responsibleTeam: "Data Governance",
    description:
      "Statistical validation ensuring datasets are representative, free of systemic discrimination and sanitized of PII.",
  },
  {
    id: "art-14",
    article: "Article 14",
    title: "Human Oversight (Human-in-the-Loop Safeguards)",
    tier: "high_risk",
    status: "compliant",
    responsibleTeam: "Operations",
    description:
      "Built-in stop button and override authority for designated human moderators on all autonomous agent actions.",
  },
  {
    id: "art-50",
    article: "Article 50",
    title: "Synthetic Media & Deepfake Transparency Watermarking",
    tier: "transparency",
    status: "compliant",
    responsibleTeam: "Frontend / Media",
    description:
      "Machine-readable C2PA metadata watermarks applied to all synthetic media and transparent disclosures for AI interaction.",
  },
  {
    id: "art-55",
    article: "Article 55",
    title: "GPAI Systemic Risk & Red-Teaming Evaluation",
    tier: "gpai",
    status: "in_progress",
    responsibleTeam: "Red Team Lab",
    description:
      "Adversarial red-teaming and energy consumption tracking for models exceeding 10^25 FLOPs training compute.",
  },
  {
    id: "art-73",
    article: "Article 73",
    title: "72-Hour Serious Incident Regulatory Notification",
    tier: "high_risk",
    status: "compliant",
    responsibleTeam: "Legal & Incident Response",
    description:
      "Automated direct dispatch channel to national market surveillance authorities within 72 hours of critical breach.",
  },
];

export function ComplianceRadarClient() {
  const [checklist, setChecklist] = useState<ComplianceCheckItem[]>(CHECKLIST_ITEMS);
  const [turnoverMillion, setTurnoverMillion] = useState<number>(120);
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [exportSuccess, setExportSuccess] = useState(false);

  const calculatePenalty = (turnover: number) => {
    const calculated = turnover * 1000000 * 0.07;
    const statutoryCap = 35000000;
    const maxFine = Math.max(calculated, statutoryCap);
    return (maxFine / 1000000).toFixed(1);
  };

  const filteredItems = checklist.filter((item) => {
    return selectedTier === "all" || item.tier === selectedTier;
  });

  const compliantCount = checklist.filter((i) => i.status === "compliant").length;
  const complianceScore = Math.round((compliantCount / checklist.length) * 100);

  const toggleStatus = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus =
          item.status === "compliant"
            ? "in_progress"
            : item.status === "in_progress"
              ? "action_required"
              : "compliant";
        return { ...item, status: nextStatus };
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* TOP METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="EU AI Act Readiness Index"
          value={`${complianceScore}%`}
          variant="success"
          icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
          tooltip="Overall adherence score across audited EU AI Act Articles"
        />
        <MetricCard
          label="Art. 73 72-Hour SLA"
          value="100% Compliant"
          variant="success"
          icon={<Clock className="h-5 w-5 text-emerald-400" />}
          tooltip="Average time to log and triage serious incidents under 18 hours"
        />
        <MetricCard
          label="High-Risk AI Systems Audited"
          value="14 Models"
          variant="default"
          icon={<Building2 className="h-5 w-5 text-purple-400" />}
          tooltip="Evaluated under Annex III safety critical classifications"
        />
        <MetricCard
          label="Max Statutory Penalty Exposure"
          value={`€${calculatePenalty(turnoverMillion)}M`}
          variant="danger"
          icon={<Euro className="h-5 w-5 text-rose-400" />}
          tooltip="Calculated based on 7% global turnover or €35M statutory cap"
        />
      </div>

      {/* PENALTY CALCULATOR & RISK TIERS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* PENALTY SIMULATOR */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl lg:col-span-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Euro className="h-4 w-4 text-rose-400" />
              EU AI Act Statutory Penalty Calculator (Article 99)
            </h3>
            <span className="text-[11px] font-bold text-rose-400">Max 7% Turnover / €35M</span>
          </div>

          <p className="text-xs leading-relaxed text-zinc-400">
            Non-compliance with Article 5 prohibitions or Article 10 data governance triggers
            maximum administrative fines under EU regulations.
          </p>

          <div className="space-y-3 rounded-xl border border-white/5 bg-black/40 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">
                Simulated Enterprise Annual Turnover:
              </span>
              <span className="font-mono text-sm font-bold text-purple-400">
                €{turnoverMillion} Million
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={turnoverMillion}
              onChange={(e) => setTurnoverMillion(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-purple-500"
            />
            <div className="flex justify-between font-mono text-[10px] text-zinc-500">
              <span>€10M</span>
              <span>€500M</span>
              <span>€1 Billion</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">
                Calculated Maximum Exposure
              </div>
              <div className="mt-0.5 font-mono text-xl font-black text-rose-300">
                €{calculatePenalty(turnoverMillion)} Million
              </div>
            </div>
            <div className="text-right text-[11px] text-zinc-400">
              <span>Protected by Alpar AI Trust Shield</span>
            </div>
          </div>
        </div>

        {/* RISK TIER CLASSIFICATION SUMMARY */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl lg:col-span-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Scale className="h-4 w-4 text-purple-400" />
              EU AI Act Risk Governance Tiers
            </h3>
            <span className="font-mono text-[11px] text-emerald-400">Active Monitoring</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
              <span className="text-[10px] font-black text-rose-400 uppercase">
                Tier 1: Unacceptable
              </span>
              <p className="text-xs font-bold text-white">Prohibited Systems</p>
              <p className="text-[11px] leading-snug text-zinc-400">
                Social scoring, biometric categorization, cognitive manipulation (Art. 5).
              </p>
            </div>

            <div className="space-y-1 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
              <span className="text-[10px] font-black text-amber-400 uppercase">
                Tier 2: High Risk
              </span>
              <p className="text-xs font-bold text-white">Annex III Systems</p>
              <p className="text-[11px] leading-snug text-zinc-400">
                Critical infrastructure, hiring, law enforcement, education, banking.
              </p>
            </div>

            <div className="space-y-1 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5">
              <span className="text-[10px] font-black text-cyan-400 uppercase">
                Tier 3: Transparency
              </span>
              <p className="text-xs font-bold text-white">Article 50 Obligations</p>
              <p className="text-[11px] leading-snug text-zinc-400">
                AI chatbots, synthetic text, deepfakes, emotion recognition disclosures.
              </p>
            </div>

            <div className="space-y-1 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5">
              <span className="text-[10px] font-black text-purple-400 uppercase">
                Tier 4: GPAI Models
              </span>
              <p className="text-xs font-bold text-white">Chapter V Systemic Risk</p>
              <p className="text-[11px] leading-snug text-zinc-400">
                Frontier foundation models &gt;10^25 FLOPs training compute.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ARTICLE CHECKLIST & REGULATORY PACKAGE */}
      <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Article-by-Article Compliance Checklist
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Interactive audit log mapping platform readiness to statutory EU AI Act mandates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-zinc-300 focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="unacceptable">Unacceptable Risk</option>
              <option value="high_risk">High Risk (Annex III)</option>
              <option value="transparency">Transparency (Art 50)</option>
              <option value="gpai">GPAI (Chapter V)</option>
            </select>

            <button
              onClick={() => {
                setExportSuccess(true);
                setTimeout(() => setExportSuccess(false), 3000);
              }}
              className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/15 px-4 py-2 text-xs font-bold text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all hover:bg-purple-500/25"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {exportSuccess ? "Filing Exported ✓" : "Export Regulatory Filing"}
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-black/20">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleStatus(item.id)}
              className="flex cursor-pointer flex-col gap-3 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-purple-400">
                    {item.article}
                  </span>
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] text-zinc-500">• {item.responsibleTeam}</span>
                </div>
                <p className="text-xs text-zinc-400">{item.description}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[10px] font-black tracking-wider uppercase",
                    item.status === "compliant" &&
                      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                    item.status === "in_progress" &&
                      "border-amber-500/30 bg-amber-500/10 text-amber-400",
                    item.status === "action_required" &&
                      "border-rose-500/30 bg-rose-500/10 text-rose-400",
                  )}
                >
                  {item.status === "compliant"
                    ? "✓ Compliant"
                    : item.status === "in_progress"
                      ? "⏳ In Progress"
                      : "⚠ Action Req."}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
