/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

const withAutopilotMock = vi.fn().mockImplementation(async (_policy, _keys, fn, _options) => {
  const outcome = await fn({} as any);
  if (outcome.kind === "success") {
    return { kind: "ok", value: outcome.value };
  }
  return { kind: "failed" };
});

vi.mock("@/lib/autopilot", () => ({
  withAutopilot: (policy: any, keys: any, fn: any, options: any) =>
    withAutopilotMock(policy, keys, fn, options),
  syncNewsPolicy: {},
}));

const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockReturnThis();
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
      maybeSingle: mockMaybeSingle,
      insert: mockInsert,
    }),
  }),
}));

import { syncNewsAction, checkAndTriggerNewsSyncPassive } from "@/actions/autopilot-sync";

describe("autopilot-sync news action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-gemini-key";
    withAutopilotMock.mockImplementation(async (_policy, _keys, fn, _options) => {
      const outcome = await fn({} as any);
      if (outcome.kind === "success") {
        return { kind: "ok", value: outcome.value };
      }
      return { kind: "failed" };
    });

    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ error: null });
    mockSelect.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      order: mockOrder,
      limit: mockLimit,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      order: mockOrder,
      limit: mockLimit,
    });
    mockOrder.mockReturnValue({
      limit: mockLimit,
      maybeSingle: mockMaybeSingle,
    });
    mockLimit.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    });

    // Mock fetch to simulate RSS feed xml responses and Gemini API json responses
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes("generativelanguage.googleapis.com")) {
        return {
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        category: "news",
                        severity: "medium",
                        title_en: "Translated Title",
                        title_tr: "Çevrilmiş Başlık",
                        summary_en: "English summary",
                        summary_tr: "Türkçe özet",
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        };
      }

      // Default feed mock response
      return {
        ok: true,
        text: async () => `
          <rss version="2.0">
            <channel>
              <item>
                <title>Test News Article</title>
                <link>${url}/item-1</link>
                <description>Some description of the test article.</description>
                <pubDate>Wed, 24 Jun 2026 12:00:00 GMT</pubDate>
              </item>
            </channel>
          </rss>
        `,
      };
    });
  });

  describe("syncNewsAction", () => {
    it("successfully runs news sync work, fetches feeds, queries Gemini, and saves to database", async () => {
      const res = await syncNewsAction();
      expect(res.ok).toBe(true);
      expect(res.added).toBeGreaterThan(0);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title_en: "Translated Title",
          title_tr: "Çevrilmiş Başlık",
          summary_en: "English summary",
          summary_tr: "Türkçe özet",
          category: "news",
          severity: "medium",
        }),
      );
    });

    it("skips news items that already exist in database", async () => {
      mockMaybeSingle.mockResolvedValue({ data: { id: "existing-1" }, error: null });
      const res = await syncNewsAction();
      expect(res.ok).toBe(true);
      expect(res.added).toBe(0);
    });

    it("returns replayed status when withAutopilot returns replayed", async () => {
      withAutopilotMock.mockResolvedValue({ kind: "replayed", value: { processed: 0, added: 0 } });
      const res = await syncNewsAction();
      expect(res.ok).toBe(true);
      expect(res.added).toBe(0);
    });

    it("returns fail status when withAutopilot fails", async () => {
      withAutopilotMock.mockResolvedValue({ kind: "failed" });
      const res = await syncNewsAction();
      expect(res.ok).toBe(false);
    });
  });

  describe("checkAndTriggerNewsSyncPassive", () => {
    it("triggers sync news if last run was more than 6 hours ago", async () => {
      // Setup last run to be 10 hours ago
      const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString();
      mockMaybeSingle.mockResolvedValue({ data: { created_at: tenHoursAgo }, error: null });

      await checkAndTriggerNewsSyncPassive();

      // Verify that syncNewsAction was triggered (which calls withAutopilot)
      expect(withAutopilotMock).toHaveBeenCalled();
    });

    it("does not trigger sync news if last run was less than 6 hours ago", async () => {
      // Setup last run to be 2 hours ago
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      mockMaybeSingle.mockResolvedValue({ data: { created_at: twoHoursAgo }, error: null });

      await checkAndTriggerNewsSyncPassive();

      // Verify withAutopilot is not called (except possibly from other tests)
      expect(withAutopilotMock).not.toHaveBeenCalled();
    });
  });
});
