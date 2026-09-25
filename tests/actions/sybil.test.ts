/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockDeHostClient, createTestUser } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/server", () => ({
    createClient: vi.fn(),
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/dehost/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
    requireAdmin: vi.fn().mockResolvedValue({ id: "admin-1", email: "admin@alparai.com" }),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    getRedisInstance: vi.fn().mockReturnValue(null),
    RATE_LIMIT_KEYS: {
      global_incident_burst_guard: "ratelimit:global_incident_burst_guard",
      incident_submission: "ratelimit:incident_submission",
      coordinated_incident_burst_guard: "ratelimit:coordinated_incident_burst_guard",
    },
  }));
  vi.doMock("@/lib/pii/guardian", () => ({
    maskPII: vi.fn(),
  }));
});

import { createClient, createServerClient } from "@/lib/dehost/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { maskPII } from "@/lib/pii/guardian";
import { submitIncident } from "@/actions/incidents";

let mockDeHost: ReturnType<typeof createMockDeHostClient>;
let mockAdminClient: ReturnType<typeof createMockDeHostClient>;
let mockUser: ReturnType<typeof createTestUser>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHost = createMockDeHostClient();
  mockAdminClient = createMockDeHostClient();
  mockUser = createTestUser();
  vi.mocked(createClient).mockResolvedValue(mockDeHost as never);
  vi.mocked(createServerClient).mockResolvedValue(mockDeHost as never);
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);
  vi.mocked(checkRateLimit).mockResolvedValue({ ok: true, remaining: 4 });
  vi.mocked(maskPII).mockImplementation((input: string) => ({
    masked: input,
    detections: [],
    piiFound: false,
    redactedCount: 0,
    detectedTypes: [],
  }));
});

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("title", "A valid incident title here");
  fd.set(
    "description",
    "This is a detailed description of the AI incident that happened recently with enough detail",
  );
  fd.set("category", "hallucination");
  fd.set("severity", "medium");
  fd.set("provider_id", "");
  fd.set("model_id", "");
  fd.set("incident_date", "2026-01-15");
  fd.set("consent_truth", "on");
  fd.set("consent_anonymous", "on");
  fd.set("consent_age", "on");
  fd.set("consent_terms", "on");
  fd.set("consent_coppa", "on");
  fd.set("consent_uk_osa", "on");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitIncident Sybil Detection", () => {
  it("should flag submission as Sybil suspicious when fingerprint count > 3", async () => {
    // 1. Mock dehost.from("incidents").insert(...) to return a valid incident ID
    mockDeHost.from.mockImplementation((table: string): any => {
      if (table === "incidents") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: "inc-1" }, error: null }),
            }),
          }),
          select: mockDeHost._mocks.mockSelect,
          update: mockDeHost._mocks.mockUpdate,
        };
      }
      if (table === "submission_fingerprints") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockResolvedValue({ count: 5 }),
        };
      }
      return {
        select: mockDeHost._mocks.mockSelect,
        insert: mockDeHost._mocks.mockInsert,
        update: mockDeHost._mocks.mockUpdate,
      };
    });

    // 2. Mock rpc check for duplicate incident and atomic submission
    mockDeHost.rpc.mockImplementation((fnName: string) => {
      if (fnName === "submit_incident_atomic") {
        return Promise.resolve({ data: { id: "inc-1" }, error: null });
      }
      return {
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    // 3. Mock admin client to return high fingerprint count and successfully persist run
    mockAdminClient.from.mockImplementation((table: string): any => {
      if (table === "submission_attempts") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockResolvedValue({ count: 1 }),
        };
      }
      if (table === "submission_fingerprints") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockResolvedValue({ count: 5 }), // returns 5 submissions (exceeds limit of 3)
        };
      }
      if (table === "incidents") {
        return {
          select: mockAdminClient._mocks.mockSelect,
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        };
      }
      if (table === "autopilot_runs") {
        return {
          upsert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: "run-123",
              status: "completed",
              attempts: 1,
              result_id: "inc-1",
              idempotency_key: "key-1",
            },
            error: null,
          }),
        };
      }
      return {
        select: mockAdminClient._mocks.mockSelect,
        insert: mockAdminClient._mocks.mockInsert,
        update: mockAdminClient._mocks.mockUpdate,
        delete: mockAdminClient._mocks.mockDelete,
        upsert: mockAdminClient._mocks.mockUpsert,
      };
    });

    const fd = buildFormData({ fingerprint: "test-fingerprint-123" });
    const res = await submitIncident({ ok: false }, fd);

    expect(res.ok).toBe(true);
    expect(mockDeHost.from).toHaveBeenCalledWith("submission_fingerprints");
    expect(mockAdminClient.from).toHaveBeenCalledWith("incidents");
  });
});
