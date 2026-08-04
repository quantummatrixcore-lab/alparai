import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../../helpers/setup";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: vi.fn().mockImplementation(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "inc-1" }, error: null }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })),
  }),
}));

vi.mock("@/lib/connectors/reddit", () => ({
  fetchRedditPosts: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/connectors/hackernews", () => ({
  fetchHNStories: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/connectors/rss", () => ({
  fetchRSSFeed: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/connectors/github", () => ({
  fetchGitHubIncidents: vi.fn().mockResolvedValue([]),
}));

import { GET } from "@/app/api/cron/fetch-external/route";

describe("C1 — Cron Auth check in fetch-external", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  it("should return 401 if authorization header is missing", async () => {
    process.env.CRON_SECRET = "supersecret";
    const req = new Request("http://localhost/api/cron/fetch-external");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.text();
    expect(body).toBe("Unauthorized");
  });

  it("should return 401 if authorization header is incorrect", async () => {
    process.env.CRON_SECRET = "supersecret";
    const req = new Request("http://localhost/api/cron/fetch-external", {
      headers: { authorization: "Bearer wrongsecret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return 200 and run successfully if authorization header is correct", async () => {
    process.env.CRON_SECRET = "supersecret";
    const req = new Request("http://localhost/api/cron/fetch-external", {
      headers: { authorization: "Bearer supersecret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});
