/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import "./helpers/setup";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/i18n/routing", () => ({
  routing: {},
}));

vi.mock("next-intl/middleware", () => ({
  default: () => (global as any).__mockIntlMiddleware,
}));

const mockUpdateSession = vi.fn().mockImplementation((_req, res) => res);
vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: (req: any, res: any) => mockUpdateSession(req, res),
}));

let proxy: any;

describe("proxy middleware", () => {
  beforeAll(async () => {
    // Initialize global mocks before dynamically importing proxy module
    (global as any).__mockIntlResponse = new NextResponse(null, { headers: { "x-intl": "true" } });
    (global as any).__mockIntlMiddleware = vi
      .fn()
      .mockImplementation(() => (global as any).__mockIntlResponse);

    const mod = await import("@/middleware");
    proxy = mod.middleware;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).__mockIntlResponse = new NextResponse(null, { headers: { "x-intl": "true" } });
    (global as any).__mockIntlMiddleware.mockReturnValue((global as any).__mockIntlResponse);
  });

  it("adds request ID and pathname headers, runs intl middleware and updateSession", async () => {
    const request = new NextRequest("http://localhost:3000/en/incidents", {
      headers: { "x-test-header": "test-value" },
    });

    const response = await proxy(request);

    // Verify intlMiddleware is called with request containing headers
    expect((global as any).__mockIntlMiddleware).toHaveBeenCalled();
    const passedReq = (global as any).__mockIntlMiddleware.mock.calls[0][0] as NextRequest;
    expect(passedReq.headers.get("x-request-id")).toBeDefined();
    expect(passedReq.headers.get("x-pathname")).toBe("/en/incidents");

    // Verify updateSession is called
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
