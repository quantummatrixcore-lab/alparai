"use server";

import { requireAdmin } from "@/lib/auth/session";
import {
  listRecentRuns,
  summarizeRuns,
  breakerSnapshot,
  runAutopilotWorkerOnce,
  type PersistedAutopilotRunWithMeta,
  type AutopilotRunStats,
} from "@/lib/autopilot";
import { getPolicy, policyNames } from "@/lib/autopilot";
import type { BreakerSnapshot } from "@/lib/autopilot";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AutopilotWorkerConfig {
  worker_name: string;
  enabled: boolean;
  updated_at: string;
}

export interface CronJobLog {
  id: string;
  cron_name: string;
  started_at: string;
  completed_at: string | null;
  status: "running" | "success" | "failed";
  error_message: string | null;
  execution_metadata: Record<string, unknown> | null;
}

export interface AdminAutopilotSnapshot {
  runs: PersistedAutopilotRunWithMeta[];
  stats: AutopilotRunStats & { avgLatencyMs: number };
  breakers: Record<string, BreakerSnapshot | null>;
  policies: ReadonlyArray<{
    action: string;
    onExhaust: string;
    attempts: number;
    budgetMs: number;
    budgetTokens: number;
  }>;
  queue: { available: boolean; size: number };
  workerConfigs: AutopilotWorkerConfig[];
  globalKillSwitch: boolean;
  cronLogs: CronJobLog[];
  activeEngines: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    lastHeartbeat: string | null;
  }>;
  dailyTokens: number;
}

export interface AdminAutopilotResult {
  ok: boolean;
  snapshot?: AdminAutopilotSnapshot;
  error?: string;
}

export async function getAdminAutopilotSnapshot(limit = 100): Promise<AdminAutopilotResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };
  const runs = await listRecentRuns(limit);
  const stats = summarizeRuns(runs);
  const breakers: Record<string, BreakerSnapshot | null> = {};
  for (const name of policyNames()) {
    breakers[name] = breakerSnapshot(name);
  }
  const policies = policyNames().map((name) => {
    const cfg = getPolicy(name).config;
    return {
      action: cfg.action,
      onExhaust: cfg.onExhaust,
      attempts: cfg.retry.attempts,
      budgetMs: cfg.budget.maxMs,
      budgetTokens: cfg.budget.maxTokens,
    };
  });

  const dbAdmin = createAdminClient();
  const { data: configsData } = await dbAdmin
    .from("autopilot_worker_config")
    .select("worker_name, enabled, updated_at");

  const workerConfigs = (configsData || []).map((row) => ({
    worker_name: String(row.worker_name),
    enabled: Boolean(row.enabled),
    updated_at: String(row.updated_at),
  }));

  const globalKillSwitch = process.env.AUTOPILOT_KILL_SWITCH === "true";

  const { getQueue } = await import("@/lib/autopilot");
  const q = getQueue();
  const size = await q.size();

  // 1. Cron run logs from DB
  const { data: cronLogsData } = await dbAdmin
    .from("cron_job_logs" as never)
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  const cronLogs = ((cronLogsData || []) as Record<string, unknown>[]).map((row) => ({
    id: String(row["id"] || ""),
    cron_name: String(row["cron_name"] || ""),
    started_at: String(row["started_at"] || ""),
    completed_at: row["completed_at"] ? String(row["completed_at"]) : null,
    status: (row["status"] || "failed") as "running" | "success" | "failed",
    error_message: row["error_message"] ? String(row["error_message"]) : null,
    execution_metadata: (row["execution_metadata"] || null) as Record<string, unknown> | null,
  }));

  // 2. Active engines status (from engine registry)
  const { getRegistryReport } = await import("@/lib/engine-registry");
  const activeEngines = (await getRegistryReport()).services;

  // 3. Active daily token count (from cross_audit_runs last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: crossAuditRuns } = await dbAdmin
    .from("cross_audit_runs")
    .select("tokens_in, tokens_out")
    .gte("created_at", oneDayAgo);

  const dailyTokens = (crossAuditRuns || []).reduce(
    (acc, curr) => acc + (curr.tokens_in || 0) + (curr.tokens_out || 0),
    0,
  );

  const avgLatencyMs =
    runs.length > 0 ? runs.reduce((acc, r) => acc + r.duration_ms, 0) / runs.length : 0;

  return {
    ok: true,
    snapshot: {
      runs,
      stats: { ...stats, avgLatencyMs },
      breakers,
      policies,
      queue: { available: q.available, size },
      workerConfigs,
      globalKillSwitch,
      cronLogs,
      activeEngines,
      dailyTokens,
    },
  };
}

export async function triggerAutopilotWorkerTick(): Promise<{
  ok: boolean;
  processed?: number;
  succeeded?: number;
  retried?: number;
  failed?: number;
  error?: string;
}> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };
  const stats = await runAutopilotWorkerOnce({ batchSize: 10 });
  return {
    ok: true,
    processed: stats.processed,
    succeeded: stats.succeeded,
    retried: stats.retried,
    failed: stats.failed,
  };
}

export async function toggleAutopilotWorker(
  workerName: string,
  enabled: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const dbAdmin = createAdminClient();
  const { error } = await dbAdmin.from("autopilot_worker_config").upsert(
    {
      worker_name: workerName,
      enabled,
      updated_at: new Date().toISOString(),
      updated_by: admin.id,
    },
    { onConflict: "worker_name" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
