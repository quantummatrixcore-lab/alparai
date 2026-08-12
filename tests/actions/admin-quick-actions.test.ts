import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireAdmin: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import {
  approveIncident,
  rejectIncident,
  toggleFeatureFlag,
  resolveAlarm,
  getPendingIncidents,
} from "@/actions/admin-quick-actions";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  vi.mocked(createAdminClient).mockReturnValue(mockSupabaseClient as never);
  vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
});

describe("Admin Quick Actions", () => {
  describe("approveIncident", () => {
    it("approves and publishes an incident", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      const result = await approveIncident("inc-1");
      expect(result.ok).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("incidents");
    });

    it("returns error when update fails", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: { message: "DB error" } });

      const result = await approveIncident("inc-1");
      expect(result.ok).toBe(false);
    });
  });

  describe("rejectIncident", () => {
    it("rejects an incident", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      const result = await rejectIncident("inc-1");
      expect(result.ok).toBe(true);
    });

    it("returns error when update fails", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: { message: "DB error" } });

      const result = await rejectIncident("inc-1");
      expect(result.ok).toBe(false);
    });
  });

  describe("toggleFeatureFlag", () => {
    it("toggles a feature flag", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      const result = await toggleFeatureFlag("test-flag", true);
      expect(result.ok).toBe(true);
    });

    it("returns error when update fails", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: { message: "DB error" } });

      const result = await toggleFeatureFlag("test-flag", false);
      expect(result.ok).toBe(false);
    });
  });

  describe("resolveAlarm", () => {
    it("resolves an SLA alarm", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      const result = await resolveAlarm("alarm-1");
      expect(result.ok).toBe(true);
    });
  });

  describe("getPendingIncidents", () => {
    it("returns pending incidents", async () => {
      const mockData = [{ id: "inc-1", title: "Test", status: "pending_review" }];
      const mockLimit = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      mockSupabaseClient._mocks.mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({ order: mockOrder }),
      });

      const result = await getPendingIncidents();
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("inc-1");
    });
  });
});
