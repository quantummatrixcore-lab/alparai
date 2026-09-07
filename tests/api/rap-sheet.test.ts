import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "@/app/api/v1/rap-sheet/route";
import { GET as exportGet } from "@/app/api/v1/rap-sheet/export/route";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "127.0.0.1"]]),
}));

const mockAdmin = {
  id: "admin-1",
  role: "moderator",
  isVerified: true
};

vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockImplementation(async () => mockAdmin),
  requireModerator: vi.fn().mockImplementation(async () => mockAdmin),
  requireAdmin: vi.fn().mockImplementation(async () => mockAdmin),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: async () => ({ ok: true, remaining: 50 }),
  RATE_LIMIT_KEYS: { api_general: "api_general" },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "ai_rap_sheet_entries") {
        const queryChain: Record<string, unknown> = {};
        queryChain.eq = function() { return queryChain; };
        queryChain.order = function() {
            return {
              range: async () => ({
                data: [{
                  id: "entry-1",
                  entity_type: "model",
                  entity_name: "MockGPT-3",
                  violation_category: "hallucination_data_leak",
                  severity: "high",
                  penalty_type: "public_censure",
                  is_active: true
                }],
                count: 1,
                error: null
              }),
              limit: async () => ({
                data: [{
                  id: "entry-1",
                  entity_type: "model",
                  entity_name: "MockGPT-3",
                  violation_category: "hallucination_data_leak",
                  severity: "high",
                  penalty_type: "public_censure",
                  listed_at: "2026-08-31T00:00:00Z",
                  offense_summary: "PII leakage observed during autonomous audit"
                }],
                error: null
              })
            };
          };

        return {
          select: () => queryChain,
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: "entry-new", entity_name: "RogueAgent-1", is_active: true },
                error: null
              })
            })
          })
        };
      }
      return {};
    }
  })
}));

describe("AI Rap Sheet (Wall of Shame) API", () => {
  it("GET /api/v1/rap-sheet returns active entries", async () => {
    const req = new Request("http://localhost:3000/api/v1/rap-sheet");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.entries).toHaveLength(1);
    expect(data.entries[0].entity_name).toBe("MockGPT-3");
  });

  it("POST /api/v1/rap-sheet allows moderators to add entries", async () => {
    const req = new Request("http://localhost:3000/api/v1/rap-sheet", {
      method: "POST",
      body: JSON.stringify({
        entity_name: "RogueAgent-1",
        offense_summary: "Unauthorized data exfiltration breach",
        severity: "critical",
        penalty_type: "banned"
      })
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.entry.entity_name).toBe("RogueAgent-1");
  });

  it("GET /api/v1/rap-sheet/export provides JSON and CSV datasets", async () => {
    const jsonReq = new Request("http://localhost:3000/api/v1/rap-sheet/export?format=json");
    const jsonRes = await exportGet(jsonReq);
    expect(jsonRes.status).toBe(200);
    const jsonBody = await jsonRes.json();
    expect(jsonBody.export_version).toBe("2026.1");

    const csvReq = new Request("http://localhost:3000/api/v1/rap-sheet/export?format=csv");
    const csvRes = await exportGet(csvReq);
    expect(csvRes.status).toBe(200);
    expect(csvRes.headers.get("Content-Type")).toContain("text/csv");
  });
});
