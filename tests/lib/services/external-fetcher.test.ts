import { describe, it, expect, vi, beforeEach } from "vitest";
import { runExternalFetchTask } from "@/lib/services/external-fetcher";
import { verifyExternalItem, publishVerifiedItem } from "@/lib/ai/external-verifier";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((_table: string) => ({
      insert: vi.fn().mockImplementation((_data: Record<string, unknown>) => {
        return Promise.resolve({ data: { id: "test-id" }, error: null });
      }),
      upsert: vi.fn().mockImplementation((_data: Record<string, unknown>) => {
        return Promise.resolve({ data: { id: "test-queue-id" }, error: null });
      }),
    })),
  })),
}));

vi.mock("@/lib/connectors/reddit", () => ({
  fetchRedditPosts: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/connectors/hackernews", () => ({
  fetchHNStories: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/connectors/github", () => ({
  fetchGitHubIncidents: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/connectors/rss", () => ({
  fetchRSSFeed: vi.fn().mockResolvedValue([
    {
      title: "Trusted AI Incident News",
      body: "A serious AI hallucination caused financial loss.",
      external_url: "https://www.technologyreview.com/2026/07/29/ai-incident",
      source_score: 90,
    },
  ]),
}));

vi.mock("@/lib/ai/external-verifier", () => ({
  verifyExternalItem: vi.fn().mockResolvedValue({
    approved: false,
    plausibilityScore: 20,
    adversarialRisk: 80,
    severity: "low",
    category: "other",
    reasoning: "Unapproved mock",
  }),
  publishVerifiedItem: vi.fn().mockResolvedValue({
    success: true,
    incidentId: "inc-123",
  }),
}));

describe("runExternalFetchTask Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes trusted domain RSS feeds directly without AI verification call", async () => {
    const result = await runExternalFetchTask();

    expect(result).toBeDefined();
    expect(result.total_fetched).toBeGreaterThan(0);
    // Bypasses verifyExternalItem for trusted domains
    expect(verifyExternalItem).not.toHaveBeenCalled();
    // But STILL publishes to public incidents table via publishVerifiedItem
    expect(publishVerifiedItem).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Trusted AI Incident News",
        externalUrl: "https://www.technologyreview.com/2026/07/29/ai-incident",
        source: "rss",
      }),
    );
    expect(result.ai_verified_published).toBeGreaterThan(0);
  });
});
