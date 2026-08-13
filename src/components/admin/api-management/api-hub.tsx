"use client";

import { useState, useEffect } from "react";
import { ProviderMatrix } from "./provider-matrix";
import { ModelHealthChart } from "./model-health-chart";
import { ApiKeyManager } from "./api-key-manager";
import { QuotaGauges } from "./quota-gauges";
import { UsageHeatmap } from "./usage-heatmap";
import { StaticKeysList } from "./static-keys-list";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { getApiTelemetryData, type RealProvider } from "@/actions/api-management";
import { useTranslations } from "next-intl";

export type Provider = RealProvider;

export function ApiManagementHub() {
  const t = useTranslations("admin");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [dailySpend, setDailySpend] = useState<number>(0.8);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"telemetry" | "ai-providers" | "system-keys">(
    "telemetry",
  );
  const [isRealTelemetry, setIsRealTelemetry] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const loadTelemetry = async () => {
    setLoading(true);
    try {
      const data = await getApiTelemetryData();
      setProviders(data.providers);
      setDailySpend(data.totalDailySpendUsd);
      setIsRealTelemetry(true);
      setLastRefreshed(new Date(data.timestamp).toLocaleTimeString());
    } catch (err) {
      console.warn("[ApiManagementHub] Telemetry fetch error, fallback to initial state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  const totalDailyCost =
    dailySpend > 0 ? dailySpend : providers.reduce((a, p) => a + p.dailyCostUsd, 0);

  return (
    <div className="space-y-8">
      {/* Telemetry Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-200">
              {t("live_environment_audit_baseline_benchmar")}
            </p>
            <p className="text-xs text-emerald-400/80">
              <strong className="text-emerald-300">{t("live")}</strong>{" "}
              {t("provider_credentials_presence_masked_key")}{" "}
              <strong className="text-zinc-300">{t("benchmark")}</strong>{" "}
              {t("latency_p95_request_volume_and_quota_lim")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 font-mono font-medium text-emerald-300">
            {isRealTelemetry ? t("env_audit_live") : "INITIALIZING"}
          </span>
          {lastRefreshed && (
            <span className="font-mono text-zinc-400">
              {t("updated")}
              {lastRefreshed}
            </span>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-900/50 px-4 py-3">
        <div>
          <p className="text-xs text-zinc-400">{t("total_daily_api_spend_ai_gateway_rpc")}</p>
          <p className="text-2xl font-bold text-white">${totalDailyCost.toFixed(2)}</p>
        </div>
        <button
          onClick={loadTelemetry}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : t("refresh_telemetry")}
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "telemetry"
              ? "border-brand-400 border-b-2 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {t("telemetry_health")}
        </button>
        <button
          onClick={() => setActiveTab("ai-providers")}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "ai-providers"
              ? "border-brand-400 border-b-2 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {t("ai_providers")}
        </button>
        <button
          onClick={() => setActiveTab("system-keys")}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "system-keys"
              ? "border-brand-400 border-b-2 text-white"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {t("system_keys")}
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "telemetry" && (
          <div className="animate-in fade-in space-y-8 duration-500">
            {/* Provider Matrix */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {t("provider_status_matrix")}
                </h2>
                <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                  {t("live_env_key_audit")}
                </span>
              </div>
              <ProviderMatrix providers={providers} />
            </section>

            {/* Model Health Chart */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {t("model_latency_trends_p95")}
                </h2>
                <span className="rounded border border-white/5 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                  {t("baseline_benchmark")}
                </span>
              </div>
              <ModelHealthChart data={[]} />
            </section>

            {/* Quota Gauges */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {t("quota_usage_by_provider")}
                </h2>
                <span className="rounded border border-white/5 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                  {t("estimated_limits")}
                </span>
              </div>
              <QuotaGauges providers={providers} />
            </section>

            {/* Usage Heatmap */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {t("daily_request_volume_24h_heatmap")}
                </h2>
                <span className="rounded border border-white/5 bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                  {t("estimated_volume")}
                </span>
              </div>
              <UsageHeatmap providers={providers} />
            </section>
          </div>
        )}

        {activeTab === "ai-providers" && (
          <div className="animate-in fade-in space-y-8 duration-500">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {t("ai_model_providers")}
                </h2>
                <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                  {t("live_database_keys")}
                </span>
              </div>
              <ApiKeyManager providers={providers} />
            </section>
          </div>
        )}

        {activeTab === "system-keys" && (
          <div className="animate-in fade-in space-y-8 duration-500">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {t("infrastructure_keys")}
                </h2>
                <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 font-mono text-[10px] text-purple-300">
                  {t("read_only_env_variables")}
                </span>
              </div>
              <StaticKeysList />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
