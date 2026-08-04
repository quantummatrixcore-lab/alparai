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
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/30";
      case "anthropic":
        return "text-orange-500 bg-orange-50 dark:bg-orange-950/30";
      case "supabase":
        return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
      case "vercel":
        return "text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50";
      default:
        return "text-zinc-600 bg-zinc-50 dark:bg-zinc-900/50";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 p-6 dark:border-zinc-900">
        <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">
          {t("apiUsageMetricsTitle")}
        </h4>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {t("apiUsageMetricsSubtitle")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-semibold text-zinc-500 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
              <th className="p-4">{t("tableService")}</th>
              <th className="p-4">{t("tableMetric")}</th>
              <th className="p-4 text-right">{t("tableUsageAmount")}</th>
              <th className="p-4 text-right">{t("tableTimestamp")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700 dark:divide-zinc-900 dark:text-zinc-300">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-400 dark:text-zinc-500">
                  {t("noUsageRecords")}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20">
                  <td className="p-4 font-medium text-zinc-900 dark:text-zinc-100">
                    <span
                      className={`inline-block rounded px-2.5 py-0.5 text-xs font-bold capitalize ${getServiceColor(item.service)}`}
                    >
                      {item.service}
                    </span>
                  </td>
                  <td className="p-4">{formatMetricName(item.metric_name)}</td>
                  <td className="p-4 text-right font-semibold">
                    {item.value.toLocaleString()}{" "}
                    <span className="text-xs font-normal text-zinc-400">{item.unit}</span>
                  </td>
                  <td className="p-4 text-right text-xs text-zinc-500 dark:text-zinc-400">
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
