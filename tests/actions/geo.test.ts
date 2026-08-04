import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

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
import { addGeoCitationAction, getGeoStatsAction } from "@/actions/geo";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
});

describe("GEO Actions", () => {
  describe("addGeoCitationAction", () => {
    it("adds a citation successfully", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ insert: mockInsert }),
      } as never);

      const result = await addGeoCitationAction({
        ai_engine: "gptbot",
        query: "test query",
        cited_url: "https://example.com",
      });
      expect(result.success).toBe(true);
    });

    it("returns error on failure", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: "DB error" } });
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ insert: mockInsert }),
      } as never);

      const result = await addGeoCitationAction({
        ai_engine: "gptbot",
        query: "test query",
        cited_url: "https://example.com",
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getGeoStatsAction", () => {
    it("returns geo stats", async () => {
      const mockData = [
        { id: "1", ai_engine: "gptbot", query: "test", cited_url: "https://example.com" },
      ];
      const mockLimit = vi.fn().mockResolvedValue({ data: mockData });
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      } as never);

      const result = await getGeoStatsAction();
      expect(result.success).toBe(true);
      expect(result.citations).toHaveLength(1);
    });

    it("returns fallback on error", async () => {
      vi.mocked(createAdminClient).mockReturnValue({
        from: vi.fn().mockImplementation(() => {
          throw new Error("DB error");
        }),
      } as never);

      const result = await getGeoStatsAction();
      expect(result.success).toBe(false);
    });
  });
});
