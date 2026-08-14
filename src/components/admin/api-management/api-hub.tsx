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
      <div className="border-success-500/20 bg-success-500/10 text-success-300 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 text-sm">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="text-success-400 h-5 w-5 shrink-0" />
          <div>
            <p className="text-success-200 font-semibold">
              {t("live_environment_audit_baseline_benchmar")}
            </p>
            <p className="text-success-400/80 text-xs">
              <strong className="text-success-300">{t("live")}</strong>{" "}
              {t("provider_credentials_presence_masked_key")}{" "}
              <strong className="text-fg-secondary">{t("benchmark")}</strong>{" "}
              {t("latency_p95_request_volume_and_quota_lim")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-success-500/20 text-success-300 rounded-full px-2.5 py-1 font-mono font-medium">
            {isRealTelemetry ? t("env_audit_live") : "INITIALIZING"}
          </span>
          {lastRefreshed && (
            <span className="text-fg-muted font-mono">
              {t("updated")}
              {lastRefreshed}
            </span>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="bg-bg-elevated/50 flex items-center justify-between rounded-lg border border-white/10 px-4 py-3">
        <div>
          <p className="text-fg-muted text-xs">{t("total_daily_api_spend_ai_gateway_rpc")}</p>
          <p className="text-2xl font-bold text-white">${totalDailyCost.toFixed(2)}</p>
        </div>
        <button
          onClick={loadTelemetry}
          disabled={loading}
          className="text-fg-secondary flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/10 disabled:opacity-50"
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
              : "text-fg-muted hover:text-white"
          }`}
        >
          {t("telemetry_health")}
        </button>
        <button
          onClick={() => setActiveTab("ai-providers")}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "ai-providers"
              ? "border-brand-400 border-b-2 text-white"
              : "text-fg-muted hover:text-white"
          }`}
        >
          {t("ai_providers")}
        </button>
        <button
          onClick={() => setActiveTab("system-keys")}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "system-keys"
              ? "border-brand-400 border-b-2 text-white"
              : "text-fg-muted hover:text-white"
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
                <span className="border-success-500/30 bg-success-500/20 text-success-300 rounded border px-2 py-0.5 font-mono text-[10px]">
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
                <span className="text-fg-muted rounded border border-white/5 bg-zinc-800 px-2 py-0.5 font-mono text-[10px]">
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
                <span className="text-fg-muted rounded border border-white/5 bg-zinc-800 px-2 py-0.5 font-mono text-[10px]">
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
                <span className="text-fg-muted rounded border border-white/5 bg-zinc-800 px-2 py-0.5 font-mono text-[10px]">
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
                <span className="border-success-500/30 bg-success-500/20 text-success-300 rounded border px-2 py-0.5 font-mono text-[10px]">
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
                <span className="border-brand-500/30 bg-brand-500/20 text-brand-300 rounded border px-2 py-0.5 font-mono text-[10px]">
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
