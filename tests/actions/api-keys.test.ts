import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: "user-1", role: "admin" }),
  requireModerator: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("ADMIN-6: Inbound Client & Auditor API Key Generation", () => {
  it("should generate a raw API key starting with alp_live_ and save SHA-256 hash to database", async () => {
    const { generateInboundClientKey } = await import("@/actions/api-keys");
    const res = await generateInboundClientKey("SEC Regulator", "auditor");

    expect(res.ok).toBe(true);
    expect(res.rawKey).toBeDefined();
    expect(res.rawKey?.startsWith("alp_live_")).toBe(true);
    expect(res.provider).toBe("client_sec_regulator");
  });

  it("should reject client key generation for empty client name", async () => {
    const { generateInboundClientKey } = await import("@/actions/api-keys");
    const res = await generateInboundClientKey("", "auditor");

    expect(res.ok).toBe(false);
    expect(res.error).toBe("Client name is required.");
  });
});
