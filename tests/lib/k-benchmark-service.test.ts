import { describe, it, expect, vi, beforeEach } from "vitest";
import { getKBenchmarkScores } from "@/lib/k-benchmark-service";

const mockSelect = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn(() => ({
        select: mockSelect,
      })),
    }),
  ),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  })),
}));

describe("k-benchmark-service Subsystem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fallback benchmark models when Supabase query returns empty", async () => {
    mockSelect.mockResolvedValueOnce({ data: [], error: null });

    const models = await getKBenchmarkScores();
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]?.name).toBe("Claude 3.5 Sonnet");
    expect(models[0]?.complianceLevel).toBe("EU AI Act Compliant");
  });

  it("filters fallback models when modelId parameter is supplied", async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: { message: "Table missing" } });

    const models = await getKBenchmarkScores("gpt-4o");
    expect(models).toHaveLength(1);
    expect(models[0]?.id).toBe("gpt-4o");
    expect(models[0]?.provider).toBe("OpenAI");
  });

  it("maps DB model scores when raw scores exist", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          score: 95.5,
          category_id: "pii_masking",
          model_id: "m-1",
          ai_models: {
            id: "m-1",
            name: "Custom LLM",
            slug: "custom-llm",
            ai_providers: {
              name: "Custom AI",
              slug: "custom-ai",
            },
          },
        },
      ],
      error: null,
    });

    const models = await getKBenchmarkScores();
    expect(models).toHaveLength(1);
    expect(models[0]?.name).toBe("Custom LLM");
    expect(models[0]?.provider).toBe("Custom AI");
    expect(models[0]?.trustScore).toBe(95.5);
  });
});
