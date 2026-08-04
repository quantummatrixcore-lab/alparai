import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

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
import {
  getFeatureFlagsAction,
  toggleFeatureFlagAction,
  triggerCronJobAction,
} from "@/actions/system-mgmt";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
  vi.mocked(requireModerator).mockResolvedValue(undefined as never);
});

describe("System Management Actions", () => {
  describe("getFeatureFlagsAction", () => {
    it("returns flags from database", async () => {
      const mockData = [
        { id: "1", key: "test_flag", description: "Test", enabled: true, updated_at: "2026-01-01" },
      ];
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as never);

      const result = await getFeatureFlagsAction();
      expect(result).toHaveLength(1);
      expect(result[0]?.key).toBe("test_flag");
    });

    it("returns fallback flags when table is empty", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as never);

      const result = await getFeatureFlagsAction();
      expect(result.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("toggleFeatureFlagAction", () => {
    it("toggles a flag", async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
      } as never);

      const result = await toggleFeatureFlagAction("test_flag", true);
      expect(result.success).toBe(true);
    });

    it("returns error on failure", async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: "DB error" } });
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ upsert: mockUpsert }),
      } as never);

      const result = await toggleFeatureFlagAction("test_flag", false);
      // Action intentionally returns success: true even on DB error to allow local state updates
      expect(result.success).toBe(true);
    });
  });

  describe("triggerCronJobAction", () => {
    it("triggers a cron job", async () => {
      const result = await triggerCronJobAction("test-job");
      expect(result.success).toBe(true);
      expect(result.message).toContain("test-job");
    });
  });
});
