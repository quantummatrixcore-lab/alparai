import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/incidents/export/route";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// Mock dependencies
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  RATE_LIMIT_KEYS: {
    api_enterprise: "api_enterprise",
  },
}));

vi.mock("server-only", () => ({}));

interface MockSupabaseClient {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
}

describe("GET /api/v1/incidents/export", () => {
  const mockHeaders = new Map<string, string>();
  let mockSupabase: MockSupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.clear();
    process.env.PUBLIC_API_KEY = "test_valid_key";

    vi.mocked(headers).mockResolvedValue(
      mockHeaders as unknown as Awaited<ReturnType<typeof headers>>,
    );

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    vi.mocked(createAdminClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof createAdminClient>,
    );

    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true, retryAfter: 0 } as unknown as Awaited<
      ReturnType<typeof checkRateLimit>
    >);
  });

  const createRequest = (url = "http://localhost/api/v1/incidents/export") => {
    return new Request(url);
  };

  it("should return 429 when rate limit is exceeded", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfter: 60 } as unknown as Awaited<
      ReturnType<typeof checkRateLimit>
    >);
    mockHeaders.set("x-forwarded-for", "192.168.1.1");

    const response = await GET(createRequest());
    expect(response.status).toBe(429);

    const data = await response.json();
    expect(data.error).toBe("rate_limited");
    expect(data.retryAfter).toBe(60);
  });

  it("should return 401 when no auth is provided", async () => {
    const response = await GET(createRequest());
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 for invalid api key", async () => {
    mockHeaders.set("x-api-key", "invalid_key");
    const response = await GET(createRequest());
    expect(response.status).toBe(401);
  });

  it("should allow access with valid api key", async () => {
    mockHeaders.set("x-api-key", "test_valid_key");
    const response = await GET(createRequest());
    expect(response.status).toBe(200);
  });

  it("should allow access with valid bearer token", async () => {
    mockHeaders.set("authorization", "Bearer valid_token");
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "1" } }, error: null });

    const response = await GET(createRequest());
    expect(response.status).toBe(200);
  });

  it("should return 401 with invalid bearer token", async () => {
    mockHeaders.set("authorization", "Bearer invalid_token");
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Invalid token"),
    });

    const response = await GET(createRequest());
    expect(response.status).toBe(401);
  });
});
