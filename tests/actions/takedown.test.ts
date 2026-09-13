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
  }));
  vi.doMock("@/lib/constants", () => ({
    APP_TAKEDOWN_EMAIL: "takedown@alparai.com",
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
    RATE_LIMIT_KEYS: {
      takedown_submission: "ratelimit:takedown_submission",
    },
  }));
});

import { createClient, createServerClient } from "@/lib/dehost/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { submitTakedownRequest, submitTakedown } from "@/actions/legal/takedown";

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
  vi.mocked(getCurrentUser).mockResolvedValue(null);
});

describe("submitTakedownRequest", () => {
  beforeEach(() => {
    mockAdminClient.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "td-1" }, error: null }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
        }),
      }),
    } as ReturnType<typeof mockAdminClient.from>);
  });

  it("submits a valid takedown request", async () => {
    const result = await submitTakedownRequest({
      target_url: "https://alparai.com/incidents/123",
      reason: "Copyright infringement on this content",
      details:
        "The content posted contains copyrighted material that belongs to our organization without permission.",
      requester_name: "Legal Team",
      requester_email: "legal@company.com",
      identity_proof_url: "https://proof.example.com/doc",
    });
    expect(result.ok).toBe(true);
    expect(result.message).toBe("Request received");
  });

  it("returns error for invalid form data", async () => {
    const result = await submitTakedownRequest({
      target_url: "not-a-url",
      reason: "x",
      details: "too short",
      requester_name: "A",
      requester_email: "bad",
      identity_proof_url: "not-url",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Invalid");
  });

  it("returns error when database insert fails", async () => {
    mockAdminClient.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      }),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
        }),
      }),
    } as ReturnType<typeof mockAdminClient.from>);
    const result = await submitTakedownRequest({
      target_url: "https://alparai.com/incidents/123",
      reason: "Copyright infringement on this content",
      details:
        "The content posted contains copyrighted material that belongs to our organization without permission.",
      requester_name: "Legal Team",
      requester_email: "legal@company.com",
      identity_proof_url: "https://proof.example.com/doc",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Failed");
  });
});

describe("submitTakedown", () => {
  beforeEach(() => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    mockAdminClient.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "td-2" }, error: null }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "test" }, error: null }),
        }),
      }),
    } as ReturnType<typeof mockAdminClient.from>);
  });

  it("submits inline takedown without auth", async () => {
    const result = await submitTakedown({
      incidentId: "inc-1",
      reason: "Defamatory content in report",
      details: "This incident report contains false and defamatory statements about our company.",
      contactEmail: "contact@company.com",
    });
    expect(result.ok).toBe(true);
    expect(result.message).toBe("Submitted");
  });

  it("submits inline takedown with authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);
    const result = await submitTakedown({
      incidentId: "inc-1",
      reason: "Defamatory content in report",
      details: "This incident report contains false and defamatory statements about our company.",
      contactEmail: "contact@company.com",
    });
    expect(result.ok).toBe(true);
  });
});
