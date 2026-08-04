import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient, createTestUser } from "../helpers/supabase-mock";

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
    checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
    RATE_LIMIT_KEYS: {
      model_review: "ratelimit:model_review",
    },
  }));
  vi.doMock("@/lib/autopilot", () => ({
    withAutopilot: vi.fn().mockImplementation(async (_policy, _keys, workFn) => {
      const outcome = await workFn({});
      if (outcome.kind === "success") {
        return { kind: "ok", value: outcome.value };
      }
      return { kind: "failed", error: outcome.error };
    }),
    submitModelReviewPolicy: "submitModelReviewPolicy",
    attemptsOf: () => 1,
    durationOf: () => 10,
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { submitModelReview, voteModelReview } from "@/actions/model-reviews";

let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;
let mockUser: ReturnType<typeof createTestUser>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase = createMockSupabaseClient();
  mockAdminClient = createMockSupabaseClient();
  mockUser = createTestUser();
  vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);
});

function buildReviewForm(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("modelId", "8db2a543-c0d1-4df2-a393-27a93cf84521");
  fd.set("isAnonymous", "false");
  fd.set("scoreOverall", "5");
  fd.set("scoreAccuracy", "4");
  fd.set("scoreSafety", "5");
  fd.set("scoreCreativity", "4");
  fd.set("scoreSpeed", "5");
  fd.set("scoreValue", "4");
  fd.set("title", "Excellent Model Performance");
  fd.set("body", "This model has been highly accurate and extremely safe during our audits.");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitModelReview", () => {
  beforeEach(() => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "rev-123" }, error: null }),
        }),
      }),
    } as never);
  });

  it("submits review successfully with valid parameters", async () => {
    const result = await submitModelReview({ ok: false }, buildReviewForm());
    expect(result.ok).toBe(true);
    expect(mockSupabase.from).toHaveBeenCalledWith("model_reviews");
  });

  it("fails when user is not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await submitModelReview({ ok: false }, buildReviewForm());
    expect(result.ok).toBe(false);
    expect(result.error).toContain("sign_in");
  });

  it("fails when validation schema check fails (e.g. scoreOverall invalid)", async () => {
    const fd = buildReviewForm({ scoreOverall: "10" });
    const result = await submitModelReview({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });
});

describe("voteModelReview", () => {
  it("inserts vote if not voted yet", async () => {
    // mock select to return null (no vote exists)
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqInner = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockEqOuter = vi.fn().mockReturnValue({ eq: mockEqInner });

    mockAdminClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: mockEqOuter }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as never);

    const result = await voteModelReview("rev-123");
    expect(result.ok).toBe(true);
    expect(result.toggled).toBe("added");
    expect(mockAdminClient.from).toHaveBeenCalledWith("model_review_votes");
  });

  it("removes vote if already voted", async () => {
    // mock select to return existing vote record
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: { review_id: "rev-123" }, error: null });
    const mockEqInner = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockEqOuter = vi.fn().mockReturnValue({ eq: mockEqInner });

    const mockDeleteEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockDelete = vi
      .fn()
      .mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: mockDeleteEq }) });

    mockAdminClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: mockEqOuter }),
      delete: mockDelete,
    } as never);

    const result = await voteModelReview("rev-123");
    expect(result.ok).toBe(true);
    expect(result.toggled).toBe("removed");
  });
});
