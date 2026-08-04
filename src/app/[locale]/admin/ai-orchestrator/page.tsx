import { requireAdmin } from "@/lib/auth/session";
import { getTrustScoresAction, type TrustScoreRecord } from "@/actions/admin/ai-orchestrator";
import { Cpu, ShieldCheck, Zap, Layers } from "lucide-react";

import { createServerClient } from "@/lib/supabase/server";
import { OrchestratorTriggerButton } from "./trigger-button";
import { getTranslations } from "next-intl/server";

export default async function AiOrchestratorAdminPage() {
  const t = await getTranslations("admin");
  const supabase = await createServerClient();
  const trustScores = await getTrustScoresAction();

  const { data: chains } = await supabase.from("ai_routing_chains").select("*");
  const { data: costs } = await supabase
    .from("finance_monthly_costs")
    .select("budget_usd, amount_usd");
  const costSavings = (costs || []).reduce((acc, c) => acc + (c.budget_usd - c.amount_usd), 0);
  const costSavingsStr = costSavings > 0 ? `$${costSavings.toFixed(2)}` : "$0.00";

  const { data: dbModels } = await supabase
    .from("ai_models")
    .select(
      `
      id,
      name,
      status,
      provider:ai_providers!ai_models_provider_id_fkey(name)
    `,
    )
    .eq("status", "active")
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const freeModels = ((dbModels as any[]) || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    provider: m.provider?.name || "Unknown Provider",
    context_length: 128000, // mock length since DB doesn't have it
  }));

  const avgTrustScore =
    trustScores.length > 0
      ? (
          trustScores.reduce((acc, s) => acc + Number(s.trust_score), 0) / trustScores.length
        ).toFixed(1)
      : "0.0";

  const totalAudits = trustScores.reduce((acc, s) => acc + (Number(s.total_audits) || 0), 0);

  await requireAdmin();
  return (
    <div className="space-y-8 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
            <Cpu className="h-8 w-8 text-emerald-400" />
            {t("ai_orchestrator_cross_audit_arena")}
          </h1>
          <p className="mt-2 text-slate-400">{t("stealth_multi_agent_cross_audit_trust_ba")}</p>
        </div>
      </div>
      <div>
        <OrchestratorTriggerButton />
      </div>

      {/* Free Tier Inventory Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{t("free_tier_inventory")}</span>
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-400">{freeModels.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t("live_active_0_00_pricing_models")}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{t("average_trust_score")}</span>
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{avgTrustScore}%</p>
          <p className="mt-1 text-xs text-slate-500">
            {t("evaluated_across")}
            {totalAudits} {t("cross_audits")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{t("active_capability_chains")}</span>
            <Layers className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-cyan-400">{chains?.length || 0}</p>
          <p className="mt-1 text-xs text-slate-500">{t("dynamic_db_routing_chains")}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{t("api_cost_savings")}</span>
            <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-400 uppercase">
              100%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{costSavingsStr}</p>
          <p className="mt-1 text-xs text-slate-500">{t("zero_token_cost_on_internal_audits")}</p>
        </div>
      </div>

      {/* Free Models Arsenal Table */}
      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-semibold text-white">{t("live_ai_models")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
              <tr>
                <th className="p-3">{t("model_name")}</th>
                <th className="p-3">{t("provider")}</th>
                <th className="p-3">{t("context_window")}</th>
                <th className="p-3">{t("prompt_cost")}</th>
                <th className="p-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {freeModels.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-emerald-400">{m.name}</td>
                  <td className="p-3">{m.provider}</td>
                  <td className="p-3 font-mono">
                    {m.context_length.toLocaleString()} {t("tokens")}
                  </td>
                  <td className="p-3 font-mono text-emerald-400">{t("0_00_1m")}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center rounded border border-emerald-800 bg-emerald-950 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      {t("active")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Chains Table */}
      {chains && chains.length > 0 && (
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">{t("active_routing_chains")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {chains.map((chain: any) => (
              <div
                key={chain.domain_name}
                className="rounded border border-slate-700 bg-slate-800/50 p-4"
              >
                <h3 className="font-semibold text-emerald-400">{chain.domain_name}</h3>
                <ul className="mt-2 space-y-1">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(chain.models || []).map((m: any, idx: number) => (
                    <li key={idx} className="text-sm text-slate-300">
                      {idx + 1}. {m.id || m}{" "}
                      {m.provider && <span className="text-xs text-slate-500">({m.provider})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Ledger Table */}
      {trustScores.length > 0 && (
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">{t("model_trust_scores_ledger")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
                <tr>
                  <th className="p-3">{t("model_id")}</th>
                  <th className="p-3">{t("provider")}</th>
                  <th className="p-3">{t("trust_score")}</th>
                  <th className="p-3">{t("hallucination_rate")}</th>
                  <th className="p-3">{t("ethical_compliance")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {trustScores.map((s: TrustScoreRecord) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-cyan-400">{s.model_id}</td>
                    <td className="p-3">{s.provider}</td>
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
    </div>
  );
}
