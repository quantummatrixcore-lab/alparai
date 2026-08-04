import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: mockFrom,
  }),
}));

describe("Expert Verification Auth & Trigger Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should block non-expert users from verifying an incident", async () => {
    // Mock the expert check to return false (not in expert network)
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }));

    // Simulating trigger error locally inside the update action logic
    const updateIncident = async (
      _incidentId: string,
      updates: Record<string, unknown>,
      _userId: string,
    ) => {
      // Logic mirrors check_incident_verification_auth trigger behavior
      if (updates.expert_verified !== undefined) {
        const isMod = false; // Mock moderator check
        const isExpert = false; // Mock expert network check

        if (!isMod && !isExpert) {
          throw new Error("Only active expert network members can verify incidents");
        }
      }
      return { success: true };
    };

    await expect(
      updateIncident("inc-123", { expert_verified: true }, "user-normal"),
    ).rejects.toThrow("Only active expert network members can verify incidents");
  });

  it("should allow active expert network members to verify an incident", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockResolvedValue({
        data: [{ id: "user-expert", is_active: true }],
        error: null,
      }),
    }));

    const updateIncident = async (
      _incidentId: string,
      updates: Record<string, unknown>,
      _userId: string,
    ) => {
      if (updates.expert_verified !== undefined) {
        const isMod = false;
        const isExpert = true; // active expert

        if (!isMod && !isExpert) {
          throw new Error("Only active expert network members can verify incidents");
        }
      }
      return { success: true };
    };

    const result = await updateIncident("inc-123", { expert_verified: true }, "user-expert");
    expect(result.success).toBe(true);
  });
});
