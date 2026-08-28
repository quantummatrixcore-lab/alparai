"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  FileText,
  Lock,
  ChevronRight,
  RefreshCw,
  Scale,
  UserCheck,
  Flame,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/admin/admin-design-kit";

export interface IncidentItem {
  id: string;
  trackingCode: string;
  title: string;
  targetEntity: string;
  category:
    | "hallucination"
    | "data_leak"
    | "safety_bypass"
    | "bias_discrimination"
    | "deepfake"
    | "unauthorized_action";
  severity: "critical" | "high" | "medium" | "low";
  status:
    | "pending_triage"
    | "in_cross_audit"
    | "escalated_eu_act"
    | "verified_published"
    | "redacted_resolved";
  sourceType: "whistleblower" | "automated_telemetry" | "academic_lab" | "community_redteam";
  piiScrubbed: boolean;
  anonymityScore: number;
  submittedAt: string;
  reportedModel: string;
  evidenceCount: number;
  summary: string;
  impactScore: number;
}

const INITIAL_INCIDENTS: IncidentItem[] = [
  {
    id: "inc-9841",
    trackingCode: "ALP-2026-9841",
    title: "Unauthorized Exfiltration of Internal Training Datasets via Prompt Injection",
    targetEntity: "NexusCorp AI Gateway",
    category: "data_leak",
    severity: "critical",
    status: "pending_triage",
    sourceType: "whistleblower",
    piiScrubbed: true,
    anonymityScore: 100,
    submittedAt: "12 mins ago",
    reportedModel: "GPT-4o Enterprise",
    evidenceCount: 4,
    summary:
      "Whistleblower disclosure showing multi-tenant data leakage when specially crafted system instructions bypass enterprise tenant isolation boundaries.",
    impactScore: 94,
  },
  {
    id: "inc-9838",
    trackingCode: "ALP-2026-9838",
    title: "Autonomous Financial Trade Execution Beyond Risk Parameters",
    targetEntity: "Apex Trading Bot v3.2",
    category: "unauthorized_action",
    severity: "critical",
    status: "in_cross_audit",
    sourceType: "automated_telemetry",
    piiScrubbed: true,
    anonymityScore: 98,
    submittedAt: "45 mins ago",
    reportedModel: "Claude 3.5 Sonnet",
    evidenceCount: 7,
    summary:
      "Automated agent ignored max-drawdown stop loss triggers during market volatility, executing unauthorized high-frequency derivatives positions.",
    impactScore: 89,
  },
  {
    id: "inc-9832",
    trackingCode: "ALP-2026-9832",
    title: "Synthetic Identity Forgery & Automated KYC Bypass",
    targetEntity: "FinGuard Identity Core",
    category: "deepfake",
    severity: "high",
    status: "escalated_eu_act",
    sourceType: "academic_lab",
    piiScrubbed: true,
    anonymityScore: 95,
    submittedAt: "3 hours ago",
    reportedModel: "DeepSeek V3",
    evidenceCount: 3,
    summary:
      "Academic researchers proved real-time biometric injection attack successfully spoofing EU banking KYC liveness detection algorithms.",
    impactScore: 82,
  },
  {
    id: "inc-9827",
    trackingCode: "ALP-2026-9827",
    title: "Systemic Biased Scoring in Automated Hiring Screenings",
    targetEntity: "TalentScan AI Suite",
    category: "bias_discrimination",
    severity: "high",
    status: "pending_triage",
    sourceType: "whistleblower",
    piiScrubbed: true,
    anonymityScore: 100,
    submittedAt: "6 hours ago",
    reportedModel: "Gemini 1.5 Pro",
    evidenceCount: 5,
    summary:
      "HR candidate resume scoring consistently penalized applicants with non-Western naming patterns by an average of -38% across 14,000 evaluations.",
    impactScore: 78,
  },
  {
    id: "inc-9819",
    trackingCode: "ALP-2026-9819",
    title: "Harmful Chemical Synthesis Instructions Generated via Virtual Persona",
    targetEntity: "Public LLM Endpoint",
    category: "safety_bypass",
    severity: "critical",
    status: "in_cross_audit",
    sourceType: "community_redteam",
    piiScrubbed: true,
    anonymityScore: 92,
    submittedAt: "14 hours ago",
    reportedModel: "Llama-3.3-70B",
    evidenceCount: 2,
    summary:
      "Red-team researcher utilized multi-turn persona simulation jailbreak to extract dual-use chemical precursor synthesis protocols.",
    impactScore: 96,
  },
  {
    id: "inc-9811",
    trackingCode: "ALP-2026-9811",
    title: "Medical Diagnostic Hallucination Prescribing Incompatible Drug Combinations",
    targetEntity: "HealthPulse Doctor Assistant",
    category: "hallucination",
    severity: "medium",
    status: "verified_published",
    sourceType: "community_redteam",
    piiScrubbed: true,
    anonymityScore: 96,
    submittedAt: "1 day ago",
    reportedModel: "GPT-4o Mini",
    evidenceCount: 3,
    summary:
      "Clinical assistant hallucinated clinical trial citations, recommending fatal beta-blocker and calcium channel blocker co-administration.",
    impactScore: 68,
  },
];

export function IncidentTriageClient() {
  const [incidents, setIncidents] = useState<IncidentItem[]>(INITIAL_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [isActionSuccess, setIsActionSuccess] = useState<string | null>(null);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch =
        inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.targetEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.reportedModel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = selectedSeverity === "all" || inc.severity === selectedSeverity;
      const matchesStatus = selectedStatus === "all" || inc.status === selectedStatus;
      const matchesSource = selectedSource === "all" || inc.sourceType === selectedSource;
      return matchesSearch && matchesSeverity && matchesStatus && matchesSource;
    });
  }, [incidents, searchQuery, selectedSeverity, selectedStatus, selectedSource]);

  const handleUpdateStatus = (
    id: string,
    newStatus: IncidentItem["status"],
    actionMessage: string,
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc)),
    );
    if (selectedIncident?.id === id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setIsActionSuccess(actionMessage);
    setTimeout(() => setIsActionSuccess(null), 3500);
  };

  const getSeverityBadge = (sev: IncidentItem["severity"]) => {
    switch (sev) {
      case "critical":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "high":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "medium":
        return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
    }
  };

  const getStatusBadge = (status: IncidentItem["status"]) => {
    switch (status) {
      case "pending_triage":
        return {
          label: "Pending Triage",
          cls: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        };
      case "in_cross_audit":
        return { label: "In Cross-Audit", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" };
      case "escalated_eu_act":
        return {
          label: "Escalated (EU AI Act)",
          cls: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        };
      case "verified_published":
        return {
          label: "Verified & Published",
          cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
      case "redacted_resolved":
        return {
          label: "Redacted / Resolved",
          cls: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* ACTION BANNER */}
      {isActionSuccess && (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-sm font-semibold text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-xl duration-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{isActionSuccess}</span>
        </div>
      )}

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Pending Triages"
          value={incidents.filter((i) => i.status === "pending_triage").length}
          variant="danger"
          icon={<Flame className="h-5 w-5 text-rose-400" />}
          tooltip="Incidents requiring immediate human moderator & AI triaging"
        />
        <MetricCard
          label="In Multi-Model Audit"
          value={incidents.filter((i) => i.status === "in_cross_audit").length}
          variant="warning"
          icon={<RefreshCw className="h-5 w-5 text-amber-400" />}
          tooltip="Undergoing automated LLM consensus evaluation"
        />
        <MetricCard
          label="EU AI Act Escalations"
          value={incidents.filter((i) => i.status === "escalated_eu_act").length}
          variant="danger"
          icon={<Scale className="h-5 w-5 text-rose-400" />}
          tooltip="Article 73 Severe Incident reports flagged for regulatory notification"
        />
        <MetricCard
          label="PII Guardian Anonymity"
          value="100%"
          variant="success"
          icon={<Lock className="h-5 w-5 text-emerald-400" />}
          tooltip="Zero whistleblower identities or raw PII leaked"
        />
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by code, title, entity, or affected AI model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            aria-label="Filter incidents by severity"
            className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical (Tier-1)</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter incidents by status"
            className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending_triage">Pending Triage</option>
            <option value="in_cross_audit">In Cross-Audit</option>
            <option value="escalated_eu_act">Escalated (EU AI Act)</option>
            <option value="verified_published">Verified & Published</option>
            <option value="redacted_resolved">Redacted / Resolved</option>
          </select>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            aria-label="Filter incidents by source"
            className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="whistleblower">Whistleblower Drop</option>
            <option value="automated_telemetry">Automated Monitor</option>
            <option value="academic_lab">Academic Lab</option>
            <option value="community_redteam">Community Red-Team</option>
          </select>
        </div>
      </div>

      {/* INCIDENT TABLE & PREVIEW */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div
          className={cn(
            "space-y-3 transition-all duration-300",
            selectedIncident ? "lg:col-span-7" : "lg:col-span-12",
          )}
        >
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-2xl">
            <div className="divide-y divide-white/5">
              {filteredIncidents.map((incident) => {
                const isSelected = selectedIncident?.id === incident.id;
                const statusInfo = getStatusBadge(incident.status);

                return (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className={cn(
                      "group flex cursor-pointer flex-col gap-4 p-4.5 transition-all duration-200 hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between",
                      isSelected && "border-l-4 border-purple-500 bg-purple-500/5",
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-400">
                          {incident.trackingCode}
                        </span>
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase",
                            getSeverityBadge(incident.severity),
                          )}
                        >
                          {incident.severity}
                        </span>
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-bold",
                            statusInfo.cls,
                          )}
                        >
                          {statusInfo.label}
                        </span>
                        {incident.piiScrubbed && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <Lock className="h-2.5 w-2.5" /> PII Masked
                          </span>
                        )}
                      </div>

                      <h4 className="truncate text-sm font-bold text-white transition-colors group-hover:text-purple-300">
                        {incident.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        <span>
                          Target: <strong className="text-zinc-200">{incident.targetEntity}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Model: <strong className="text-zinc-200">{incident.reportedModel}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="h-3 w-3" /> {incident.submittedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                      <div className="text-right">
                        <div className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                          Risk Score
                        </div>
                        <div className="font-mono text-base font-black text-rose-400">
                          {incident.impactScore}/100
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-white" />
                    </div>
                  </div>
                );
              })}

              {filteredIncidents.length === 0 && (
                <div className="py-16 text-center text-zinc-500">
                  <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
                  <p className="text-sm font-semibold text-zinc-400">
                    No AI incidents found matching filter criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DETAIL DRAWER / INSPECTOR */}
        {selectedIncident && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-3xl duration-300 lg:col-span-5">
            <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-400">
                    {selectedIncident.trackingCode}
                  </span>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-black uppercase",
                      getSeverityBadge(selectedIncident.severity),
                    )}
                  >
                    {selectedIncident.severity}
                  </span>
                </div>
                <h3 className="mt-2 text-base leading-snug font-bold text-white">
                  {selectedIncident.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase">Target Entity</div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {selectedIncident.targetEntity}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase">
                  Reported AI Model
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {selectedIncident.reportedModel}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase">
                  Source Integrity
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-400">
                  <UserCheck className="h-3.5 w-3.5" /> {selectedIncident.sourceType} (
                  {selectedIncident.anonymityScore}% Anonymized)
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase">
                  Evidence Artifacts
                </div>
                <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-purple-400">
                  <FileText className="h-3.5 w-3.5" /> {selectedIncident.evidenceCount} Files
                  Verified
                </div>
              </div>
            </div>

            {/* SUMMARY & DISCLOSURE */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Incident Narrative
              </h5>
              <div className="rounded-xl border border-white/5 bg-black/40 p-4 text-xs leading-relaxed text-zinc-300">
                {selectedIncident.summary}
              </div>
            </div>

            {/* PII GUARDIAN STATUS */}
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
              <Lock className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="text-xs">
                <p className="font-bold text-emerald-300">PII Guardian Certified</p>
                <p className="mt-0.5 text-zinc-400">
                  All names, emails, IPs, and internal tokens were scrubbed prior to triage view.
                </p>
              </div>
            </div>

            {/* TRIAGE ACTIONS */}
            <div className="space-y-2.5 border-t border-white/5 pt-4">
              <h5 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
                Triage Decision Matrix
              </h5>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedIncident.id,
                      "verified_published",
                      `Incident ${selectedIncident.trackingCode} approved and published to public trust ledger.`,
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2.5 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all hover:bg-emerald-500/25"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Publish
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedIncident.id,
                      "in_cross_audit",
                      `Incident ${selectedIncident.trackingCode} dispatched to Multi-Model Cross-Audit debate.`,
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/15 px-3 py-2.5 text-xs font-bold text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all hover:bg-blue-500/25"
                >
                  <RefreshCw className="h-4 w-4" /> Run Cross-Audit
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedIncident.id,
                      "escalated_eu_act",
                      `Incident ${selectedIncident.trackingCode} escalated to EU AI Act Article 73 Serious Incident queue.`,
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-2.5 text-xs font-bold text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all hover:bg-rose-500/25"
                >
                  <Scale className="h-4 w-4" /> Escalate EU AI Act
                </button>

                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedIncident.id,
                      "redacted_resolved",
                      `Incident ${selectedIncident.trackingCode} marked as redacted/resolved.`,
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3 py-2.5 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-700"
                >
                  <XCircle className="h-4 w-4" /> Mark Resolved
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
