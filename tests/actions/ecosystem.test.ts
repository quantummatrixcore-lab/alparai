import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn().mockResolvedValue(null),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import {
  approveQueueItem,
  rejectQueueItem,
  archiveEcosystemNews,
  updateEcosystemCategory,
  triggerExternalFetch,
} from "@/actions/ecosystem";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
  vi.mocked(createAdminClient).mockReturnValue(mockSupabaseClient as never);
});

describe("Ecosystem Actions", () => {
  describe("approveQueueItem", () => {
    it("approves and moves item to ecosystem_news", async () => {
      mockSupabaseClient._mocks.mockSingle.mockResolvedValue({
        data: {
          id: "q-1",
          title: "Test",
          body: "Body",
          source: "rss",
          external_url: "https://example.com",
        },
        error: null,
      });
      mockSupabaseClient._mocks.mockInsertSelectSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(approveQueueItem("q-1")).resolves.not.toThrow();
    });
  });

  describe("rejectQueueItem", () => {
    it("rejects a queue item", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      await expect(rejectQueueItem("q-1")).resolves.not.toThrow();
    });
  });

  describe("archiveEcosystemNews", () => {
    it("archives ecosystem news", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      await expect(archiveEcosystemNews("news-1")).resolves.not.toThrow();
    });
  });

  describe("updateEcosystemCategory", () => {
    it("updates category", async () => {
      mockSupabaseClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      await expect(updateEcosystemCategory("news-1", "incident")).resolves.not.toThrow();
    });
  });

  describe("triggerExternalFetch", () => {
    it("returns error when CRON_SECRET is not set", async () => {
      const result = await triggerExternalFetch();
      expect(result.success).toBe(false);
    });
  });
});
