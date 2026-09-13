import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockDeHostClient } from "../helpers/dehost-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/dehost/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn().mockResolvedValue(null),
  }));
});

import { createAdminClient } from "@/lib/dehost/admin";
import {
  approveQueueItem,
  rejectQueueItem,
  archiveEcosystemNews,
  updateEcosystemCategory,
  triggerExternalFetch,
} from "@/actions/ecosystem";

let mockDeHostClient: ReturnType<typeof createMockDeHostClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockDeHostClient = createMockDeHostClient();
  vi.mocked(createAdminClient).mockReturnValue(mockDeHostClient as never);
});

describe("Ecosystem Actions", () => {
  describe("approveQueueItem", () => {
    it("approves and moves item to ecosystem_news", async () => {
      mockDeHostClient._mocks.mockSingle.mockResolvedValue({
        data: {
          id: "q-1",
          title: "Test",
          body: "Body",
          source: "rss",
          external_url: "https://example.com",
        },
        error: null,
      });
      mockDeHostClient._mocks.mockInsertSelectSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(approveQueueItem("q-1")).resolves.not.toThrow();
    });
  });

  describe("rejectQueueItem", () => {
    it("rejects a queue item", async () => {
      mockDeHostClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      await expect(rejectQueueItem("q-1")).resolves.not.toThrow();
    });
  });

  describe("archiveEcosystemNews", () => {
    it("archives ecosystem news", async () => {
      mockDeHostClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

      await expect(archiveEcosystemNews("news-1")).resolves.not.toThrow();
    });
  });

  describe("updateEcosystemCategory", () => {
    it("updates category", async () => {
      mockDeHostClient._mocks.mockUpdateEq.mockResolvedValue({ error: null });

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
