"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface CronJob {
  name: string;
  lastRun: string;
  status: string;
  executionTime: number; // ms
}

interface CronHealthProps {
  jobs: CronJob[];
  historyData: { time: string; success: number; failed: number }[];
}

export function CronHealthClient({ jobs, historyData }: CronHealthProps) {
  const t = useTranslations("admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mt-8 space-y-8">
      {/* Execution History Chart */}
      <AdminSectionCard title={t("cron_execution_history") || "Cron Execution History (24h)"}>
        <div className="h-64 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={{ stroke: "#ffffff10" }}
                  tickLine={false}
                />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fafafa" }}
                  cursor={{ fill: "#ffffff05" }}
                />
                <Bar dataKey="success" stackId="a" fill="#27ae60" radius={[0, 0, 4, 4]}>
                  {historyData.map((_, index) => (
                    <Cell key={`cell-success-${index}`} fill="#27ae60" />
                  ))}
                </Bar>
                <Bar dataKey="failed" stackId="a" fill="#e63946" radius={[4, 4, 0, 0]}>
                  {historyData.map((_, index) => (
                    <Cell key={`cell-error-${index}`} fill="#e74c3c" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full animate-pulse items-center justify-center rounded-xl bg-white/5 text-sm text-white/40">
              Loading Chart...
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <span className="flex items-center gap-2 text-emerald-400">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            {t("success") || "Success"}
          </span>
          <span className="flex items-center gap-2 text-red-400">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            {t("failed") || "Failed"}
          </span>
        </div>
      </AdminSectionCard>

      {/* Cron Jobs Table */}
      <AdminSectionCard title={t("active_cron_jobs") || "Active Cron Jobs"}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs font-semibold text-white/40 uppercase">
              <tr>
                <th className="pr-4 pb-3">{t("job_name") || "Job Name"}</th>
                <th className="pr-4 pb-3">{t("last_run") || "Last Run"}</th>
                <th className="pr-4 pb-3">{t("execution_time") || "Avg Execution Time"}</th>
                <th className="pb-3">{t("status") || "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.map((job) => (
                <tr key={job.name} className="text-white/80 transition-colors hover:bg-white/5">
                  <td className="py-3 pr-4 font-mono text-sky-400">{job.name}</td>
                  <td className="py-3 pr-4 text-white/60">{job.lastRun}</td>
                  <td className="py-3 pr-4 font-mono text-white/80">{job.executionTime}ms</td>
                  <td className="py-3">
                    {job.status === "Active" ? (
                      <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> {t("active") || "Active"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded bg-red-500/10 px-2 py-1 text-xs font-bold text-red-400">
                        <AlertCircle className="h-3.5 w-3.5" /> {t("degraded") || "Degraded"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-fg-muted p-8 text-center">
                    {t("no_cron_jobs") || "No cron job data available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>
    </div>
  );
}
