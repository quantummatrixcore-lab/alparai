"use client";

import { useTranslations } from "next-intl";
import { Clock } from "@phosphor-icons/react";

interface UsageItem {
  id: string;
  service: string;
  metric_name: string;
  value: number;
  unit: string;
  recorded_at: string;
}

interface ApiUsageTableProps {
  data: UsageItem[];
}

export function ApiUsageTable({ data }: ApiUsageTableProps) {
  const t = useTranslations("finance");

  // Format metric names for readable strings
  const formatMetricName = (name: string) => {
    switch (name) {
      case "tokens_in":
        return "API Input Tokens";
      case "tokens_out":
        return "API Output Tokens";
      case "requests":
        return "API Total Requests";
      case "bandwidth_gb":
        return "Data Outward Bandwidth";
      default:
        return name;
    }
  };

  const getServiceColor = (service: string) => {
    switch (service.toLowerCase()) {
      case "gemini":
        return "text-brand-500 bg-brand-50 dark:bg-brand-950/30";
      case "anthropic":
        return "text-warning-500 bg-warning-50 dark:bg-warning-950/30";
      case "supabase":
        return "text-success-500 bg-success-50 dark:bg-success-950/30";
      case "vercel":
        return "text-fg-disabled bg-bg-subtle dark:bg-bg-elevated/50";
      default:
        return "text-fg-muted bg-bg-subtle dark:bg-bg-elevated/50";
    }
  };

  return (
    <div className="dark:border-border-subtle dark:bg-bg-tertiary overflow-hidden rounded-xl border border-border-subtle bg-bg-primary shadow-sm">
      <div className="border-b border-border-subtle p-6 dark:border-border-subtle">
        <h4 className="font-semibold text-fg-primary dark:text-fg-primary">
          {t("apiUsageMetricsTitle")}
        </h4>
        <p className="text-fg-disabled dark:text-fg-muted mt-1 text-xs">
          {t("apiUsageMetricsSubtitle")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="text-fg-disabled dark:bg-bg-tertiary dark:text-fg-muted border-b border-border-subtle bg-bg-subtle text-xs font-semibold dark:border-border-subtle">
              <th className="p-4">{t("tableService")}</th>
              <th className="p-4">{t("tableMetric")}</th>
              <th className="p-4 text-right">{t("tableUsageAmount")}</th>
              <th className="p-4 text-right">{t("tableTimestamp")}</th>
            </tr>
          </thead>
          <tbody className="dark:text-fg-secondary divide-y divide-border-subtle text-fg-secondary dark:divide-border-subtle">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-fg-muted dark:text-fg-disabled p-8 text-center">
                  {t("noUsageRecords")}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="dark:hover:bg-bg-elevated/20 hover:bg-bg-subtle/50">
                  <td className="dark:text-fg-primary p-4 font-medium text-fg-primary">
                    <span
                      className={`inline-block rounded px-2.5 py-0.5 text-xs font-bold capitalize ${getServiceColor(item.service)}`}
                    >
                      {item.service}
                    </span>
                  </td>
                  <td className="p-4">{formatMetricName(item.metric_name)}</td>
                  <td className="p-4 text-right font-semibold">
                    {item.value.toLocaleString()}{" "}
                    <span className="text-fg-muted text-xs font-normal">{item.unit}</span>
                  </td>
                  <td className="text-fg-disabled dark:text-fg-muted p-4 text-right text-xs">
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(item.recorded_at).toLocaleString("tr-TR")}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
