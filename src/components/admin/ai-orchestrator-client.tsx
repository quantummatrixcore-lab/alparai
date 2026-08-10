"use client";

import { useState } from "react";
import { ShieldCheck, Zap, Layers, Code2, BarChart3 } from "lucide-react";
import { AdminSubNav, type SubNavItem } from "@/components/admin/admin-design-kit";
import { BlackboxCodeAnalysisSection } from "@/app/[locale]/admin/ai-orchestrator/code-analysis-section";
import type { TrustScoreRecord } from "@/actions/admin/ai-orchestrator";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import type { AdminAutopilotSnapshot } from "@/actions/admin-autopilot";
import { useTranslations } from "next-intl";

interface FreeModel {
  id: string;
  name: string;
  provider: string;
  context_length: number;
}

interface RoutingChain {
  domain_name: string;
  models?: Array<{ id?: string; provider?: string } | string>;
}

interface AiOrchestratorClientProps {
  freeModels: FreeModel[];
  trustScores: TrustScoreRecord[];
  chains: RoutingChain[] | null;
  costSavingsStr: string;
  avgTrustScore: string;
  totalAudits: number;
  autopilotSnapshot?: AdminAutopilotSnapshot | null;
  locale?: string;
}

export function AiOrchestratorClient({
  freeModels,
  trustScores,
  chains,
  costSavingsStr,
  avgTrustScore,
  totalAudits,
  autopilotSnapshot,
  locale = "tr",
}: AiOrchestratorClientProps) {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<string>("all");

  const subNavItems: SubNavItem[] = [
    { id: "all", label: "Overview", icon: Layers },
    {
      id: "autopilot",
      label: t("autopilot_analytics") || t("nav_autopilot_analytics") || "Otopilot Analizleri",
      icon: BarChart3,
    },
    {
      id: "inventory",
      label: t("free_tier_inventory") || "Free AI Arsenal",
      icon: Zap,
      badge: freeModels.length,
    },
    {
      id: "chains",
      label: t("active_capability_chains") || "Routing Chains",
      icon: Layers,
      badge: chains?.length || 0,
    },
    {
      id: "ledger",
      label: t("model_trust_scores_ledger") || "Trust Ledger",
      icon: ShieldCheck,
      badge: trustScores.length,
    },
    { id: "blackbox", label: "Blackbox AI Analysis", icon: Code2 },
  ];

  const showAutopilot = (activeTab === "all" || activeTab === "autopilot") && autopilotSnapshot;
  const showInventory = activeTab === "all" || activeTab === "inventory";
  const showChains = activeTab === "all" || activeTab === "chains";
  const showLedger = activeTab === "all" || activeTab === "ledger";
  const showBlackbox = activeTab === "all" || activeTab === "blackbox";

  return (
    <div className="space-y-6">
      <AdminSubNav items={subNavItems} activeId={activeTab} onChange={setActiveTab} />

      {/* Autopilot Analytics Dashboard */}
      {showAutopilot && <AnalyticsDashboard snapshot={autopilotSnapshot} locale={locale} />}

      {/* Free Tier Inventory Stats */}
      {showInventory && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-5 shadow-sm">
            <div className="text-fg-muted flex items-center justify-between text-xs font-semibold">
              <span>{t("free_tier_inventory")}</span>
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-amber-400">{freeModels.length}</p>
            <p className="text-fg-muted mt-1 text-xs">{t("live_active_0_00_pricing_models")}</p>
          </div>

          <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-5 shadow-sm">
            <div className="text-fg-muted flex items-center justify-between text-xs font-semibold">
              <span>{t("average_trust_score")}</span>
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-emerald-400">{avgTrustScore}%</p>
            <p className="text-fg-muted mt-1 text-xs">
              {t("evaluated_across")} {totalAudits} {t("cross_audits")}
            </p>
          </div>

          <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-5 shadow-sm">
            <div className="text-fg-muted flex items-center justify-between text-xs font-semibold">
              <span>{t("active_capability_chains")}</span>
              <Layers className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-cyan-400">{chains?.length || 0}</p>
            <p className="text-fg-muted mt-1 text-xs">{t("dynamic_db_routing_chains")}</p>
          </div>

          <div className="border-border-subtle bg-bg-secondary rounded-2xl border p-5 shadow-sm">
            <div className="text-fg-muted flex items-center justify-between text-xs font-semibold">
              <span>{t("api_cost_savings")}</span>
              <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 uppercase">
                100%
              </span>
            </div>
            <p className="text-fg-primary mt-2 text-3xl font-black">{costSavingsStr}</p>
            <p className="text-fg-muted mt-1 text-xs">{t("zero_token_cost_on_internal_audits")}</p>
          </div>
        </div>
      )}

      {/* Free Models Arsenal Table */}
      {showInventory && (
        <div className="border-border-subtle bg-bg-secondary space-y-4 rounded-2xl border p-6 shadow-sm">
          <h2 className="text-fg-primary text-xl font-bold">{t("live_ai_models")}</h2>
          <div className="overflow-x-auto">
            <table className="text-fg-primary w-full text-left text-sm">
              <thead className="border-border-subtle bg-bg-tertiary text-fg-muted border-b text-xs font-bold uppercase">
                <tr>
                  <th className="p-3">{t("model_name")}</th>
                  <th className="p-3">{t("provider")}</th>
                  <th className="p-3">{t("context_window")}</th>
                  <th className="p-3">{t("prompt_cost")}</th>
                  <th className="p-3">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-border-subtle divide-y">
                {freeModels.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-tertiary/60 transition-colors">
                    <td className="p-3 font-mono font-semibold text-emerald-400">{m.name}</td>
                    <td className="text-fg-primary p-3">{m.provider}</td>
                    <td className="text-fg-muted p-3 font-mono">
                      {m.context_length.toLocaleString()} {t("tokens")}
                    </td>
                    <td className="p-3 font-mono text-emerald-400">{t("0_00_1m")}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                        {t("active")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Chains Table */}
      {showChains && chains && chains.length > 0 && (
        <div className="border-border-subtle bg-bg-secondary space-y-4 rounded-2xl border p-6 shadow-sm">
          <h2 className="text-fg-primary text-xl font-bold">{t("active_routing_chains")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {chains.map((chain) => (
              <div
                key={chain.domain_name}
                className="border-border-subtle bg-bg-tertiary rounded-xl border p-4"
              >
                <h3 className="font-bold text-emerald-400">{chain.domain_name}</h3>
                <ul className="mt-2 space-y-1">
                  {(chain.models || []).map((m, idx) => {
                    const modelName = typeof m === "string" ? m : m.id || "Unknown";
                    const providerName = typeof m === "object" && m?.provider ? m.provider : null;
                    return (
                      <li key={idx} className="text-fg-primary text-sm font-medium">
                        {idx + 1}. {modelName}{" "}
                        {providerName && (
                          <span className="text-fg-muted text-xs">({providerName})</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Ledger Table */}
      {showLedger && trustScores.length > 0 && (
        <div className="border-border-subtle bg-bg-secondary space-y-4 rounded-2xl border p-6 shadow-sm">
          <h2 className="text-fg-primary text-xl font-bold">{t("model_trust_scores_ledger")}</h2>
          <div className="overflow-x-auto">
            <table className="text-fg-primary w-full text-left text-sm">
              <thead className="border-border-subtle bg-bg-tertiary text-fg-muted border-b text-xs font-bold uppercase">
                <tr>
                  <th className="p-3">{t("model_id")}</th>
                  <th className="p-3">{t("provider")}</th>
                  <th className="p-3">{t("trust_score")}</th>
                  <th className="p-3">{t("hallucination_rate")}</th>
                  <th className="p-3">{t("ethical_compliance")}</th>
                </tr>
              </thead>
              <tbody className="divide-border-subtle divide-y">
                {trustScores.map((s) => (
                  <tr key={s.id} className="hover:bg-bg-tertiary/60 transition-colors">
                    <td className="p-3 font-mono font-medium text-cyan-400">{s.model_id}</td>
                    <td className="text-fg-primary p-3 font-medium">{s.provider}</td>
                    <td className="p-3 font-bold text-emerald-400">{s.trust_score}%</td>
                    <td className="p-3 font-mono text-rose-400">
                      {(s.hallucination_rate * 100).toFixed(1)}%
                    </td>
                    <td className="p-3 font-mono text-emerald-400">{s.ethical_compliance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blackbox AI Code Quality Analysis Section */}
      {showBlackbox && <BlackboxCodeAnalysisSection />}
    </div>
  );
}
