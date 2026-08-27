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
          <div
            key={provider.id}
            className="bg-bg-elevated/80 border-border-subtle rounded-xl border p-6"
          >
            <h3 className="text-sm font-bold text-white">{provider.name}</h3>
            <p className="text-fg-muted mt-1 text-xs">
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
              <p className="text-fg-muted mt-3 text-xs">
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
