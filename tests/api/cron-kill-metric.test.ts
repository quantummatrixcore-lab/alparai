/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createClient: vi.fn(),
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/utils/cron-logger", () => ({
    withCronLogger: (_name: string, fn: Function) => fn,
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { GET } from "@/app/api/cron/kill-metric/route";

describe("GET /api/cron/kill-metric", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);
    process.env.CRON_SECRET = "test-cron-secret";
  });

  it("returns 401 Unauthorized if auth header is missing or incorrect", async () => {
    const req = new Request("http://localhost/api/cron/kill-metric", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns N/A launch metrics when NEXT_PUBLIC_APP_LAUNCHED is not true", async () => {
    delete process.env.NEXT_PUBLIC_APP_LAUNCHED;
    const req = new Request("http://localhost/api/cron/kill-metric", {
      headers: { authorization: "Bearer test-cron-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      ok: true,
      launched: false,
      users: "N/A — not launched",
      incidents: "N/A — not launched",
      article73_pending_72h: "N/A — not launched",
    });
  });

  it("returns metric counts when app is launched", async () => {
    process.env.NEXT_PUBLIC_APP_LAUNCHED = "true";

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 2, error: null }),
          count: 5,
          error: null,
          then: (cb: any) => cb({ count: 5, error: null }),
        }),
      }),
    } as any);

    const req = new Request("http://localhost/api/cron/kill-metric", {
      headers: { authorization: "Bearer test-cron-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.launched).toBe(true);
  });
});
