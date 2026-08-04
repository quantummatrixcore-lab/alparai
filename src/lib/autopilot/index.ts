import "server-only";
import { CircuitBreaker } from "./breaker";
import { isBudgetExceededMs, isBudgetExceededTokens } from "./budget";
import { resolveIdempotencyKey } from "./idempotency";
import { computeBackoffMs, isRetryableError, sleep } from "./retry";
import { emitTelemetry, makeTelemetryPayload } from "./telemetry";
import { persistAutopilotRun, findReplay } from "./persistence";
import { enqueueAutopilotJob } from "./queue";
import type {
  AttemptContext,
  AttemptOutcome,
  AutopilotConfig,
  AutopilotPolicy,
  AutopilotResult,
  AutopilotTelemetryPayload,
} from "./types";
import { createAttemptId } from "./types";

export type {
  AttemptContext,
  AttemptOutcome,
  AutopilotConfig,
  AutopilotPolicy,
  AutopilotResult,
  AutopilotTelemetryPayload,
  IdempotencyKey,
} from "./types";
export {
  DEFAULT_BREAKER,
  DEFAULT_BUDGET,
  DEFAULT_IDEMPOTENCY,
  DEFAULT_RETRY,
  SAFE_REDACTION_FIELDS,
  createAttemptId,
  createIdempotencyKey,
  attemptsOf,
  durationOf,
  isSuccess,
} from "./types";
export { defaultPolicy, definePolicy, isPolicy } from "./define";
export {
  policies,
  submitIncidentPolicy,
  submitContactPolicy,
  submitTakedownPolicy,
  voteIncidentPolicy,
  moderateIncidentPolicy,
  submitSuggestionPolicy,
  reviewTakedownPolicy,
  exportDataPolicy,
  submitModelReviewPolicy,
  submitModelFeatureRequestPolicy,
  syncNewsPolicy,
  autoModerateIncidentPolicy,
  subscribeNewsletterPolicy,
  weeklyReportPolicy,
  weeklyPollPolicy,
  submitWhistleblowerPolicy,
  isAutopilotPolicyName,
  getPolicy,
  policyNames,
  buildConfig,
} from "./policies";
export type { AutopilotPolicyName } from "./policies";
export { computeBackoffMs, isRetryableError, sleep } from "./retry";
export { CircuitBreaker, toBreakerSnapshot } from "./breaker";
export type { BreakerSnapshot, BreakerDecision } from "./breaker";
export {
  computeElapsedMs,
  computeRemainingMs,
  isBudgetExceededMs,
  isBudgetExceededTokens,
  makeBudgetSnapshot,
  estimateMaxAttempts,
} from "./budget";
export type { BudgetSnapshot } from "./budget";
export {
  computeIdempotencyKey,
  parseClientIdempotencyKey,
  resolveIdempotencyKey,
  redactForLog,
} from "./idempotency";
export { configureTelemetry, emitTelemetry, safeCaptureException } from "./telemetry";
export { persistAutopilotRun, findReplay, listRecentRuns, summarizeRuns } from "./persistence";
export type {
  PersistedAutopilotRun,
  PersistedAutopilotRunWithMeta,
  AutopilotRunStats,
} from "./persistence";
export { getQueue, enqueueAutopilotJob } from "./queue";
export type { QueueHandle, QueueJob } from "./queue";
export {
  registerAutopilotHandler,
  getAutopilotHandler,
  runAutopilotWorker,
  runAutopilotWorkerOnce,
} from "./worker";
export type { WorkerHandler, WorkerOptions, WorkerRunStats } from "./worker";

const breakers = new Map<string, CircuitBreaker>();
const breakerRegistry = new Map<string, AutopilotConfig>();

const getBreaker = (action: string, config: AutopilotConfig): CircuitBreaker => {
  const existing = breakers.get(action);
  if (existing) return existing;
  const fresh = new CircuitBreaker(config.breaker);
  breakers.set(action, fresh);
  breakerRegistry.set(action, config);
  return fresh;
};

const resolvePolicy = (input: AutopilotPolicy | AutopilotConfig): AutopilotConfig =>
  "config" in input ? input.config : input;

const toTelemetry = <T>(
  policy: AutopilotConfig,
  result: AutopilotResult<T>,
  attempts: number,
  durationMs: number,
  userId: string | null,
  ipHash: string | null,
  error: unknown,
): AutopilotTelemetryPayload =>
  makeTelemetryPayload({
    action: policy.action,
    result: result as AutopilotResult<unknown>,
    attempts,
    durationMs,
    userId,
    ipHash,
    error,
  });

export interface AutopilotContext {
  userId: string | null;
  ipHash: string | null;
  clientIdempotencyKey: string | null;
}

export interface AutopilotOptions {
  context?: AutopilotContext;
  configOverrides?: Partial<AutopilotConfig>;
}

export const withAutopilot = async <T>(
  policyOrConfig: AutopilotPolicy | AutopilotConfig,
  inputs: ReadonlyArray<unknown>,
  work: (ctx: AttemptContext) => Promise<AttemptOutcome<T>>,
  options: AutopilotOptions = {},
): Promise<AutopilotResult<T>> => {
  const baseConfig = resolvePolicy(policyOrConfig);
  const config: AutopilotConfig = {
    ...baseConfig,
    ...(options.configOverrides ?? {}),
    retry: { ...baseConfig.retry, ...(options.configOverrides?.retry ?? {}) },
    breaker: { ...baseConfig.breaker, ...(options.configOverrides?.breaker ?? {}) },
    budget: { ...baseConfig.budget, ...(options.configOverrides?.budget ?? {}) },
    idempotency: {
      ...baseConfig.idempotency,
      ...(options.configOverrides?.idempotency ?? {}),
    },
  };
  const ctx: AutopilotContext = options.context ?? {
    userId: null,
    ipHash: null,
    clientIdempotencyKey: null,
  };
  const idempotencyKey = resolveIdempotencyKey(
    config.idempotency,
    config.action,
    inputs,
    ctx.clientIdempotencyKey,
  );

  if (config.idempotency.enabled) {
    const replay = await findReplay(idempotencyKey);
    if (replay && replay.status === "succeeded") {
      return {
        kind: "replayed",
        value: replay.result_id,
        originalId: replay.result_id ?? replay.id,
        attempts: replay.attempts,
        idempotencyKey,
      };
    }
  }

  const breaker = getBreaker(config.action, config);
  const decision = breaker.shouldAllow();
  if (!decision.allow) {
    const exhausted: AutopilotResult<T> = {
      kind: "circuit_open",
      cooldownMs: decision.cooldownMs,
      idempotencyKey,
    };
    emitTelemetry(
      toTelemetry(config, exhausted, 0, 0, ctx.userId, ctx.ipHash, null),
      exhausted,
      null,
    );
    return exhausted;
  }

  const start = Date.now();
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), config.budget.maxMs);

  let lastError: unknown = null;
  let totalTokens = 0;
  let attempts = 0;
  let lastResult: AttemptOutcome<T> | null = null;

  for (let i = 1; i <= config.retry.attempts; i += 1) {
    if (abort.signal.aborted) break;
    if (isBudgetExceededMs(config.budget, start)) {
      const budget: AutopilotResult<T> = {
        kind: "budget_exceeded",
        costMs: Date.now() - start,
        attempts,
        idempotencyKey,
      };
      emitTelemetry(
        toTelemetry(config, budget, attempts, Date.now() - start, ctx.userId, ctx.ipHash, null),
        budget,
        null,
      );
      clearTimeout(timer);
      await persistAutopilotRun(
        config.action,
        idempotencyKey,
        budget,
        ctx.userId,
        ctx.ipHash,
        Date.now() - start,
        totalTokens,
      );
      return budget;
    }
    if (isBudgetExceededTokens(config.budget, totalTokens)) {
      const budget: AutopilotResult<T> = {
        kind: "budget_exceeded",
        costMs: Date.now() - start,
        attempts,
        idempotencyKey,
      };
      emitTelemetry(
        toTelemetry(config, budget, attempts, Date.now() - start, ctx.userId, ctx.ipHash, null),
        budget,
        null,
      );
      clearTimeout(timer);
      await persistAutopilotRun(
        config.action,
        idempotencyKey,
        budget,
        ctx.userId,
        ctx.ipHash,
        Date.now() - start,
        totalTokens,
      );
      return budget;
    }

    attempts = i;
    const attemptCtx: AttemptContext = {
      attempt: i,
      startedAt: Date.now(),
      idempotencyKey,
      signal: abort.signal,
      costTokens: totalTokens,
    };
    const attemptId = createAttemptId(`${config.action}:${idempotencyKey}:${i}`);
    void attemptId;

    try {
      const outcome = await work(attemptCtx);
      lastResult = outcome;
      if (outcome.costTokens) totalTokens += outcome.costTokens;
      if (outcome.kind === "success") {
        breaker.recordSuccess();
        clearTimeout(timer);
        const ok: AutopilotResult<T> = {
          kind: "ok",
          value: outcome.value,
          attempts: i,
          durationMs: Date.now() - start,
          idempotencyKey,
        };
        emitTelemetry(
          toTelemetry(config, ok, i, ok.durationMs, ctx.userId, ctx.ipHash, null),
          ok,
          null,
        );
        await persistAutopilotRun(
          config.action,
          idempotencyKey,
          ok,
          ctx.userId,
          ctx.ipHash,
          ok.durationMs,
          totalTokens,
        );
        return ok;
      }
      if (outcome.kind === "fatal") {
        breaker.recordSuccess();
        clearTimeout(timer);
        const exhausted: AutopilotResult<T> = {
          kind: "exhausted",
          error: outcome.error,
          attempts: i,
          durationMs: Date.now() - start,
          idempotencyKey,
        };
        emitTelemetry(
          toTelemetry(
            config,
            exhausted,
            i,
            exhausted.durationMs,
            ctx.userId,
            ctx.ipHash,
            outcome.error,
          ),
          exhausted,
          outcome.error,
        );
        await persistAutopilotRun(
          config.action,
          idempotencyKey,
          exhausted,
          ctx.userId,
          ctx.ipHash,
          exhausted.durationMs,
          totalTokens,
        );
        return exhausted;
      }
      lastError = outcome.error;
      breaker.recordFailure();
    } catch (err) {
      lastError = err;
      lastResult = { kind: "retryable", error: errorMessage(err) };
      if (!isRetryableError(err)) {
        breaker.recordSuccess();
        clearTimeout(timer);
        const exhausted: AutopilotResult<T> = {
          kind: "exhausted",
          error: errorMessage(err),
          attempts: i,
          durationMs: Date.now() - start,
          idempotencyKey,
        };
        emitTelemetry(
          toTelemetry(config, exhausted, i, exhausted.durationMs, ctx.userId, ctx.ipHash, err),
          exhausted,
          err,
        );
        await persistAutopilotRun(
          config.action,
          idempotencyKey,
          exhausted,
          ctx.userId,
          ctx.ipHash,
          exhausted.durationMs,
          totalTokens,
        );
        return exhausted;
      }
      breaker.recordFailure();
    }

    if (i < config.retry.attempts) {
      const backoff = computeBackoffMs(i, config.retry);
      try {
        await sleep(backoff, abort.signal);
      } catch {
        break;
      }
    }
  }

  clearTimeout(timer);
  const errorMsg =
    lastResult && lastResult.kind !== "success" ? lastResult.error : errorMessage(lastError);
  const exhausted: AutopilotResult<T> = {
    kind: "exhausted",
    error: errorMsg,
    attempts,
    durationMs: Date.now() - start,
    idempotencyKey,
  };
  emitTelemetry(
    toTelemetry(
      config,
      exhausted,
      attempts,
      exhausted.durationMs,
      ctx.userId,
      ctx.ipHash,
      lastError,
    ),
    exhausted,
    lastError,
  );
  await persistAutopilotRun(
    config.action,
    idempotencyKey,
    exhausted,
    ctx.userId,
    ctx.ipHash,
    exhausted.durationMs,
    totalTokens,
  );

  if (config.onExhaust === "escalate_admin") {
    void enqueueAutopilotJob(config.action, idempotencyKey, {
      reason: "exhausted",
      attempts,
      error: errorMsg,
    });
  }

  return exhausted;
};

const errorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    try {
      return JSON.stringify(err);
    } catch {
      return "unknown";
    }
  }
  return "unknown";
};

export const resetBreaker = (action: string): boolean => {
  const breaker = breakers.get(action);
  if (!breaker) return false;
  breaker.recordSuccess();
  return true;
};

export const breakerSnapshot = (action: string) => {
  return breakers.get(action)?.snapshot() ?? null;
};

export const listBreakerActions = (): ReadonlyArray<string> => Array.from(breakers.keys());
