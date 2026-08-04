"use client";

import { CheckCircle2, AlertCircle, XCircle, Cpu } from "lucide-react";
import type { Provider } from "./api-hub";
import { useTranslations } from "next-intl";

export function ProviderMatrix({ providers }: { providers: Provider[] }) {
  const t = useTranslations("admin");
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-amber-400" />;
      default:
        return <XCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-emerald-500/10 border-emerald-500/30";
      case "degraded":
        return "bg-amber-500/10 border-amber-500/30";
      default:
        return "bg-red-500/10 border-red-500/30";
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`rounded-xl border p-5 transition-all ${getStatusBg(provider.status)} hover:border-white/20`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">{provider.name}</h3>
              <p className="mt-1 text-xs text-zinc-400">
                {provider.models.slice(0, 2).join(", ")}
                {provider.models.length > 2 ? `, +${provider.models.length - 2}` : ""}
              </p>
            </div>
            {getStatusIcon(provider.status)}
          </div>

          {/* Metrics Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-zinc-400">{t("health")}</p>
              <p className="mt-1 text-lg font-bold text-white">{provider.health}%</p>
            </div>
            <div>
              <p className="text-zinc-400">{t("latency_p95")}</p>
              <p className="mt-1 text-lg font-bold text-white">{provider.latencyMs}ms</p>
            </div>
          </div>

          {/* Daily Activity */}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="text-xs">
              <p className="text-zinc-400">{t("daily_requests")}</p>
              <p className="font-mono text-sm font-bold text-white">
                {(provider.dailyRequests / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="text-zinc-400">{t("daily_cost")}</p>
              <p className="font-mono text-sm font-bold text-emerald-400">
                ${provider.dailyCostUsd.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Respondent Badge */}
          {provider.respondentActive && (
            <div className="mt-2 flex items-center gap-1 rounded bg-blue-500/20 px-2 py-1">
              <Cpu className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400">
                {t("verified_respondent")}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
