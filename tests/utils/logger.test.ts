import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/lib/utils/logger";

import * as Sentry from "@sentry/nextjs";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("logger", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("logs info messages", () => {
    logger.info("test message", { foo: "bar" });
    expect(infoSpy).toHaveBeenCalled();
  });

  it("logs warnings", () => {
    logger.warn("warning message");
    expect(warnSpy).toHaveBeenCalled();
  });

  it("logs errors with stack", () => {
    const err = new Error("boom");
    logger.error("something failed", { ctx: 1 }, err);
    expect(errorSpy).toHaveBeenCalled();
    const firstCall = errorSpy.mock.calls[0];
    expect(firstCall).toBeDefined();
    if (firstCall) {
      expect(String(firstCall[0])).toContain("something failed");
    }
  });

  it("includes context in log line", () => {
    logger.info("ctx test", { user: "alice", id: 42 });
    const firstCall = infoSpy.mock.calls[0];
    expect(firstCall).toBeDefined();
    if (firstCall) {
      expect(String(firstCall[0])).toContain("user");
    }
  });

  it("handles missing context gracefully", () => {
    logger.info("no ctx");
    expect(infoSpy).toHaveBeenCalled();
  });

  it("does not send warning messages to Sentry", () => {
    logger.warn("some warning");
    expect(warnSpy).toHaveBeenCalled();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it("sends error messages to Sentry", () => {
    logger.error("some error");
    expect(errorSpy).toHaveBeenCalled();
    expect(Sentry.captureMessage).toHaveBeenCalledWith("some error", {
      level: "error",
      extra: undefined,
    });
  });

  it("logs critical messages and reports to Sentry as fatal", () => {
    logger.critical("some critical");
    expect(errorSpy).toHaveBeenCalled();
    expect(Sentry.captureMessage).toHaveBeenCalledWith("some critical", {
      level: "fatal",
      extra: undefined,
    });
  });

  it("sends exceptions to Sentry on error with exception object", () => {
    const err = new Error("exception error");
    logger.error("some error text", { foo: "bar" }, err);
    expect(errorSpy).toHaveBeenCalled();
    expect(Sentry.captureException).toHaveBeenCalledWith(err, {
      extra: { foo: "bar" },
    });
  });
});
