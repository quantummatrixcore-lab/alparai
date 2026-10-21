import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({
  requireAdmin: async () => ({ user: { id: "admin-1" } }),
}));
vi.mock("@/lib/dehost/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        count: 57,
        not: () => ({ count: 12, eq: () => ({ count: 8 }) }),
        eq: () => ({ count: 20 }),
      }),
    }),
  }),
}));

import { GET } from "@/app/api/admin/provider-coverage/route";

describe("admin provider coverage", () => {
  it("reports email coverage math honestly", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      data: {
        total_providers: number;
        with_contact_email: number;
        email_and_verified: number;
        coverage_pct: number;
        notifiable_pct: number;
      };
    };
    expect(json.data.total_providers).toBe(57);
    expect(json.data.with_contact_email).toBe(12);
    expect(json.data.coverage_pct).toBe(21);
    expect(json.data.notifiable_pct).toBe(14);
  });
});
