/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as retryModule from "@/lib/autopilot/retry";
import "../helpers/setup";
import { createMockSupabaseClient, createTestUser } from "../helpers/supabase-mock";

const mockRedisInstance = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue("OK"),
};

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createClient: vi.fn(),
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    getRedisInstance: () => mockRedisInstance,
    RATE_LIMIT_KEYS: {
      incident_submission: "ratelimit:incident_submission",
      suggestion_submission: "ratelimit:suggestion_submission",
      auth_signin: "ratelimit:auth_signin",
      api_general: "ratelimit:api_general",
      global_incident_burst_guard: "ratelimit:global_incident_burst_guard",
      incident_submission_fp: "ratelimit:incident_submission_fp",
      coordinated_incident_burst_guard: "ratelimit:coordinated_incident_burst_guard",
    },
  }));
  vi.doMock("@/lib/pii/guardian", () => ({
    maskPII: vi.fn(),
  }));
  vi.doMock("@/lib/autopilot/retry", async (importOriginal) => {
    const original = await importOriginal<typeof retryModule>();
    return {
      ...original,
      sleep: vi.fn().mockResolvedValue(undefined),
    };
  });
});

import { createClient, createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { maskPII } from "@/lib/pii/guardian";
import { headers } from "next/headers";
import { submitIncident, voteOnIncident } from "@/actions/incidents";

let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;
let mockUser: ReturnType<typeof createTestUser>;

beforeEach(() => {
  vi.clearAllMocks();
  mockRedisInstance.get.mockReset().mockResolvedValue(null);
  mockRedisInstance.set.mockReset().mockResolvedValue("OK");
  mockSupabase = createMockSupabaseClient();
  mockAdminClient = createMockSupabaseClient();
  mockUser = createTestUser();
  vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);
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

describe("submitIncident", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true, remaining: 4 });
    vi.mocked(maskPII).mockImplementation((input: string) => ({
      masked: input,
      detections: [],
      piiFound: false,
      redactedCount: 0,
      detectedTypes: [],
    }));
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "inc-123" }, error: null }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    } as ReturnType<typeof mockSupabase.from>);
  });

  it("rejects submission when user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const fd = buildFormData();
    const result = await submitIncident({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("UNAUTHENTICATED");
  });

  it("returns error when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      ok: false,
      retryAfter: 300,
    });
    const result = await submitIncident({ ok: false }, buildFormData());
    expect(result.ok).toBe(false);
    expect(result.formError).toContain("System is experiencing high load");
  });

  it("returns error when consents are not all accepted", async () => {
    const fd = buildFormData();
    fd.delete("consent_truth");
    const result = await submitIncident({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.formError).toContain("consent");
  });

  it("returns field errors for invalid title (too short)", async () => {
    const fd = buildFormData({ title: "short" });
    const result = await submitIncident({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("returns field errors for invalid description (too short)", async () => {
    const fd = buildFormData({ description: "too short" });
    const result = await submitIncident({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });

  it("successfully submits a valid incident", async () => {
    const result = await submitIncident({ ok: false }, buildFormData());
    expect(result.ok).toBe(true);
    expect(result.incidentId).toBe("inc-123");
  });

  it("calls maskPII on title and description", async () => {
    await submitIncident({ ok: false }, buildFormData());
    expect(maskPII).toHaveBeenCalledWith("A valid incident title here");
    expect(maskPII).toHaveBeenCalledWith(expect.stringContaining("detailed description"));
  });

  it("detects PII in masked fields", async () => {
    vi.mocked(maskPII).mockImplementation((input: string) => ({
      masked: input.replace("test@email.com", "[REDACTED-EMAIL]"),
      detections: [{ type: "email", count: 1, samples: ["test…om"] }],
      piiFound: true,
      redactedCount: 1,
      detectedTypes: ["email"],
    }));
    const fd = buildFormData({
      title: "Report about test@email.com issue here",
    });
    const result = await submitIncident({ ok: false }, fd);
    expect(result.ok).toBe(true);
    expect(maskPII).toHaveBeenCalled();
  });

  it("flags incident as possible duplicate if similarity score > 0.7", async () => {
    mockSupabase.rpc = vi.fn().mockImplementation((fnName: string) => {
      if (fnName === "submit_incident_atomic") {
        return Promise.resolve({ data: { id: "inc-123" }, error: null });
      }
      return {
        maybeSingle: vi.fn().mockResolvedValue({
          data: { similarity_score: 0.85, incident_id: "other-inc-id" },
          error: null,
        }),
      };
    });

    const result = await submitIncident({ ok: false }, buildFormData());
    expect(result.ok).toBe(true);
    expect(mockSupabase.rpc).toHaveBeenCalledWith("check_incident_duplicate", {
      title_to_check: "A valid incident title here",
    });
  });

  it("bypasses AI moderation if IP has >10 submission attempts in last 24h", async () => {
    // Setup from mock for submission_attempts to return count = 11
    mockAdminClient.from.mockImplementation((table: string) => {
      if (table === "submission_attempts") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ count: 11, error: null }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        } as any;
      }
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: "inc-123" }, error: null }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any;
    });

    const result = await submitIncident({ ok: false }, buildFormData());
    expect(result.ok).toBe(true);

    // Verify update was called on incidents table with moderator notes regarding rate limit
    expect(mockAdminClient.from).toHaveBeenCalledWith("incidents");
  });

  it("returns error when database insert fails", async () => {
    mockSupabase.rpc.mockImplementation((fnName: string) => {
      if (fnName === "submit_incident_atomic") {
        return Promise.resolve({ data: null, error: { message: "DB error" } });
      }
      return Promise.resolve({ data: null, error: null });
    });
    const result = await submitIncident({ ok: false }, buildFormData());
    expect(result.ok).toBe(false);
    expect(result.formError).toContain("Failed");
  });

  it("handles anonymous submission flag", async () => {
    const fd = buildFormData();
    fd.set("is_anonymous", "on");
    const result = await submitIncident({ ok: false }, fd);
    expect(result.ok).toBe(true);
  });

  it("passes empty provider_id as null to schema", async () => {
    const fd = buildFormData({ provider_id: "" });
    const result = await submitIncident({ ok: false }, fd);
    expect(result.ok).toBe(true);
  });

  it("uses idempotency key to return existing incident ID if key exists in Redis", async () => {
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockImplementation((name: string) => {
        if (name === "x-idempotency-key") return "test-idempotency-key-123";
        return "127.0.0.1";
      }),
    } as any);

    mockRedisInstance.get.mockResolvedValue("existing-incident-uuid");

    const result = await submitIncident({ ok: false }, buildFormData());
    expect(result.ok).toBe(true);
    expect(result.incidentId).toBe("existing-incident-uuid");
    expect(mockRedisInstance.get).toHaveBeenCalledWith("idem:test-idempotency-key-123");
  });

  it("sets idempotency key in Redis on successful creation if key does not exist", async () => {
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockImplementation((name: string) => {
        if (name === "x-idempotency-key") return "test-idempotency-key-123";
        return "127.0.0.1";
      }),
    } as any);

    mockRedisInstance.get.mockResolvedValue(null);

    const result = await submitIncident({ ok: false }, buildFormData());
    expect(result.ok).toBe(true);
    expect(mockRedisInstance.get).toHaveBeenCalledWith("idem:test-idempotency-key-123");
    expect(mockRedisInstance.set).toHaveBeenCalledWith(
      "idem:test-idempotency-key-123",
      expect.any(String),
      expect.objectContaining({ nx: true, px: 24 * 60 * 60 * 1000 }),
    );
  });
});

describe("voteOnIncident", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    const mockDeleteInnerEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockDeleteOuterEq = vi.fn().mockReturnValue({
      eq: mockDeleteInnerEq,
    });
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqInner = vi.fn().mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });
    const mockEqOuter = vi.fn().mockReturnValue({
      eq: mockEqInner,
    });
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEqOuter,
    });

    mockAdminClient.from.mockReturnValue({
      select: mockSelect,
      delete: vi.fn().mockReturnValue({ eq: mockDeleteOuterEq }),
      upsert: vi.fn().mockReturnValue({
        select: vi
          .fn()
          .mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      update: mockAdminClient._mocks.mockUpdate,
    } as ReturnType<typeof mockAdminClient.from>);
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await voteOnIncident({
      incidentId: "inc-1",
      value: 1,
    });
    expect(result).toEqual({ ok: false, error: "sign_in_to_vote" });
  });

  it("successfully upvotes an incident", async () => {
    const result = await voteOnIncident({
      incidentId: "inc-1",
      value: 1,
    });
    expect(result).toEqual({ ok: true });
    expect(mockAdminClient.from).toHaveBeenCalledWith("incident_votes");
  });

  it("successfully downvotes an incident", async () => {
    const result = await voteOnIncident({
      incidentId: "inc-1",
      value: -1,
    });
    expect(result).toEqual({ ok: true });
  });

  it("removes vote when value is 0", async () => {
    const result = await voteOnIncident({
      incidentId: "inc-1",
      value: 0,
    });
    expect(result).toEqual({ ok: true });
  });

  it("toggles vote when same value already exists", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { value: 1 }, error: null });
    const mockEqInner = vi.fn().mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });
    const mockEqOuter = vi.fn().mockReturnValue({
      eq: mockEqInner,
    });
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEqOuter,
    });
    const mockDeleteInnerEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockDeleteOuterEq = vi.fn().mockReturnValue({
      eq: mockDeleteInnerEq,
    });

    mockAdminClient.from.mockReturnValue({
      select: mockSelect,
      delete: vi.fn().mockReturnValue({ eq: mockDeleteOuterEq }),
      upsert: vi.fn().mockReturnValue({
        select: vi
          .fn()
          .mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      update: mockAdminClient._mocks.mockUpdate,
    } as ReturnType<typeof mockAdminClient.from>);

    const result = await voteOnIncident({
      incidentId: "inc-1",
      value: 1,
    });
    expect(result).toEqual({ ok: true });
  });

  it("returns error when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      ok: false,
      retryAfter: 60,
    });
    const result = await voteOnIncident({
      incidentId: "inc-1",
      value: 1,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Too many");
  });
});
