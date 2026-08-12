import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";

const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({
    data: [
      {
        id: "inc-1",
        title_masked: "Test Incident",
        description_masked: "Test Description",
        category: "privacy",
        severity: "high",
        location_country: "US",
        incident_date: "2026-07-10",
        created_at: "2026-07-10T12:00:00Z",
        ai_provider_id: "prov-1",
      },
    ],
    error: null,
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    from: mockFrom,
  }),
}));

import { GET } from "@/app/api/v1/oecd/feed/route";

describe("OECD AI Feed Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return formatted incidents matching OECD taxonomy classification", async () => {
    // Modify mock to return providers on second call
    mockFrom
      .mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            {
              id: "inc-1",
              title_masked: "Test Incident",
              description_masked: "Test Description",
              category: "privacy",
              severity: "high",
              location_country: "US",
              incident_date: "2026-07-10",
              created_at: "2026-07-10T12:00:00Z",
              ai_provider_id: "prov-1",
            },
          ],
          error: null,
        }),
      }))
      .mockImplementationOnce(() => ({
        select: vi.fn().mockResolvedValue({
          data: [{ id: "prov-1", name: "OpenAI", slug: "openai" }],
          error: null,
        }),
      }));

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.feed_format).toBe("ALPAR-OECD-v1");
    expect(json.count).toBe(1);
    expect(json.incidents[0].oecd_classification).toBeDefined();
    expect(json.incidents[0].oecd_classification.people_planet).toBe(
      "Impact on Security & Privacy",
    );
    expect(json.incidents[0].oecd_classification.business_model).toBe(
      "OpenAI - General Application",
    );
  });
});
