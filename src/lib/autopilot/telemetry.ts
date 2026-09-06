import "server-only";
import type { AutopilotResult, AutopilotTelemetryPayload } from "./types";
import { redactForLog } from "./idempotency";
import { SAFE_REDACTION_FIELDS } from "./types";

type SentryCaptureLike = (message: string, extra: Record<string, unknown>) => void;
type PlausibleEventLike = (event: string, props: Record<string, string | number | boolean>) => void;

interface TelemetryDeps {
  sentry?: SentryCaptureLike | null;
  plausible?: PlausibleEventLike | null;
  redactionFields?: ReadonlyArray<string>;
}

let _sentry: SentryCaptureLike | null = null;
let _plausible: PlausibleEventLike | null = null;

export const configureTelemetry = (deps: TelemetryDeps): void => {
  _sentry = deps.sentry ?? null;
  _plausible = deps.plausible ?? null;
};

const getRedactionFields = (override?: ReadonlyArray<string>): ReadonlyArray<string> =>
  override && override.length > 0 ? override : SAFE_REDACTION_FIELDS;

const toErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return "unknown";
};

export const emitTelemetry = <T>(
  payload: AutopilotTelemetryPayload,
  result: AutopilotResult<T>,
  error: unknown,
  redactionFields?: ReadonlyArray<string>,
): void => {
  const fields = getRedactionFields(redactionFields);
  const errorMessage = error ? toErrorMessage(error) : null;
  const safeError = errorMessage ? String(redactForLog(errorMessage, fields)) : null;
  const safeMetadata = redactForLog(payload, fields);

  if (
    result.kind === "exhausted" ||
    result.kind === "budget_exceeded" ||
    result.kind === "circuit_open"
  ) {
    if (_sentry) {
      _sentry("autopilot.exhausted", {
        action: payload.action,
        kind: result.kind,
        attempts: payload.attempts,
        durationMs: payload.durationMs,
        error: safeError,
        metadata: safeMetadata,
      });
    }
  }

  if (_plausible) {
    _plausible("autopilot_run", {
      action: payload.action,
      result: result.kind,
      attempts: payload.attempts,
      durationMs: payload.durationMs,
    });
  }
};

export const makeTelemetryPayload = (input: {
  action: string;
  result: AutopilotResult<unknown>;
  attempts: number;
  durationMs: number;
  userId: string | null;
  ipHash: string | null;
  error: unknown;
}): AutopilotTelemetryPayload => {
  return {
    action: input.action,
    result: input.result.kind,
    attempts: input.attempts,
    durationMs: input.durationMs,
    idempotencyKey: input.result.idempotencyKey,
    userId: input.userId,
    ipHash: input.ipHash,
    error: input.error ? toErrorMessage(input.error) : null,
  };
};

export const safeCaptureException = (err: unknown, context: Record<string, unknown>): void => {
  if (!_sentry) return;
  try {
    const message = err instanceof Error ? err.message : toErrorMessage(err);
    _sentry(message, { ...context, source: "autopilot" });
  } catch (e) {
    console.error("Ignored error:", e);
  }
};
