/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import "./helpers/setup";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/i18n/routing", () => ({
  routing: {},
}));

vi.mock("next-intl/middleware", () => ({
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: () => (global as any).__mockIntlMiddleware,
}));

const mockUpdateSession = vi.fn().mockImplementation((_req, res) => res);
vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: (req: any, res: any) => mockUpdateSession(req, res),
}));

vi.mock("@/lib/geo/bot-tracker", () => ({
  trackBotHit: vi.fn().mockResolvedValue(undefined),
}));

let proxy: any;

describe("proxy middleware", () => {
  beforeAll(async () => {
    // Initialize global mocks before dynamically importing proxy module
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__mockIntlResponse = new NextResponse(null, { headers: { "x-intl": "true" } });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__mockIntlMiddleware = vi
      .fn()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(() => (global as any).__mockIntlResponse);

    const mod = await import("@/middleware");
    proxy = mod.middleware;
  });

  beforeEach(() => {
    vi.clearAllMocks();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__mockIntlResponse = new NextResponse(null, { headers: { "x-intl": "true" } });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__mockIntlMiddleware.mockReturnValue((global as any).__mockIntlResponse);
  });

  it("adds request ID and pathname headers, runs intl middleware and updateSession", async () => {
    const request = new NextRequest("http://localhost:3000/en/incidents", {
      headers: { "x-test-header": "test-value" },
    });

    const response = await proxy(request);

    // Verify intlMiddleware is called with request containing headers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((global as any).__mockIntlMiddleware).toHaveBeenCalled();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passedReq = (global as any).__mockIntlMiddleware.mock.calls[0][0] as NextRequest;
    expect(passedReq.headers.get("x-request-id")).toBeDefined();
    expect(passedReq.headers.get("x-pathname")).toBe("/en/incidents");

    // Verify updateSession is called
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mockUpdateSession).toHaveBeenCalledWith(passedReq, (global as any).__mockIntlResponse);

    // Verify response headers contain request-id
    expect(response.headers.get("x-request-id")).toBe(passedReq.headers.get("x-request-id"));
  });

  it("preserves existing x-request-id header if present", async () => {
    const request = new NextRequest("http://localhost:3000/tr", {
      headers: { "x-request-id": "custom-uuid-123" },
    });

    const response = await proxy(request);
    expect(response.headers.get("x-request-id")).toBe("custom-uuid-123");
  });
});
