import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createTestAdmin } from "../helpers/supabase-mock";
import { createAdminClient } from "@/lib/supabase/admin";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.hoisted(() => {
  vi.doMock("@/lib/auth/session", () => ({
    requireAdmin: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    RATE_LIMIT_KEYS: {
      export_request: "ratelimit:export_request",
    },
  }));
  vi.doMock("@/lib/utils/hash", () => ({
    hashIp: vi.fn().mockReturnValue("hashed-ip"),
  }));
  vi.doMock("@/lib/autopilot", () => ({
    withAutopilot: vi.fn(),
    exportDataPolicy: {},
  }));
  vi.doMock("next/headers", () => ({
    headers: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue("127.0.0.1"),
    }),
  }));
});

import { requireAdmin } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { withAutopilot } from "@/lib/autopilot";
import { exportIncidentsCSV, exportAuditLogCSV } from "@/actions/export";

let testAdmin: ReturnType<typeof createTestAdmin>;
let autopilotCallback:
  | ((
      ctx: never,
      metadata: { adminId: string },
    ) => Promise<{ kind: string; value?: { csv: string; rowCount: number } }>)
  | undefined;
let mockDb: {
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
  testAdmin = createTestAdmin();
  mockDb = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
  vi.mocked(createAdminClient).mockReturnValue(mockDb as never);
  vi.mocked(requireAdmin).mockResolvedValue(testAdmin as never);
  vi.mocked(checkRateLimit).mockResolvedValue({ ok: true, remaining: 4 });
  vi.mocked(withAutopilot).mockImplementation(async (_policy, _key, fn, _options) => {
    autopilotCallback = fn as never;
    return {
      kind: "ok",
      value: { csv: "id,title\n1,Test", rowCount: 1 },
    } as never;
  });
});

describe("exportIncidentsCSV", () => {
  it("returns forbidden when not admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null as never);
    const result = await exportIncidentsCSV();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("returns error when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfter: 60 });
    const result = await exportIncidentsCSV();
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Too many exports");
  });

  it("returns CSV on success", async () => {
    const result = await exportIncidentsCSV();
    expect(result.ok).toBe(true);
    expect(result.csv).toContain("id,title");
  });

  it("returns error when autopilot exhausts", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({ kind: "exhausted" } as never);
    const result = await exportIncidentsCSV();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Export failed");
  });

  it("handles replayed result", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({
      kind: "replayed",
      value: { csv: "", rowCount: 0 },
    } as never);
    const result = await exportIncidentsCSV();
    expect(result.ok).toBe(true);
    expect(result.csv).toBe("");
  });

  it("executes work function successfully", async () => {
    await exportIncidentsCSV();
    vi.mocked(mockDb.limit).mockResolvedValue({
      data: [
        {
          id: "1",
          title_masked: "Test",
          category: "AI",
          severity: "high",
          status: "open",
          created_at: "2026-06-25",
          published_at: null,
        },
      ],
      error: null,
    } as never);
    const workResult = await autopilotCallback!({} as never, { adminId: "admin" });
    expect(workResult.kind).toBe("success");
    if (workResult.kind === "success") {
      expect(workResult.value!.rowCount).toBe(1);
    }
  });

  it("executes work function with error", async () => {
    await exportIncidentsCSV();
    vi.mocked(mockDb.limit).mockResolvedValue({
      data: null,
      error: { message: "db error" },
    } as never);
    const workResult = await autopilotCallback!({} as never, { adminId: "admin" });
    expect(workResult.kind).toBe("retryable");
  });
});

describe("exportAuditLogCSV", () => {
  it("returns forbidden when not admin", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null as never);
    const result = await exportAuditLogCSV();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("returns CSV on success", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({
      kind: "ok",
      value: { csv: "id,actor_id\n1,admin", rowCount: 1 },
    } as never);
    const result = await exportAuditLogCSV();
    expect(result.ok).toBe(true);
  });

  it("returns error when autopilot exhausts", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({ kind: "exhausted" } as never);
    const result = await exportAuditLogCSV();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Export failed");
  });

  it("handles replayed result", async () => {
    vi.mocked(withAutopilot).mockResolvedValue({
      kind: "replayed",
      value: { csv: "", rowCount: 0 },
    } as never);
    const result = await exportAuditLogCSV();
    expect(result.ok).toBe(true);
    expect(result.csv).toBe("");
  });

  it("executes work function successfully", async () => {
    await exportAuditLogCSV();
    vi.mocked(mockDb.limit).mockResolvedValue({
      data: [
        {
          id: "1",
          actor_id: "admin",
          action: "test",
          entity_type: "x",
          entity_id: "1",
          created_at: "2026-06-25",
        },
      ],
      error: null,
    } as never);
    const workResult = await autopilotCallback!({} as never, { adminId: "admin" });
    expect(workResult.kind).toBe("success");
    if (workResult.kind === "success") {
      expect(workResult.value!.rowCount).toBe(1);
    }
  });

  it("executes work function with error", async () => {
    await exportAuditLogCSV();
    vi.mocked(mockDb.limit).mockResolvedValue({
      data: null,
      error: { message: "db error" },
    } as never);
    const workResult = await autopilotCallback!({} as never, { adminId: "admin" });
    expect(workResult.kind).toBe("retryable");
  });
});
