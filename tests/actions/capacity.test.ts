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
import { getLiveCapacityMetrics } from "@/actions/capacity";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  vi.mocked(createAdminClient).mockReturnValue(mockSupabaseClient as never);
  vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
});

describe("Capacity Actions", () => {
  describe("getLiveCapacityMetrics", () => {
    it("gathers capacity metrics successfully", async () => {
      // Mock db rpcs
      mockSupabaseClient.rpc.mockImplementation((name) => {
        if (name === "get_database_size") {
          return { data: 52428800, error: null } as never;
        }
        if (name === "get_storage_size") {
          return { data: 10485760, error: null } as never;
        }
        if (name === "get_ai_gateway_costs") {
          return { data: 1.5, error: null } as never;
        }
        return { data: null, error: null } as never;
      });

      // Mock table queries
      const mockResult = { count: 42, error: null };
      const mockGte = vi.fn().mockResolvedValue(mockResult);
      const mockSelect = vi.fn().mockImplementation(() => {
        const promise = Promise.resolve(mockResult) as never;
        (promise as { gte: typeof mockGte }).gte = mockGte;
        return promise;
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      } as never);

      const metrics = await getLiveCapacityMetrics();

      expect(metrics.supabaseDb.usedBytes).toBe(52428800);
      expect(metrics.supabaseDb.percentage).toBe(10);
      expect(metrics.supabaseStorage.usedBytes).toBe(10485760);
      expect(metrics.rowCounts.incidents).toBe(42);
      expect(metrics.resendEmails.used).toBe(42);
      expect(metrics.aiGateway.dailyUsed).toBe(1.5);
    });
  });
});
