import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient, createTestAdmin } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireAdmin: vi.fn(),
    requireModerator: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireModerator } from "@/lib/auth/session";
import { claimBounty, updateBountyStatus } from "@/actions/bounties";

let mockAdmin: ReturnType<typeof createMockSupabaseClient>;
let testAdmin: ReturnType<typeof createTestAdmin>;

beforeEach(() => {
  vi.clearAllMocks();
  mockAdmin = createMockSupabaseClient();
  testAdmin = createTestAdmin();
  vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  vi.mocked(requireAdmin).mockResolvedValue(testAdmin as never);
  vi.mocked(requireModerator).mockResolvedValue(testAdmin as never);
});

describe("claimBounty", () => {
  it("returns forbidden when not admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null as never);
    const result = await claimBounty({
      incidentId: "11111111-1111-4111-8111-111111111111",
      severityScore: 80,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("returns error when incident not found", async () => {
    mockAdmin._mocks.mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await claimBounty({
      incidentId: "11111111-1111-4111-8111-111111111111",
      severityScore: 80,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Incident not found");
  });

  it("returns error on invalid uuid", async () => {
    const result = await claimBounty({
      incidentId: "not-a-uuid",
      severityScore: 80,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid input");
  });

  it("returns bountyId on success", async () => {
    const incident = {
      id: "11111111-1111-4111-8111-111111111111",
      user_id: "user-1",
      ai_provider_id: "provider-1",
      severity: "high",
      status: "published",
    };
    const bounty = { id: "bounty-id-1" };
    mockAdmin._mocks.mockMaybeSingle.mockResolvedValueOnce({ data: incident, error: null });
    mockAdmin._mocks.mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockAdmin._mocks.mockInsertSelectSingle.mockResolvedValue({ data: bounty, error: null });
    const result = await claimBounty({
      incidentId: "11111111-1111-4111-8111-111111111111",
      severityScore: 80,
    });
    expect(result.ok).toBe(true);
    expect(result.bountyId).toBeDefined();
  });
});

describe("updateBountyStatus", () => {
  it("returns forbidden when not moderator", async () => {
    vi.mocked(requireModerator).mockResolvedValue(null as never);
    const result = await updateBountyStatus({
      bountyId: "11111111-1111-4111-8111-111111111111",
      status: "validated",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("returns error on invalid status", async () => {
    const result = await updateBountyStatus({
      bountyId: "11111111-1111-4111-8111-111111111111",
      status: "invalid_status" as never,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid input");
  });
});
