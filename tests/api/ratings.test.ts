import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: mockFrom,
  }),
}));

import { GET } from "@/app/api/v1/ratings/[modelSlug]/route";

describe("Ratings API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 if model is not found", async () => {
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }));

    const req = new Request("http://localhost/api/v1/ratings/invalid-model");
    const res = await GET(req, { params: Promise.resolve({ modelSlug: "invalid-model" }) });
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.error).toBe("Model not found");
  });

  it("should return 200 and model scores if model is found", async () => {
    mockFrom
      .mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockResolvedValue({
          data: [{ id: "model-123", name: "Claude 3.5 Sonnet", status: "active" }],
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              score: 92,
              wilson_lower: 89,
              wilson_upper: 95,
              sample_size: 120,
              last_audited_at: "2026-07-10T12:00:00Z",
              k_categories: {
                id: "K5",
                name: "Ethics & Safety",
                description: "Test Category Description",
              },
            },
          ],
          error: null,
        }),
      }));

    const req = new Request("http://localhost/api/v1/ratings/claude-3-5");
    const res = await GET(req, { params: Promise.resolve({ modelSlug: "claude-3-5" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.model_id).toBe("model-123");
    expect(json.model_name).toBe("Claude 3.5 Sonnet");
    expect(json.composite_score).toBe(92);
    expect(json.ratings[0].category_id).toBe("K5");
    expect(json.ratings[0].score).toBe(92);
  });
});
