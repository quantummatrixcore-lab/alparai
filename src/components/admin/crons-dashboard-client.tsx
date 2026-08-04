"use client";

import { useState } from "react";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import { triggerCronJobAction } from "@/actions/system-mgmt";
import { Clock, Play, CheckCircle2, Network } from "lucide-react";
import { useTranslations } from "next-intl";

interface CronJob {
  name: string;
  schedule: string;
  target: string;
  status: "active" | "idle";
  lastRun: string;
}

export function CronsDashboardClient() {
  const t = useTranslations("admin");
  const [jobs, setJobs] = useState<CronJob[]>([
    {
      name: "prune_old_telemetry",
      schedule: "0 3 * * *",
      target: "30-day auto-prune for geo_citations & logs",
      status: "active",
      lastRun: "Today at 03:00 UTC",
    },
    {
      name: "auto_translate_incidents_batch",
      schedule: "*/15 * * * *",
      target: "Turkish machine translation backfill queue",
      status: "active",
      lastRun: "10 mins ago",
    },
    {
      name: "generate_marketing_drafts",
      schedule: "0 9 * * 1-5",
      target: "Generate social media draft content",
      status: "active",
      lastRun: "Yesterday at 09:00 UTC",
    },
    {
      name: "collect_dora_metrics_daily",
      schedule: "0 0 * * *",
      target: "Snapshot deployment and MTTR metrics",
      status: "active",
      lastRun: "Today at 00:00 UTC",
    },
    {
      name: "check_sla_alarms",
      schedule: "*/5 * * * *",
      target: "Evaluate subsystem thresholds and fire SLA alarms",
      status: "active",
      lastRun: "2 mins ago",
    },
  ]);

  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleTrigger = async (jobName: string) => {
    setRunningJob(jobName);
    setNotice(null);
    const res = await triggerCronJobAction(jobName);
    setRunningJob(null);

    if (res.success) {
      setNotice(res.message);
      setJobs((prev) =>
        prev.map((j) => (j.name === jobName ? { ...j, lastRun: "Just now (manual trigger)" } : j)),
      );
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-8" data-testid="crons-dashboard">
      {notice && (
        <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> {notice}
        </div>
      )}

      <AdminSectionCard title={t("supabase_pg_cron_active_schedules")}>
        <div className="divide-y divide-white/10 p-6">
          {jobs.map((job) => (
            <div
              key={job.name}
              className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span className="font-mono text-sm font-bold text-white">{job.name}</span>
                  <span className="text-fg-muted rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px]">
                    {job.schedule}
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400 uppercase">
                    {job.status}
                  </span>
                </div>
                <p className="text-fg-muted text-xs">{job.target}</p>
                <p className="text-fg-muted font-mono text-[10px]">
                  {t("last_run")}
                  {job.lastRun}
                </p>
              </div>

              <button
                type="button"
                disabled={runningJob === job.name}
                onClick={() => handleTrigger(job.name)}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 text-emerald-400" />
                {runningJob === job.name ? "Triggering..." : "Trigger Now"}
              </button>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard title={t("cron_topology_map")}>
        <div className="text-fg-muted space-y-3 p-6 text-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Network className="h-4 w-4 text-cyan-400" /> {t("re_homed_to_supabase_pg_cron")}
          </div>
          <p className="text-[11px]">{t("vercel_crons_disabled_in_vercel_json_to_")}</p>
        </div>
      </AdminSectionCard>
    </div>
  );
}
