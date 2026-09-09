import { describe, it, expect, vi, beforeEach } from "vitest";
import { run360ExpertAudit } from "@/actions/admin/archive/admin-360-evaluation";
import { createServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: vi.fn().mockResolvedValue({ id: "admin" })
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

describe("run360ExpertAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ok: false if user is not authorized", async () => {
    const { requireAdmin } = await import("@/lib/auth/session");
    vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("Unauthorized"));

    const result = await run360ExpertAudit();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Failed to run 360 AI Audit");
  });

  it("should return metrics and pass verdict when data is valid", async () => {
    vi.mocked(createServerClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "ai_providers") {
          return { select: vi.fn().mockResolvedValue({ count: 10 }) };
        }
        if (table === "ai_free_models") {
          return { select: vi.fn().mockResolvedValue({ count: 5 }) };
        }
        if (table === "incidents") {
          return { select: vi.fn().mockResolvedValue({ count: 50 }) };
        }
        return { select: vi.fn().mockResolvedValue({ count: 0 }) };
      }),
    } as never);
    
    const { createAdminClient } = await import("@/lib/supabase/admin");
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "ai_providers") {
          return { select: vi.fn().mockResolvedValue({ count: 10 }) };
        }
        if (table === "ai_free_models") {
          return { select: vi.fn().mockResolvedValue({ count: 5 }) };
        }
        if (table === "incidents") {
          return { select: vi.fn().mockResolvedValue({ count: 50 }) };
        }
        return { select: vi.fn().mockResolvedValue({ count: 0 }) };
      }),
    } as never);

    const result = await run360ExpertAudit();
    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.integrityScore).toBe(95);
    expect(result.data?.consensusScore).toBe(95);
    expect(result.data?.verdict).toBe("PASS");
  });

  it("should handle unexpected errors gracefully", async () => {
    vi.mocked(createServerClient).mockRejectedValue(new Error("Supabase error"));
    const result = await run360ExpertAudit();
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Failed to run 360 AI Audit");
  });
});
