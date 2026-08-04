import type { BackoffStrategy, RetryConfig } from "./types";

export const computeBackoffMs = (
  attempt: number,
  config: RetryConfig,
  random: () => number = Math.random,
): number => {
  const safeAttempt = Math.max(1, attempt);
  const base = (() => {
    switch (config.strategy) {
      case "exponential": {
        const exp = config.baseMs * 2 ** (safeAttempt - 1);
        return Math.min(exp, config.maxMs);
      }
      case "linear": {
        const lin = config.baseMs * safeAttempt;
        return Math.min(lin, config.maxMs);
      }
      case "fixed": {
        return Math.min(config.baseMs, config.maxMs);
      }
    }
  })();
  if (!config.jitter) {
    return Math.max(0, Math.floor(base));
  }
  const ratio = Math.min(0.99, Math.max(0, config.jitterRatio));
  const jitterRange = base * ratio;
  const offset = (random() * 2 - 1) * jitterRange;
  return Math.max(0, Math.floor(base + offset));
};

export const isRetryableError = (error: unknown): boolean => {
  if (error === null || error === undefined) return false;
  if (typeof error === "object" && "retryable" in error) {
    const flag = (error as { retryable: unknown }).retryable;
    return flag === true;
  }
  if (error instanceof Error) {
    const name = error.name.toLowerCase();
    if (name === "aborterror" || name === "aborterror") return false;
    if (name.includes("timeout") || name.includes("network") || name.includes("fetch")) {
      return true;
    }
    const msg = error.message.toLowerCase();
    if (
      msg.includes("timeout") ||
      msg.includes("etimedout") ||
      msg.includes("econnreset") ||
      msg.includes("econnrefused") ||
      msg.includes("429") ||
      msg.includes("503") ||
      msg.includes("502") ||
      msg.includes("500")
    ) {
      return true;
    }
  }
  if (typeof error === "string") {
    const lower = error.toLowerCase();
    return (
      lower.includes("timeout") ||
      lower.includes("econnreset") ||
      lower.includes("429") ||
      lower.includes("500") ||
      lower.includes("502") ||
      lower.includes("503")
    );
  }
  return false;
};

export const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });

export const strategyLabel = (strategy: BackoffStrategy): string => strategy;
