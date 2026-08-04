import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockMaybeSingle = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          gt: () => ({
            limit: () => ({
              maybeSingle: mockMaybeSingle,
            }),
          }),
        }),
      }),
    }),
  }),
}));

import { preTriageCheck } from "@/actions/incidents";

describe("preTriageCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it("passes for valid title and detailed description", async () => {
    const title = "An eligible AI Act incident title here";
    const description =
      "This is a detailed description of an AI system exhibiting bias and hallucinations when deployed in production, causing severe operational disruptions.";
    const result = await preTriageCheck(title, description);
    expect(result.ok).toBe(true);
  });

  it("rejects description with fewer than 15 words", async () => {
    const title = "An eligible AI Act incident title";
    const description = "Too short description.";
    const result = await preTriageCheck(title, description);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("fewer than 15 words");
  });

  it("rejects title with fewer than 10 characters", async () => {
    const title = "Short";
    const description =
      "This is a detailed description of an AI system exhibiting bias and hallucinations when deployed in production, causing severe operational disruptions.";
    const result = await preTriageCheck(title, description);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Title is too short");
  });

  it("rejects description with keyboard mashes", async () => {
    const title = "An eligible AI Act incident title";
    const description =
      "This is a detailed description containing keyboard mash like asdfasdf or qwertyqwerty when deployed in production, causing severe operational disruptions.";
    const result = await preTriageCheck(title, description);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("keyboard mash");
  });

  it("rejects description with excessively long words", async () => {
    const title = "An eligible AI Act incident title";
    const description =
      "This is a detailed description containing an excessivelylongwordthatdoesnotexistinanydictionaryatallandislongerthaneightycharactersforheuristicfilteringtesting to check if our triage filter works properly and intercepts spam.";
    const result = await preTriageCheck(title, description);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("excessively long word");
  });

  it("rejects description with repetitive characters", async () => {
    const title = "An eligible AI Act incident title";
    const description =
      "h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h h";
    const result = await preTriageCheck(title, description);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Repetitive character frequency");
  });

  it("rejects duplicates when DB check returns match", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: "existing-id" }, error: null });
    const title = "An eligible AI Act incident title here";
    const description =
      "This is a detailed description of an AI system exhibiting bias and hallucinations when deployed in production, causing severe operational disruptions.";
    const result = await preTriageCheck(title, description);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("Duplicate check triggered");
  });

  it("filters synthetic spam batch without reaching LLM moderation (Rule #32 cost win)", async () => {
    const spamBatch = [
      { title: "Short", description: "Too short description." },
      {
        title: "Valid Incident Title",
        description:
          "asdfasdf qwertyqwerty asdfasdf qwertyqwerty asdfasdf qwertyqwerty asdfasdf qwertyqwerty",
      },
      {
        title: "Another Valid Title",
        description:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    ];

    let rejectedCount = 0;
    for (const item of spamBatch) {
      const res = await preTriageCheck(item.title, item.description);
      if (!res.ok) rejectedCount++;
    }

    expect(rejectedCount).toBe(spamBatch.length);
  });
});
