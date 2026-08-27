"use client";

import { CheckCircle2, AlertCircle, XCircle, Cpu } from "lucide-react";
import type { Provider } from "./api-hub";
import { useTranslations } from "next-intl";

export function ProviderMatrix({ providers }: { providers: Provider[] }) {
  const t = useTranslations("admin");
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="text-success-400 h-5 w-5" />;
      case "degraded":
        return <AlertCircle className="text-warning-400 h-5 w-5" />;
      default:
        return <XCircle className="text-danger-400 h-5 w-5" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-success-500/10 border-success-500/30";
      case "degraded":
        return "bg-warning-500/10 border-warning-500/30";
      default:
        return "bg-danger-500/10 border-danger-500/30";
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`rounded-xl border p-5 transition-all ${getStatusBg(provider.status)} hover:border-border-strong`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">{provider.name}</h3>
              <p className="text-fg-muted mt-1 text-xs">
                {provider.models.slice(0, 2).join(", ")}
                {provider.models.length > 2 ? `, +${provider.models.length - 2}` : ""}
              </p>
            </div>
            {getStatusIcon(provider.status)}
          </div>

          {/* Metrics Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-fg-muted">{t("health")}</p>
              <p className="mt-1 text-lg font-bold text-white">{provider.health}%</p>
            </div>
            <div>
              <p className="text-fg-muted">{t("latency_p95")}</p>
              <p className="mt-1 text-lg font-bold text-white">{provider.latencyMs}ms</p>
            </div>
          </div>

          {/* Daily Activity */}
          <div className="border-border-subtle mt-3 flex items-center justify-between border-t pt-3">
            <div className="text-xs">
              <p className="text-fg-muted">{t("daily_requests")}</p>
              <p className="font-mono text-sm font-bold text-white">
                {(provider.dailyRequests / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="text-fg-muted">{t("daily_cost")}</p>
              <p className="text-success-400 font-mono text-sm font-bold">
                ${provider.dailyCostUsd.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Respondent Badge */}
          {provider.respondentActive && (
            <div className="bg-brand-500/20 mt-2 flex items-center gap-1 rounded px-2 py-1">
              <Cpu className="text-brand-400 h-3 w-3" />
              <span className="text-brand-400 text-[10px] font-bold">
                {t("verified_respondent")}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
