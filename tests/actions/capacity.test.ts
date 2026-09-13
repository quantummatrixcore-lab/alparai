import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockDeHostClient } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireAdmin: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/dehost/admin";
import { requireAdmin } from "@/lib/auth/session";
import { getLiveCapacityMetrics } from "@/actions/capacity";

let mockDeHostClient: ReturnType<typeof createMockDeHostClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHostClient = createMockDeHostClient();
  vi.mocked(createAdminClient).mockReturnValue(mockDeHostClient as never);
  vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
});

describe("Capacity Actions", () => {
  describe("getLiveCapacityMetrics", () => {
    it("gathers capacity metrics successfully", async () => {
      // Mock db rpcs
      mockDeHostClient.rpc.mockImplementation((name) => {
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

      mockDeHostClient.from.mockReturnValue({
        select: mockSelect,
      } as never);

      const metrics = await getLiveCapacityMetrics();

      expect(metrics.dehostDb.usedBytes).toBe(52428800);
      expect(metrics.dehostDb.percentage).toBeCloseTo(0.61, 2);
      expect(metrics.dehostStorage.usedBytes).toBe(10485760);
      expect(metrics.rowCounts.incidents).toBe(42);
      expect(metrics.resendEmails.used).toBe(42);
      expect(metrics.aiGateway.dailyUsed).toBe(1.5);
    });
  });
});
