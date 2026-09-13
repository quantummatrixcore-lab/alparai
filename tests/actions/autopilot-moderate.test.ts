import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin" })
}));
import { createMockDeHostClient } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/autopilot", () => ({
    withAutopilot: vi.fn(),
    autoModerateIncidentPolicy: { config: {} },
    type: {},
    createIdempotencyKey: vi.fn((k: string) => k),
  }));
  vi.doMock("@/lib/ai/api-keys", () => ({
    resolveApiKey: vi.fn(),
  }));
  vi.doMock("@/lib/email/resend", () => ({
    getResendClient: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/dehost/admin";
import { withAutopilot, createIdempotencyKey } from "@/lib/autopilot";
import { autoModerateIncidentAction } from "@/actions/autopilot-moderate";

const mockKey = createIdempotencyKey("test-key");

let mockDeHostClient: ReturnType<typeof createMockDeHostClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHostClient = createMockDeHostClient();
});

describe("autoModerateIncidentAction", () => {
  it("returns success when autopilot succeeds", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({
      kind: "ok",
      value: { score: 92, status: "published" },
      attempts: 1,
      durationMs: 100,
      idempotencyKey: mockKey,
    } as never);

    const result = await autoModerateIncidentAction("inc-1");
    expect(result.ok).toBe(true);
    expect(result.score).toBe(92);
    expect(result.status).toBe("published");
  });

  it("returns failure when autopilot exhausts", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({
      kind: "exhausted",
      error: "All attempts exhausted",
      attempts: 3,
      durationMs: 500,
      idempotencyKey: mockKey,
    } as never);
    vi.mocked(createAdminClient).mockReturnValue(mockDeHostClient as never);

    const result = await autoModerateIncidentAction("inc-1");
    expect(result.ok).toBe(false);
  });

  it("returns failure when autopilot returns exhausted with error", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({
      kind: "exhausted",
      error: "Retry later",
      attempts: 3,
      durationMs: 500,
      idempotencyKey: mockKey,
    } as never);
    vi.mocked(createAdminClient).mockReturnValue(mockDeHostClient as never);

    const result = await autoModerateIncidentAction("inc-1");
    expect(result.ok).toBe(false);
  });

  it("handles database write failure gracefully", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({
      kind: "exhausted",
      error: "All attempts exhausted",
      attempts: 3,
      durationMs: 500,
      idempotencyKey: mockKey,
    } as never);
    vi.mocked(createAdminClient).mockImplementation(() => {
      throw new Error("DB down");
    });

    const result = await autoModerateIncidentAction("inc-1");
    expect(result.ok).toBe(false);
  });
});
