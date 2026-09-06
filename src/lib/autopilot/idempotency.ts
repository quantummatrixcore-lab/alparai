import { createHash } from "node:crypto";
import type { IdempotencyConfig, IdempotencyKey } from "./types";
import { createIdempotencyKey } from "./types";

const canonicalize = (input: unknown): string => {
  if (input === null) return "null";
  if (input === undefined) return "undefined";
  if (typeof input === "string") return JSON.stringify(input);
  if (typeof input === "number" || typeof input === "boolean") return String(input);
  if (typeof input === "bigint") return `${input.toString()}n`;
  if (Array.isArray(input)) {
    return `[${input.map((v) => canonicalize(v)).join(",")}]`;
  }
  if (typeof input === "object") {
    const keys = Object.keys(input as Record<string, unknown>).sort();
    const parts = keys.map(
      (k) => `${JSON.stringify(k)}:${canonicalize((input as Record<string, unknown>)[k])}`,
    );
    return `{${parts.join(",")}}`;
  }
  return JSON.stringify(input);
};

export const computeIdempotencyKey = (
  action: string,
  inputs: ReadonlyArray<unknown>,
  config: IdempotencyConfig,
): IdempotencyKey => {
  if (!config.enabled) {
    return createIdempotencyKey(`noop:${action}:${Date.now()}:${Math.random()}`);
  }
  if (!config.hashInputs) {
    return createIdempotencyKey(`act:${action}`);
  }
  const payload = `${action}|${inputs.map((i) => canonicalize(i)).join("|")}`;
  const hash = createHash("sha256").update(payload).digest("hex");
  return createIdempotencyKey(`sha256:${hash}`);
};

export const parseClientIdempotencyKey = (
  raw: string | null | undefined,
): IdempotencyKey | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.length < 8 || trimmed.length > 256) return null;
  if (!/^[A-Za-z0-9._:-]+$/.test(trimmed)) return null;
  return createIdempotencyKey(`client:${trimmed}`);
};

export const resolveIdempotencyKey = (
  config: IdempotencyConfig,
  action: string,
  inputs: ReadonlyArray<unknown>,
  clientHeader: string | null,
): IdempotencyKey => {
  const client = parseClientIdempotencyKey(clientHeader);
  if (client) return client;
  return computeIdempotencyKey(action, inputs, config);
};

export const redactForLog = (value: unknown, redactionFields: ReadonlyArray<string>): unknown => {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((v) => redactForLog(v, redactionFields));
  }
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (redactionFields.includes(k)) {
        result[k] = "[REDACTED]";
      } else {
        result[k] = redactForLog(v, redactionFields);
      }
    }
    return result;
  }
  if (typeof value === "string") {
    let redacted = value;
    for (const field of redactionFields) {
      const pattern = new RegExp(`(${field})=([^&\\s]+)`, "gi");
      redacted = redacted.replace(pattern, `$1=[REDACTED]`);
    }
    return redacted;
  }
  return value;
};
