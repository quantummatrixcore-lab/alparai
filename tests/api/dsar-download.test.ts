import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/../tests/helpers/setup"; // import mock setup

const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

const mockFrom = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

import { GET } from "@/app/api/v1/dsar/download/route";

describe("DSAR Download API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail with 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("Auth error"),
    });

    const res = await GET(new Request("http://localhost/api/v1/dsar/download"));
    expect(res.status).toBe(401);
  });

  it("should download user data in JSON format", async () => {
    const mockUser = {
      id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
      email: "user@example.com",
      created_at: "2026-07-12T12:00:00Z",
    };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    mockFrom.mockImplementation((table) => {
      if (table === "dsar_requests") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { full_name: "John Doe" }, error: null }),
        };
      }
      // other tables
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const res = await GET(new Request("http://localhost/api/v1/dsar/download"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("attachment;");
    expect(res.headers.get("Content-Type")).toContain("application/json");

    const json = await res.json();
    expect(json.user_id).toBe("37c6cf08-9d39-4798-b75b-f0602d4cefe1");
    expect(json.email).toBe("user@example.com");
    expect(json.profile.full_name).toBe("John Doe");
  });

  it("should download user data in CSV format", async () => {
    const mockUser = {
      id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
      email: "user@example.com",
      created_at: "2026-07-12T12:00:00Z",
    };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    mockFrom.mockImplementation((table) => {
      if (table === "dsar_requests") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { full_name: "John Doe" }, error: null }),
        };
      }
      // other tables
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const res = await GET(new Request("http://localhost/api/v1/dsar/download?format=csv"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("attachment;");
    expect(res.headers.get("Content-Type")).toContain("text/csv");

    const text = await res.text();
    expect(text).toContain("Identity");
    expect(text).toContain("John Doe");
  });
});
