/**
 * Autonomous background execution handler.
 * Next.js 15+ / 16 server-side compatible task runner.
 * Catches asynchronous errors to prevent unhandled promise rejections.
 */
export function waitUntil(promise: Promise<unknown>): void {
  if (promise && typeof promise.then === "function") {
    promise.catch((err) => {
      console.error("[waitUntil:background_error]", err instanceof Error ? err.message : String(err));
    });
  }
}

export function ip(): string {
  return "127.0.0.1";
}
