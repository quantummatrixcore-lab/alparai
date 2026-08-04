import "server-only";
import { getQueue } from "./queue";
import type { QueueJob } from "./queue";
import { withAutopilot, getPolicy } from "./index";
import { policies } from "./policies";
import type { AttemptContext, AttemptOutcome } from "./types";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";

export type WorkerHandler = (
  job: QueueJob,
  ctx: AttemptContext,
) => Promise<AttemptOutcome<unknown>>;

const handlers = new Map<string, WorkerHandler>();

export const registerAutopilotHandler = (action: string, handler: WorkerHandler): void => {
  handlers.set(action, handler);
};

export const getAutopilotHandler = (action: string): WorkerHandler | null =>
  handlers.get(action) ?? null;

export interface WorkerOptions {
  batchSize: number;
  pollIntervalMs: number;
  maxEmptyPolls: number;
  signal?: AbortSignal;
}

export interface WorkerRunStats {
  processed: number;
  succeeded: number;
  retried: number;
  failed: number;
  emptyPolls: number;
  durationMs: number;
}

const isRegisteredAction = (action: string): action is keyof typeof policies =>
  Object.prototype.hasOwnProperty.call(policies, action);

export const isWorkerEnabled = async (workerName: string): Promise<boolean> => {
  if (process.env.AUTOPILOT_KILL_SWITCH === "true") {
    return false;
  }
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("autopilot_worker_config")
      .select("enabled")
      .eq("worker_name", workerName)
      .maybeSingle();

    if (error || !data) {
      return true;
    }
    return !!data.enabled;
  } catch {
    return true;
  }
};

const defaultHandlerFor = (action: string): WorkerHandler => {
  if (!isRegisteredAction(action)) {
    throw new Error(`[autopilot worker] no policy registered for action ${action}`);
  }
  return async (job, ctx): Promise<AttemptOutcome<unknown>> => {
    void ctx;
    const policy = getPolicy(action);
    void policy;
    return {
      kind: "fatal",
      error: `no worker handler bound for action ${action}; payload=${JSON.stringify(job.payload)}`,
    };
  };
};

const processJob = async (job: QueueJob): Promise<"ok" | "retry" | "fail"> => {
  const handler = handlers.get(job.action) ?? defaultHandlerFor(job.action);
  if (!isRegisteredAction(job.action)) {
    return "fail";
  }
  const enabled = await isWorkerEnabled(job.action);
  if (!enabled) {
    logger.warn(`[autopilot worker] worker for action ${job.action} is disabled, skipping`);
    return "retry";
  }
  const policy = getPolicy(job.action);
  const result = await withAutopilot(
    policy,
    [job.id, job.idempotencyKey],
    async (ctx) => handler(job, ctx),
    { context: { userId: null, ipHash: null, clientIdempotencyKey: job.idempotencyKey } },
  );
  if (result.kind === "ok" || result.kind === "replayed") return "ok";
  if (result.kind === "exhausted" || result.kind === "budget_exceeded") return "fail";
  return "retry";
};

export const runAutopilotWorkerOnce = async (
  options: Partial<WorkerOptions> = {},
): Promise<WorkerRunStats> => {
  const started = Date.now();
  const stats: WorkerRunStats = {
    processed: 0,
    succeeded: 0,
    retried: 0,
    failed: 0,
    emptyPolls: 0,
    durationMs: 0,
  };
  if (process.env.AUTOPILOT_KILL_SWITCH === "true") {
    logger.warn(
      `[autopilot worker] Global AUTOPILOT_KILL_SWITCH is enabled, skipping runAutopilotWorkerOnce`,
    );
    stats.durationMs = Date.now() - started;
    return stats;
  }
  const batchSize = options.batchSize ?? 5;
  const queue = getQueue();
  const jobs = await queue.pull(batchSize);
  for (const job of jobs) {
    const outcome = await processJob(job);
    stats.processed += 1;
    if (outcome === "ok") stats.succeeded += 1;
    else if (outcome === "retry") stats.retried += 1;
    else stats.failed += 1;
    await queue.ack(job.id);
  }
  stats.durationMs = Date.now() - started;
  return stats;
};

export const runAutopilotWorker = async (
  options: Partial<WorkerOptions> = {},
): Promise<WorkerRunStats> => {
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  const maxEmptyPolls = options.maxEmptyPolls ?? 60;
  const queue = getQueue();
  const signal = options.signal ?? new AbortController().signal;
  const aggregate: WorkerRunStats = {
    processed: 0,
    succeeded: 0,
    retried: 0,
    failed: 0,
    emptyPolls: 0,
    durationMs: 0,
  };
  const started = Date.now();
  while (!signal.aborted) {
    if (process.env.AUTOPILOT_KILL_SWITCH === "true") {
      logger.warn(
        `[autopilot worker] Global AUTOPILOT_KILL_SWITCH is enabled, halting worker loop`,
      );
      break;
    }
    const batch = await queue.pull(options.batchSize ?? 5);
    if (batch.length === 0) {
      aggregate.emptyPolls += 1;
      if (aggregate.emptyPolls >= maxEmptyPolls) break;
      await new Promise((r) => setTimeout(r, pollIntervalMs));
      continue;
    }
    aggregate.emptyPolls = 0;
    for (const job of batch) {
      const outcome = await processJob(job);
      aggregate.processed += 1;
      if (outcome === "ok") aggregate.succeeded += 1;
      else if (outcome === "retry") aggregate.retried += 1;
      else aggregate.failed += 1;
      await queue.ack(job.id);
    }
  }
  aggregate.durationMs = Date.now() - started;
  return aggregate;
};
