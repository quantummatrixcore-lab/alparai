import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/../tests/helpers/setup";

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

import { GET } from "@/app/api/v1/dsar/portable/route";

describe("DSAR Portable API Endpoint (GDPR Art. 20)", () => {
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

  it("should return a ZIP file with all user data", async () => {
    const mockUser = {
      id: "37c6cf08-9d39-4798-b75b-f0602d4cefe1",
      email: "user@example.com",
      created_at: "2026-07-12T12:00:00Z",
    };

    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      const mocks: Record<string, unknown> = {
        users: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { full_name: "John Doe" }, error: null }),
        },
        incidents: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [{ id: "inc-1", title_masked: "Test Incident" }],
            error: null,
          }),
        },
        incident_comments: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
        incident_votes: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
        expert_applications: {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        },
      };

      return (mocks[table] || {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }) as (typeof mocks)[typeof table];
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/zip");
    expect(res.headers.get("Content-Disposition")).toContain("alpar-ai-portable-37c6cf08");
  });
});
