"use client";

import { ShieldWarning } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

interface AlertBannerProps {
  alerts: string[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const t = useTranslations("admin");

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-950/30 dark:bg-rose-950/10">
      <div className="flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-400">
        <ShieldWarning className="h-5 w-5" />
        <span>{t("finance_budget_alerts")}</span>
      </div>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-xs text-rose-700 dark:text-rose-400">
        {alerts.map((alert, index) => (
          <li key={index}>{alert}</li>
        ))}
      </ul>
    </div>
  );
}
