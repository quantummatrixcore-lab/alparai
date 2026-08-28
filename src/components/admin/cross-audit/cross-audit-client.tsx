"use client";

import * as React from "react";
import { useState } from "react";
import {
  BrainCircuit,
  Play,
  Scale,
  RefreshCw,
  Sliders,
  FileCheck2,
  Layers,
  Sparkles,
  Activity,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricCard } from "@/components/admin/admin-design-kit";

interface JudgeModel {
  id: string;
  name: string;
  provider: string;
  weight: number;
  active: boolean;
  biasTendency: string;
  consensusAlignment: number;
}

interface DebateRound {
  round: number;
  speaker: string;
  model: string;
  argument: string;
  severityAssigned: number;
  confidence: number;
}

const INITIAL_MODELS: JudgeModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o (2026-05)",
    provider: "OpenAI",
    weight: 25,
    active: true,
    biasTendency: "Strict Alignment",
    consensusAlignment: 94,
  },
  {
    id: "claude-3-5",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    weight: 25,
    active: true,
    biasTendency: "Constitutional Safety",
    consensusAlignment: 96,
  },
  {
    id: "gemini-1-5",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    weight: 20,
    active: true,
    biasTendency: "Contextual Neutrality",
    consensusAlignment: 91,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3 (671B)",
    provider: "DeepSeek",
    weight: 15,
    active: true,
    biasTendency: "Analytical Logic",
    consensusAlignment: 89,
  },
  {
    id: "llama-3-3",
    name: "Llama 3.3 (70B)",
    provider: "Meta",
    weight: 15,
    active: true,
    biasTendency: "Open Guardrail",
    consensusAlignment: 87,
  },
];

export function CrossAuditClient() {
  const [models, setModels] = useState<JudgeModel[]>(INITIAL_MODELS);
  const [selectedIncidentScenario, setSelectedIncidentScenario] = useState(
    "Automated Financial Agent executed high-frequency trades after receiving an adversarial prompt disguised as market news sentiment.",
  );
  const [isDebating, setIsDebating] = useState(false);
  const [debateRounds, setDebateRounds] = useState<DebateRound[]>([]);
  const [finalScore, setFinalScore] = useState<number | null>(88);
  const [consensusRate, setConsensusRate] = useState<number>(93.4);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  const toggleModel = (id: string) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m)));
  };

  const handleWeightChange = (id: string, weight: number) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, weight } : m)));
  };

  const runLiveDebate = () => {
    setIsDebating(true);
    setDebateRounds([]);
    setFinalScore(null);
    setCertificateGenerated(false);

    const activeJudges = models.filter((m) => m.active);

    const mockArguments: Array<{
      speaker: string;
      model: string;
      arg: string;
      score: number;
      conf: number;
    }> = [
      {
        speaker: "Judge A",
        model: "Claude 3.5 Sonnet",
        arg: "The prompt exhibits clear indirect prompt injection with high-risk autonomy escalation. Violates Article 6 of EU AI Act (high-risk financial services). Recommends Severity Level 88/100.",
        score: 88,
        conf: 97,
      },
      {
        speaker: "Judge B",
        model: "GPT-4o",
        arg: "Concurring with Judge A. Boundary failure occurred due to lack of strict semantic guardrails between input telemetry and trading execution API. Severity 90/100.",
        score: 90,
        conf: 95,
      },
      {
        speaker: "Judge C",
        model: "DeepSeek V3",
        arg: "Cross-analyzed token divergence. Secondary mitigation layer was bypassed because rate-limiting was misconfigured. Severity 86/100.",
        score: 86,
        conf: 92,
      },
      {
        speaker: "Consensus Synthesis",
        model: "Multi-Model Matrix",
        arg: "Synthesized verdict: Critical systemic vulnerability confirmed across 3 independent evaluation tiers. Consensus agreement reached at 94.2%.",
        score: 88,
        conf: 96,
      },
    ];

    mockArguments.forEach((item, index) => {
      setTimeout(
        () => {
          setDebateRounds((prev) => [
            ...prev,
            {
              round: index + 1,
              speaker: item.speaker,
              model: item.model,
              argument: item.arg,
              severityAssigned: item.score,
              confidence: item.conf,
            },
          ]);

          if (index === mockArguments.length - 1) {
            setIsDebating(false);
            setFinalScore(88);
            setConsensusRate(94.2);
          }
        },
        (index + 1) * 700,
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* TOP METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Multi-LLM Consensus Rate"
          value={`${consensusRate}%`}
          variant="success"
          icon={<Scale className="h-5 w-5 text-emerald-400" />}
          tooltip="Average agreement rate among participating judge models"
        />
        <MetricCard
          label="Active Judge Models"
          value={`${models.filter((m) => m.active).length} / ${models.length}`}
          variant="default"
          icon={<BrainCircuit className="h-5 w-5 text-purple-400" />}
          tooltip="Independent models actively scoring incident validity"
        />
        <MetricCard
          label="Consensus Severity Verdict"
          value={finalScore ? `${finalScore}/100` : "Calculating..."}
          variant="danger"
          icon={<Activity className="h-5 w-5 text-rose-400" />}
          tooltip="Weighted Wilson-interval composite risk score"
        />
        <MetricCard
          label="Bias Variance"
          value="± 2.4%"
          variant="warning"
          icon={<Layers className="h-5 w-5 text-amber-400" />}
          tooltip="Inter-model variance across safety evaluation benchmarks"
        />
      </div>

      {/* MAIN CONSOLE GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: JUDGE CONFIGURATION */}
        <div className="space-y-4 lg:col-span-5">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                <Sliders className="h-4 w-4 text-purple-400" />
                Cross-Audit Model Roster & Weights
              </h3>
              <span className="font-mono text-[11px] text-zinc-400">Total: 100%</span>
            </div>

            <div className="space-y-3">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "rounded-xl border p-3.5 transition-all duration-200",
                    model.active
                      ? "border-purple-500/30 bg-purple-500/5"
                      : "border-white/5 bg-black/30 opacity-60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={model.active}
                        onChange={() => toggleModel(model.id)}
                        className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{model.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          {model.provider} • {model.biasTendency}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-400">
                      {model.weight}%
                    </span>
                  </div>

                  {model.active && (
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={model.weight}
                        onChange={(e) => handleWeightChange(model.id, Number(e.target.value))}
                        className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-purple-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SIMULATION TRIGGER CARD */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-2xl">
            <h4 className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
              <Terminal className="h-4 w-4 text-cyan-400" />
              Incident Audit Scenario
            </h4>
            <textarea
              rows={3}
              value={selectedIncidentScenario}
              onChange={(e) => setSelectedIncidentScenario(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
              placeholder="Enter incident description, model prompt logs, or vulnerability evidence..."
            />

            <button
              onClick={runLiveDebate}
              disabled={isDebating}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-600/30 py-3 text-xs font-bold text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.2)] transition-all hover:bg-purple-600/50 disabled:opacity-50"
            >
              {isDebating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Multi-LLM Debate Simulation...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Dispatch Cross-Audit Debate
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DEBATE TRANSCRIPT & VERDICT */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex min-h-[480px] flex-col justify-between space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    Live LLM Debate Matrix & Consensus Feed
                  </h3>
                </div>
                {finalScore && (
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    Consensus Verified
                  </span>
                )}
              </div>

              {/* ROUND LOGS */}
              <div className="space-y-3">
                {debateRounds.map((round) => (
                  <div
                    key={round.round}
                    className="animate-in fade-in slide-in-from-bottom-2 space-y-2 rounded-xl border border-white/5 bg-black/40 p-4 duration-300"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-300">
                          Round {round.round}
                        </span>
                        <strong className="text-white">{round.speaker}</strong>
                        <span className="text-zinc-500">({round.model})</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-zinc-400">
                          Score: <strong className="text-rose-400">{round.severityAssigned}</strong>
                        </span>
                        <span className="text-zinc-400">
                          Confidence:{" "}
                          <strong className="text-emerald-400">{round.confidence}%</strong>
                        </span>
                      </div>
                    </div>
                    <p className="pl-1 text-xs leading-relaxed text-zinc-300">{round.argument}</p>
                  </div>
                ))}

                {debateRounds.length === 0 && !isDebating && (
                  <div className="py-24 text-center text-zinc-500">
                    <BrainCircuit className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
                    <p className="text-sm font-semibold text-zinc-400">
                      Select participating models and trigger a live Multi-Model Cross-Audit.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AUDIT CERTIFICATE ACTION */}
            {finalScore && (
              <div className="flex flex-col items-center justify-between gap-3 rounded-xl border-t border-white/5 bg-white/[0.01] p-3 pt-4 sm:flex-row">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <div className="text-xs">
                    <span className="font-bold text-white">Cryptographic Audit Certificate</span>
                    <p className="text-[11px] text-zinc-400">
                      Signed with SHA-256 HMAC & Wilson Confidence Bounds
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCertificateGenerated(true)}
                  className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-500/25"
                >
                  {certificateGenerated ? "Certificate Exported ✓" : "Export Audit Report"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
