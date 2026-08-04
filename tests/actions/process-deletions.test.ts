/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { NextRequest } from "next/server";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { GET } from "@/app/api/cron/process-deletions/route";

let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminClient = createMockSupabaseClient();
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as any);
});

describe("Process Deletions Cron", () => {
  it("unauthorized when cron headers and secrets are missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/process-deletions");
    // Ensure we are in "production" for auth checks or mock config
    vi.stubEnv("NODE_ENV", "production");

    const res = await GET(req);
    expect(res.status).toBe(401);

    vi.unstubAllEnvs();
  });

  it("successfully soft-deletes and anonymizes pending users", async () => {
    const mockUsers = [{ id: "user-gdpr-1" }];

    // Custom builder to support .lte and nested chains
    const mockLte = vi.fn().mockResolvedValue({ data: mockUsers, error: null });
    const mockEq = vi.fn().mockReturnValue({ lte: mockLte });

    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    // Mock hard deletion candidates query to return empty
    const mockHardLte = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockHardEq = vi.fn().mockReturnValue({ lte: mockHardLte });

    let selectCallCount = 0;
    mockAdminClient.from.mockImplementation((table) => {
      if (table === "users") {
        return {
          select: () => {
            selectCallCount++;
            if (selectCallCount === 1) {
              return { eq: mockEq }; // Soft delete candidate query
            } else {
              return { eq: mockHardEq }; // Hard delete candidate query
            }
          },
          update: mockUpdate,
        } as any;
      }
      if (table === "email_preferences") {
        return {
          update: mockUpdate,
        } as any;
      }
      if (table === "redaction_requests") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        } as any;
      }
      return {} as any;
    });

    const req = new NextRequest("http://localhost:3000/api/cron/process-deletions", {
      headers: { "x-vercel-cron": "1" },
    });

    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.softDeleted.count).toBe(1);
    expect(body.softDeleted.ids).toContain("user-gdpr-1");
    expect(body.hardDeleted.count).toBe(0);

    // Verify user details updated for anonymization
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        is_soft_deleted: true,
        email: "deleted-user-gdpr-1@alparai.local",
        full_name: "Anonim Kullanıcı",
        avatar_url: null,
        reputation_score: 0,
      }),
    );
  });
});
