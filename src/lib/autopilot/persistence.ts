import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AutopilotResult, IdempotencyKey } from "./types";
import { logger } from "@/lib/utils/logger";

export interface PersistedAutopilotRun {
  id: string;
  status: string;
  attempts: number;
  result_id: string | null;
  idempotency_key: string;
}

const mapResultToStatus = <T>(result: AutopilotResult<T>): string => {
  if (result.kind === "ok") return "succeeded";
  if (result.kind === "idempotency_violation") return "replayed";
  return result.kind;
};

export const persistAutopilotRun = async <T>(
  action: string,
  idempotencyKey: IdempotencyKey,
  result: AutopilotResult<T>,
  userId: string | null,
  ipHash: string | null,
  durationMs: number,
  costTokens?: number,
  costCents?: number,
  tokenCount?: number,
): Promise<PersistedAutopilotRun | null> => {
  try {
    const admin = createAdminClient();
    const status = mapResultToStatus(result);
    const attempts = "attempts" in result ? result.attempts : 0;
    const lastError = result.kind === "exhausted" ? result.error : null;
    const resultId =
      result.kind === "ok" &&
      result.value &&
      typeof result.value === "object" &&
      "id" in result.value
        ? String((result.value as Record<string, unknown>)["id"])
        : null;

    const { data, error } = await admin
      .from("autopilot_runs")
      .upsert(
        {
          idempotency_key: idempotencyKey,
          action,
          status,
          attempts,
          last_error: lastError,
          duration_ms: durationMs,
          result_id: resultId,
          user_id: userId,
          ip_hash: ipHash,
          cost_cents: costCents ?? 0,
          token_count: tokenCount ?? costTokens ?? 0,
          metadata: { cost_tokens: costTokens ?? 0, cost_cents: costCents ?? 0 },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "idempotency_key" },
      )
      .select("id, status, attempts, result_id, idempotency_key")
      .single();

    if (error || !data) {
      logger.error("[autopilot] persist failed", { reason: error?.message ?? "no data" });
      return null;
    }
    const row = data as Record<string, unknown>;
    return {
      id: String(row["id"]),
      status: String(row["status"]),
      attempts: Number(row["attempts"] ?? 0),
      result_id: row["result_id"] === null ? null : String(row["result_id"]),
      idempotency_key: String(row["idempotency_key"]),
    };
  } catch (e) {
    logger.error("[autopilot] persist exception", undefined, e instanceof Error ? e : undefined);
    return null;
  }
};

export const findReplay = async (
  idempotencyKey: IdempotencyKey,
): Promise<PersistedAutopilotRun | null> => {
  try {
    const admin = createAdminClient();
    const { data, error } = (await admin
      .from("autopilot_runs")
      .select("id, status, attempts, result_id, idempotency_key")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle()) as unknown as {
      data: Record<string, unknown> | null;
      error: { message: string } | null;
    };
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    return {
      id: String(row["id"]),
      status: String(row["status"]),
      attempts: Number(row["attempts"] ?? 0),
      result_id: row["result_id"] === null ? null : String(row["result_id"]),
      idempotency_key: String(row["idempotency_key"]),
    };
  } catch {
    return null;
  }
};

export interface PersistedAutopilotRunWithMeta extends PersistedAutopilotRun {
  action: string;
  duration_ms: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  cost_cents?: number;
  token_count?: number;
  metadata?: Record<string, unknown> | null;
}

export const listRecentRuns = async (limit: number): Promise<PersistedAutopilotRunWithMeta[]> => {
  try {
    const admin = createAdminClient();
    const { data, error } = (await admin
      .from("autopilot_runs")
      .select(
        "id, status, attempts, result_id, idempotency_key, action, duration_ms, last_error, created_at, updated_at, cost_cents, token_count, metadata",
      )
      .order("updated_at", { ascending: false })
      .limit(limit)) as unknown as {
      data: Record<string, unknown>[] | null;
      error: { message: string } | null;
    };
    if (error || !data) return [];
    return data.map((row) => ({
      id: String(row["id"]),
      status: String(row["status"]),
      attempts: Number(row["attempts"] ?? 0),
      result_id: row["result_id"] === null ? null : String(row["result_id"]),
      idempotency_key: String(row["idempotency_key"]),
      action: String(row["action"] ?? "unknown"),
      duration_ms: Number(row["duration_ms"] ?? 0),
      last_error: row["last_error"] === null ? null : String(row["last_error"]),
      created_at: String(row["created_at"] ?? ""),
      updated_at: String(row["updated_at"] ?? ""),
      cost_cents: Number(row["cost_cents"] ?? 0),
      token_count: Number(row["token_count"] ?? 0),
      metadata: row["metadata"] as Record<string, unknown> | null,
    }));
  } catch {
    return [];
  }
};

export interface AutopilotRunStats {
  total: number;
  succeeded: number;
  failed: number;
  retried: number;
  replayed: number;
  byAction: Record<string, number>;
  byStatus: Record<string, number>;
  p50DurationMs: number;
  p95DurationMs: number;
  totalTokens: number;
  totalCostCents: number;
  estimatedCostUSD: number;
}

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx] ?? 0;
};

export const summarizeRuns = (runs: PersistedAutopilotRunWithMeta[]): AutopilotRunStats => {
  const byAction: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const durations: number[] = [];
  let succeeded = 0;
  let failed = 0;
  let retried = 0;
  let replayed = 0;
  let totalTokens = 0;
  let totalCostCents = 0;
  for (const run of runs) {
    byAction[run.action] = (byAction[run.action] ?? 0) + 1;
    byStatus[run.status] = (byStatus[run.status] ?? 0) + 1;
    durations.push(run.duration_ms);
    const runTokens = Number(run.token_count ?? run.metadata?.cost_tokens ?? 0);
    totalTokens += runTokens;
    totalCostCents += Number(run.cost_cents ?? 0);
    if (run.status === "ok" || run.status === "succeeded") succeeded += 1;
    else if (run.status === "exhausted" || run.status === "circuit_open") failed += 1;
    else if (run.status === "budget_exceeded") retried += 1;
    else if (run.status === "replayed") replayed += 1;
  }
  const estimatedCostUSD =
    totalCostCents > 0 ? totalCostCents / 100 : (totalTokens / 1_000_000) * 2.0;
  return {
    total: runs.length,
    succeeded,
    failed,
    retried,
    replayed,
    byAction,
    byStatus,
    p50DurationMs: percentile(durations, 50),
    p95DurationMs: percentile(durations, 95),
    totalTokens,
    totalCostCents,
    estimatedCostUSD,
  };
};
