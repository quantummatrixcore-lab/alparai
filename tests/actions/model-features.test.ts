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
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ ok: true }),
    RATE_LIMIT_KEYS: {
      model_feature_request: "ratelimit:model_feature_request",
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
    submitModelFeatureRequestPolicy: "submitModelFeatureRequestPolicy",
    attemptsOf: () => 1,
    durationOf: () => 10,
  }));
});

import { createServerClient } from "@/lib/dehost/server";
import { createAdminClient } from "@/lib/dehost/admin";
import { getCurrentUser } from "@/lib/auth/session";
import {
  submitModelFeatureRequest,
  voteModelFeatureRequest,
} from "@/actions/models/model-features";

let mockDeHost: ReturnType<typeof createMockDeHostClient>;
let mockAdminClient: ReturnType<typeof createMockDeHostClient>;
let mockUser: ReturnType<typeof createTestUser>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHost = createMockDeHostClient();
  mockAdminClient = createMockDeHostClient();
  mockUser = createTestUser();
  vi.mocked(createServerClient).mockResolvedValue(mockDeHost as never);
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);
});

function buildFeatureForm(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("modelId", "8db2a543-c0d1-4df2-a393-27a93cf84521");
  fd.set("isAnonymous", "false");
  fd.set("title", "Native JSON Mode Execution");
  fd.set(
    "description",
    "We need a reliable structured JSON output mode natively implemented on the model endpoint.",
  );
  fd.set("category", "feature");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitModelFeatureRequest", () => {
  beforeEach(() => {
    mockDeHost.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "feat-123" }, error: null }),
        }),
      }),
    } as never);
  });

  it("submits request successfully with valid parameters", async () => {
    const result = await submitModelFeatureRequest({ ok: false }, buildFeatureForm());
    expect(result.ok).toBe(true);
    expect(mockDeHost.from).toHaveBeenCalledWith("model_feature_requests");
  });

  it("fails when user is not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
    const result = await submitModelFeatureRequest({ ok: false }, buildFeatureForm());
    expect(result.ok).toBe(false);
    expect(result.error).toContain("sign_in");
  });

  it("fails when validation schema check fails (e.g. title too short)", async () => {
    const fd = buildFeatureForm({ title: "Short" });
    const result = await submitModelFeatureRequest({ ok: false }, fd);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toBeDefined();
  });
});

describe("voteModelFeatureRequest", () => {
  it("inserts vote if not voted yet", async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqInner = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockEqOuter = vi.fn().mockReturnValue({ eq: mockEqInner });

    mockAdminClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: mockEqOuter }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as never);

    const result = await voteModelFeatureRequest("feat-123");
    expect(result.ok).toBe(true);
    expect(result.toggled).toBe("added");
    expect(mockAdminClient.from).toHaveBeenCalledWith("model_feature_votes");
  });

  it("removes vote if already voted", async () => {
    const mockMaybeSingle = vi
      .fn()
      .mockResolvedValue({ data: { request_id: "feat-123" }, error: null });
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

    const result = await voteModelFeatureRequest("feat-123");
    expect(result.ok).toBe(true);
    expect(result.toggled).toBe("removed");
  });
});
