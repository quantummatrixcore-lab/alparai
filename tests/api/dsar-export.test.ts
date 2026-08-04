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

import { GET } from "@/app/api/v1/dsar/export/route";

describe("DSAR Export API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail with 401 if not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("Auth error"),
    });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("should export user data successfully", async () => {
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
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: { id: "dsar-123", due_date: "2026-08-11" }, error: null }),
        };
      }
      if (table === "users") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { full_name: "John Doe" }, error: null }),
        };
      }
      if (table === "incidents") {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [{ id: "inc-123", title_masked: "Test Title" }],
            error: null,
          }),
        };
      }
      // default fallback for comments, votes, expert_applications
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("attachment;");

    const json = await res.json();
    expect(json.user_identity.email).toBe("user@example.com");
    expect(json.incidents).toHaveLength(1);
    expect(json.profile.full_name).toBe("John Doe");
  });
});
