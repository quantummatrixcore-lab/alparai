import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import {
  createMockDeHostClient,
  createTestModerator,
  createTestAdmin,
} from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireModerator: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/dehost/admin";
import { requireModerator } from "@/lib/auth/session";
import { updateGrantStatus, markGrantSubmitted } from "@/actions/admin/grants";

let mockAdminClient: ReturnType<typeof createMockDeHostClient>;
let mockModerator: ReturnType<typeof createTestModerator>;
let mockAdmin: ReturnType<typeof createTestAdmin>;

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminClient = createMockDeHostClient();
  mockModerator = createTestModerator();
  mockAdmin = createTestAdmin();
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(requireModerator).mockResolvedValue(mockModerator as never);

  const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
  mockAdminClient.from.mockImplementation((table: string) => {
    if (table === "grant_applications") {
      return { update: vi.fn().mockReturnValue({ eq: mockUpdateEq }) } as never;
    }
    if (table === "audit_log") {
      return { insert: vi.fn().mockResolvedValue({ error: null }) } as never;
    }
    return {} as never;
  });
});

describe("Admin Grants - updateGrantStatus", () => {
  it("approves grant successfully if admin", async () => {
    vi.mocked(requireModerator).mockResolvedValueOnce(mockAdmin as never);
    const result = await updateGrantStatus({
      id: "123e4567-e89b-12d3-a456-426614174000",
      status: "approved",
      phase: 2,
    });
    expect(result.success).toBe(true);
  });

  it("fails to approve grant if only moderator", async () => {
    vi.mocked(requireModerator).mockResolvedValueOnce(mockModerator as never);
    const result = await updateGrantStatus({
      id: "123e4567-e89b-12d3-a456-426614174000",
      status: "approved",
      phase: 2,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Forbidden");
  });
});

describe("Admin Grants - markGrantSubmitted", () => {
  it("marks grant as submitted successfully", async () => {
    const result = await markGrantSubmitted("123e4567-e89b-12d3-a456-426614174000");
    expect(result.success).toBe(true);
  });

  it("fails if unauthorized", async () => {
    vi.mocked(requireModerator).mockResolvedValueOnce(null as never);
    const result = await markGrantSubmitted("123e4567-e89b-12d3-a456-426614174000");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });
});
