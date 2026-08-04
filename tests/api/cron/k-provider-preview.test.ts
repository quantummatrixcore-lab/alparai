/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";
import type { NextRequest } from "next/server";

const mockEq = vi.fn().mockReturnThis();
const mockLte = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();

const queryBuilder = {
  select: mockSelect,
  eq: mockEq,
  lte: mockLte,
  update: mockUpdate,
  then: vi.fn(),
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => queryBuilder,
  }),
}));

const mockSend = vi.fn().mockResolvedValue({ id: "email-id" });
vi.mock("@/lib/email/resend", () => ({
  getResendClient: () => ({
    emails: {
      send: mockSend,
    },
  }),
}));

import { GET } from "@/app/api/cron/k-provider-preview/route";

describe("K-Provider-Preview Cron Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default then implementation to return empty success
    queryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));
  });

  it("should return 401 if unauthorized", async () => {
    const req = new Request("http://localhost/api/cron/k-provider-preview", {
      headers: { authorization: "Bearer invalid-token" },
    });

    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "production";

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(401);

    (process.env as any).NODE_ENV = originalEnv;
  });

  it("should process pending previews and send preview emails", async () => {
    const req = new Request("http://localhost/api/cron/k-provider-preview", {
      headers: { authorization: "Bearer test-secret" },
    });

    const mockPendingData = [
      {
        id: "preview-1",
        preview_token: "token-1",
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        ai_providers: {
          name: "Test AI Corp",
          contact_email: "contact@testai.com",
        },
      },
    ];

    // First call to `then` is for the pending select chain.
    // Second call is for the expired select chain.
    queryBuilder.then
      .mockImplementationOnce((resolve: any) => resolve({ data: mockPendingData, error: null })) // pending select
      .mockImplementationOnce((resolve: any) => resolve({ data: null, error: null })) // pending update
      .mockImplementationOnce((resolve: any) => resolve({ data: [], error: null })); // expired select

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.sent_count).toBe(1);

    // Verify email was sent
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "contact@testai.com",
        subject: expect.stringContaining("K-BENCHMARK Draft Scores Preview Available"),
      }),
    );
  });

  it("should process expired previews and send public announcement emails", async () => {
    const req = new Request("http://localhost/api/cron/k-provider-preview", {
      headers: { authorization: "Bearer test-secret" },
    });

    const mockExpiredData = [
      {
        id: "preview-expired-1",
        ai_providers: {
          name: "Old AI Corp",
          contact_email: "contact@oldai.com",
        },
      },
    ];

    // First call: pending select -> empty
    // Second call: expired select -> mockExpiredData
    // Third call: expired update -> success
    queryBuilder.then
      .mockImplementationOnce((resolve: any) => resolve({ data: [], error: null })) // pending select
      .mockImplementationOnce((resolve: any) => resolve({ data: mockExpiredData, error: null })) // expired select
      .mockImplementationOnce((resolve: any) => resolve({ data: null, error: null })); // expired update

    const res = await GET(req as unknown as NextRequest);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.expired_count).toBe(1);

    // Verify email was sent
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "contact@oldai.com",
        subject: expect.stringContaining("K-BENCHMARK Scores Published"),
      }),
    );
  });
});
