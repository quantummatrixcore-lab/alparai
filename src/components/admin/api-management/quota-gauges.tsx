"use client";

import { Gauge } from "@/components/admin/premium/gauge";
import type { Provider } from "./api-hub";
import { useTranslations } from "next-intl";

export function QuotaGauges({ providers }: { providers: Provider[] }) {
  const t = useTranslations("admin");
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => {
        const quotaPercent = Math.round((provider.quotaUsed / provider.quotaLimit) * 100);
        const quotaStatus =
          quotaPercent > 80 ? "danger" : quotaPercent > 50 ? "warning" : "success";

        return (
          <div key={provider.id} className="rounded-xl border border-white/10 bg-zinc-900/80 p-6">
            <h3 className="text-sm font-bold text-white">{provider.name}</h3>
            <p className="mt-1 text-xs text-zinc-400">
              {(provider.quotaUsed / 1000).toFixed(0)}
              {t("k")}
              {(provider.quotaLimit / 1000).toFixed(0)}K
            </p>

            <div className="mt-4">
              <Gauge
                value={quotaPercent}
                label={`${quotaPercent}%`}
                variant={
                  quotaStatus === "success"
                    ? "success"
                    : quotaStatus === "warning"
                      ? "warning"
                      : "danger"
                }
              />
            </div>

            {provider.monthlyLimitUsd > 0 && (
              <p className="mt-3 text-xs text-zinc-400">
                {t("monthly_budget")}{" "}
                <span className="font-bold text-white">${provider.monthlyLimitUsd}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
