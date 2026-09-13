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
  vi.doMock("@/lib/dehost/server", () => ({
    createServerClient: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/dehost/admin";
import { createServerClient } from "@/lib/dehost/server";
import { getProviderWithSla, getProvidersLeaderboard } from "@/actions/providers";

let mockDeHostClient: ReturnType<typeof createMockDeHostClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHostClient = createMockDeHostClient();
});

describe("Provider Actions", () => {
  describe("getProviderWithSla", () => {
    it("returns provider with incident count", async () => {
      mockDeHostClient._mocks.mockMaybeSingle.mockResolvedValue({
        data: {
          id: "p-1",
          slug: "openai",
          name: "OpenAI",
          logo_url: null,
          website_url: null,
          is_verified: true,
        },
        error: null,
      });
      vi.mocked(createServerClient).mockResolvedValue(mockDeHostClient as never);

      const result = await getProviderWithSla("openai");
      expect(result).not.toBeNull();
      expect(result?.slug).toBe("openai");
    });

    it("returns null when provider not found", async () => {
      mockDeHostClient._mocks.mockMaybeSingle.mockResolvedValue({ data: null, error: null });
      vi.mocked(createServerClient).mockResolvedValue(mockDeHostClient as never);

      const result = await getProviderWithSla("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("getProvidersLeaderboard", () => {
    it("returns sorted leaderboard", async () => {
      const mockProviders = [
        {
          id: "p-1",
          slug: "openai",
          name: "OpenAI",
          logo_url: null,
          website_url: null,
          is_verified: true,
          sla_uptime_pct: 99.9,
        },
        {
          id: "p-2",
          slug: "google",
          name: "Google",
          logo_url: null,
          website_url: null,
          is_verified: true,
          sla_uptime_pct: 99.5,
        },
      ];
      const mockOrder = vi.fn().mockResolvedValue({ data: mockProviders, error: null });
      const mockEq2 = vi.fn().mockResolvedValue({ count: 10 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      mockDeHostClient._mocks.mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq1 });
      vi.mocked(createAdminClient).mockReturnValue(mockDeHostClient as never);

      const result = await getProvidersLeaderboard();
      expect(result.length).toBeGreaterThan(0);
    });

    it("returns empty array on error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } });
      mockDeHostClient._mocks.mockSelect.mockReturnValue({ order: mockOrder, eq: vi.fn() });
      vi.mocked(createAdminClient).mockReturnValue(mockDeHostClient as never);

      const result = await getProvidersLeaderboard();
      expect(result).toEqual([]);
    });
  });
});
