"use client";

import * as React from "react";
import { useState } from "react";
import { Flame, Scale, FileWarning, CheckCircle2, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/admin/admin-design-kit";

interface LegalThreatItem {
  id: string;
  noticeCode: string;
  vendorEntity: string;
  lawFirm: string;
  threatType: "cease_and_desist" | "slapp_threat" | "dmca_overreach" | "defamation_claim";
  streisandMultiplier: number;
  status:
    "active_countdown" | "publicly_archived" | "challenged_defeated" | "legal_defense_assigned";
  targetIncidentId: string;
  dateReceived: string;
  daysRemaining: number;
  summary: string;
  defenseStatus: string;
}

const INITIAL_THREATS: LegalThreatItem[] = [
  {
    id: "thr-401",
    noticeCode: "STR-2026-0401",
    vendorEntity: "CognitiveCorp Global",
    lawFirm: "Vanguard & Sterling LLP",
    threatType: "cease_and_desist",
    streisandMultiplier: 8.4,
    status: "active_countdown",
    targetIncidentId: "ALP-2026-9841",
    dateReceived: "2 days ago",
    daysRemaining: 5,
    summary:
      "Formal Cease & Desist demanding redaction of multi-tenant training data extraction disclosure, alleging trade secret infringement.",
    defenseStatus: "Whistleblower defense fund attorney assigned (Pro-Bono Network).",
  },
  {
    id: "thr-398",
    noticeCode: "STR-2026-0398",
    vendorEntity: "NeuralBiometrics AG",
    lawFirm: "Hermann Legal Partners",
    threatType: "slapp_threat",
    streisandMultiplier: 9.1,
    status: "publicly_archived",
    targetIncidentId: "ALP-2026-9832",
    dateReceived: "1 week ago",
    daysRemaining: 0,
    summary:
      "Threatened €5M defamation damages if academic biometric spoofing paper was not removed from public database.",
    defenseStatus: "Archived to Public Streisand Ledger; Anti-SLAPP motion prepared.",
  },
  {
    id: "thr-389",
    noticeCode: "STR-2026-0389",
    vendorEntity: "OmniAI Ventures",
    lawFirm: "In-House Counsel",
    threatType: "dmca_overreach",
    streisandMultiplier: 6.7,
    status: "challenged_defeated",
    targetIncidentId: "ALP-2026-9819",
    dateReceived: "2 weeks ago",
    daysRemaining: 0,
    summary:
      "Spurious copyright claim alleging adversarial prompt was proprietary copyrighted code.",
    defenseStatus: "Counter-notice filed; claim withdrawn by claimant.",
  },
];

export function TransparencyDeskClient() {
  const [threats, setThreats] = useState<LegalThreatItem[]>(INITIAL_THREATS);
  const [selectedThreat, setSelectedThreat] = useState<LegalThreatItem | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleAction = (id: string, newStatus: LegalThreatItem["status"], msg: string) => {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    if (selectedThreat?.id === id) {
      setSelectedThreat((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const getThreatTypeBadge = (type: LegalThreatItem["threatType"]) => {
    switch (type) {
      case "cease_and_desist":
        return { label: "Cease & Desist", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
      case "slapp_threat":
        return { label: "SLAPP Threat", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
      case "dmca_overreach":
        return {
          label: "DMCA Overreach",
          cls: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        };
      case "defamation_claim":
        return {
          label: "Defamation Claim",
          cls: "bg-rose-600/15 text-rose-300 border-rose-600/30",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* SUCCESS BANNER */}
      {actionSuccess && (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-sm font-semibold text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-xl">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Average Streisand Multiplier"
          value="8.2x"
          variant="danger"
          icon={<Flame className="h-5 w-5 text-rose-400" />}
          tooltip="Calculated viral publicity amplification factor if censorship is attempted"
        />
        <MetricCard
          label="Legal Defense Fund Pool"
          value="$340,000"
          variant="success"
          icon={<Shield className="h-5 w-5 text-emerald-400" />}
          tooltip="Dedicated whistleblower & researcher anti-SLAPP defense capital"
        />
        <MetricCard
          label="Active Legal Threats"
          value={threats.filter((t) => t.status === "active_countdown").length}
          variant="warning"
          icon={<FileWarning className="h-5 w-5 text-amber-400" />}
          tooltip="Notices under active 7-day public disclosure grace period"
        />
        <MetricCard
          label="Challenged & Defeated Claims"
          value="100%"
          variant="success"
          icon={<Scale className="h-5 w-5 text-emerald-400" />}
          tooltip="All false censorship takedowns successfully defeated without compromising integrity"
        />
      </div>

      {/* THREATS ROSTER */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className={cn("space-y-3", selectedThreat ? "lg:col-span-7" : "lg:col-span-12")}>
          <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl">
            {threats.map((thr) => {
              const typeBadge = getThreatTypeBadge(thr.threatType);
              const isSelected = selectedThreat?.id === thr.id;

              return (
                <div
                  key={thr.id}
                  onClick={() => setSelectedThreat(thr)}
                  className={cn(
                    "flex cursor-pointer flex-col gap-4 p-5 transition-all hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between",
                    isSelected && "border-l-4 border-rose-500 bg-rose-500/5",
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-400">
                        {thr.noticeCode}
                      </span>
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-[10px] font-bold",
                          typeBadge.cls,
                        )}
                      >
                        {typeBadge.label}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        Ref: {thr.targetIncidentId}
                      </span>
                    </div>

                    <h4 className="truncate text-sm font-bold text-white">
                      {thr.vendorEntity} <span className="font-normal text-zinc-500">via</span>{" "}
                      {thr.lawFirm}
                    </h4>

                    <p className="line-clamp-1 text-xs text-zinc-400">{thr.summary}</p>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase">
                        Streisand Index
                      </div>
                      <div className="font-mono text-sm font-black text-rose-400">
                        {thr.streisandMultiplier}x Multiplier
                      </div>
                    </div>
                    {thr.daysRemaining > 0 ? (
                      <span className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-bold text-amber-300">
                        <Clock className="h-3 w-3" /> {thr.daysRemaining}d Left
                      </span>
                    ) : (
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-400">
                        Archived
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* THREAT DETAIL INSPECTOR */}
        {selectedThreat && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-3xl lg:col-span-5">
            <div className="flex items-start justify-between border-b border-white/5 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-rose-400">
                  {selectedThreat.noticeCode}
                </span>
                <h3 className="mt-1 text-base font-bold text-white">
                  {selectedThreat.vendorEntity}
                </h3>
                <p className="text-xs text-zinc-400">Represented by {selectedThreat.lawFirm}</p>
              </div>
              <button
                onClick={() => setSelectedThreat(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1 rounded-xl border border-white/5 bg-black/40 p-3.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  Legal Threat Summary
                </span>
                <p className="leading-relaxed text-zinc-300">{selectedThreat.summary}</p>
              </div>

              <div className="space-y-1 rounded-xl border border-white/5 bg-black/40 p-3.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">
                  Defense & Transparency Status
                </span>
                <p className="leading-relaxed text-zinc-300">{selectedThreat.defenseStatus}</p>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-white/5 pt-4">
              <h5 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Action Responses
              </h5>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  onClick={() =>
                    handleAction(
                      selectedThreat.id,
                      "publicly_archived",
                      `Notice ${selectedThreat.noticeCode} published to Public Streisand Ledger.`,
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-2.5 text-xs font-bold text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all hover:bg-rose-500/25"
                >
                  <Flame className="h-4 w-4" /> Publish to Ledger
                </button>

                <button
                  onClick={() =>
                    handleAction(
                      selectedThreat.id,
                      "legal_defense_assigned",
                      `Pro-bono counsel assigned to challenge ${selectedThreat.noticeCode}.`,
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/15 px-3 py-2.5 text-xs font-bold text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all hover:bg-purple-500/25"
                >
                  <Scale className="h-4 w-4" /> Assign Counsel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
