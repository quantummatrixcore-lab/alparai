"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

export interface QuotaWidgetProps {
  name: string;
  used: number;
  total: number;
  unit: string;
  warningAt?: number;
  criticalAt?: number;
}

export function QuotaWidget({
  name,
  used,
  total,
  unit,
  warningAt = 0.8,
  criticalAt = 0.95,
}: QuotaWidgetProps) {
  const t = useTranslations("admin");
  const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const ratio = total > 0 ? used / total : 0;

  let colorClass = "bg-emerald-500";
  let textClass = "text-emerald-400";
  let statusVariant: "success" | "warning" | "muted" = "success";
  let statusText = t("quota_normal");

  if (ratio >= criticalAt) {
    colorClass = "bg-rose-500";
    textClass = "text-rose-400";
    statusVariant = "muted";
    statusText = t("quota_critical");
  } else if (ratio >= warningAt) {
    colorClass = "bg-amber-500";
    textClass = "text-amber-400";
    statusVariant = "warning";
    statusText = t("quota_warning");
  }

  return (
    <div className="border-border-subtle bg-bg-secondary/40 flex flex-col justify-between rounded-xl border p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="text-fg-primary text-sm font-bold">{name}</span>
        <Badge variant={statusVariant} size="sm">
          {statusText}
        </Badge>
      </div>

      <div className="my-3 space-y-1.5">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-fg-muted">{t("quota_usage")}</span>
          <span className={`font-mono font-bold ${textClass}`}>
            {used.toLocaleString()} / {total.toLocaleString()} {unit} ({percentage}%)
          </span>
        </div>
        <div className="bg-bg-tertiary h-2 w-full overflow-hidden rounded-full">
          <div
            className={`h-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
