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
    <div className="border-danger-200 flex flex-col gap-3 rounded-xl border bg-rose-50/50 p-5 dark:border-rose-950/30 dark:bg-rose-950/10">
      <div className="text-danger-800 dark:text-danger-400 flex items-center gap-2 text-sm font-semibold">
        <ShieldWarning className="h-5 w-5" />
        <span>{t("finance_budget_alerts")}</span>
      </div>
      <ul className="text-danger-700 dark:text-danger-400 flex list-disc flex-col gap-1.5 pl-5 text-xs">
        {alerts.map((alert, index) => (
          <li key={index}>{alert}</li>
        ))}
      </ul>
    </div>
  );
}
