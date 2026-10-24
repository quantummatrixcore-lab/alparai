let vault: { read: (k: string) => string | undefined } = { read: () => undefined };
try { vault = require("@/lib/security/vault").vault; } catch { /* stub bicimi korunur */ }
import "server-only";
import { getQueue } from "./queue";
import type { QueueJob, QueueHandle } from "./queue";
import { withAutopilot, getPolicy } from "./index";
import { policies } from "./policies";
import type { AttemptContext, AttemptOutcome } from "./types";
import { createAdminClient } from "@/lib/dehost/admin";
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
  if ((vault.read('AUTOPILOT_KILL_SWITCH') ?? process.env.AUTOPILOT_KILL_SWITCH) === "true") {
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

export type ProcessJobOutcome = "success" | "ok" | "retry" | "dead_letter" | "fail";

export const processJob = async (job: QueueJob): Promise<ProcessJobOutcome> => {
  const handler = handlers.get(job.action) ?? defaultHandlerFor(job.action);
  if (!isRegisteredAction(job.action)) {
    return "dead_letter";
  }
  const enabled = await isWorkerEnabled(job.action);
  if (!enabled) {
    logger.warn(`[autopilot worker] worker for action ${job.action} is disabled, skipping`);
    return "retry";
  }
  const policy = getPolicy(job.action);
  try {
    const result = await withAutopilot(
      policy,
      [job.id || "", job.idempotencyKey],
      async (ctx) => handler(job, ctx),
      { context: { userId: null, ipHash: null, clientIdempotencyKey: job.idempotencyKey } },
    );
    if (result.kind === "ok" || result.kind === "replayed") return "success";
    if (result.kind === "exhausted" || result.kind === "budget_exceeded") return "dead_letter";
    return "retry";
  } catch (err) {
    logger.error(`[autopilot worker] uncaught error in processJob for action ${job.action}`, {
      error: err,
    });
    return "retry";
  }
};

export const processJobAndHandleOutcome = async (
  job: QueueJob,
  queue: QueueHandle,
  stats: Pick<WorkerRunStats, "processed" | "succeeded" | "retried" | "failed">,
): Promise<"success" | "retry" | "dead_letter"> => {
  stats.processed += 1;
  const outcome = await processJob(job);

  if (outcome === "success" || outcome === "ok") {
    stats.succeeded += 1;
    await queue.ack(job.id || "");
    return "success";
  }

  if (outcome === "retry") {
    const currentRetries = job.retryCount ?? job.retries ?? 0;
    const maxRetries =
      job.maxRetries ??
      (isRegisteredAction(job.action) ? getPolicy(job.action).config.retry.attempts : 3);

    if (currentRetries >= maxRetries) {
      logger.warn(
        `[autopilot worker] Job ${job.id || "unknown"} for action ${job.action} reached max retries (${maxRetries}), moving to dead_letter`,
      );
      if (typeof queue.deadLetter === "function") {
        await queue.deadLetter(job, `Max retries (${maxRetries}) reached`);
      }
      stats.failed += 1;
      await queue.ack(job.id || "");
      return "dead_letter";
    }

    job.retryCount = currentRetries + 1;
    job.retries = job.retryCount;
    stats.retried += 1;

    if (typeof queue.push === "function") {
      await queue.push(job);
    } else {
      await queue.enqueue(job);
    }
    // Note: queue.ack(job.id) is intentionally NOT called to avoid silent job loss
    return "retry";
  }

  // outcome is "dead_letter" or "fail"
  if (typeof queue.deadLetter === "function") {
    await queue.deadLetter(job, "Job failed permanently or exhausted");
  }
  stats.failed += 1;
  await queue.ack(job.id || "");
  return "dead_letter";
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
  if ((vault.read('AUTOPILOT_KILL_SWITCH') ?? process.env.AUTOPILOT_KILL_SWITCH) === "true") {
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
    await processJobAndHandleOutcome(job, queue, stats);
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
    if ((vault.read('AUTOPILOT_KILL_SWITCH') ?? process.env.AUTOPILOT_KILL_SWITCH) === "true") {
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
      await processJobAndHandleOutcome(job, queue, aggregate);
    }
  }
  aggregate.durationMs = Date.now() - started;
  return aggregate;
};
