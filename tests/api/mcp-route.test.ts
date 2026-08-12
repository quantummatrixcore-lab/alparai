import { describe, it, expect, vi } from "vitest";
import { GET, POST } from "@/app/api/mcp/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/session", () => ({
  requireAdmin: vi.fn().mockResolvedValue({
    id: "admin-1",
    email: "admin@test.com",
    role: "admin",
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (_table: string) => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () =>
              Promise.resolve({
                data: [{ id: "test-1", title_masked: "Test Incident", category: "security" }],
                error: null,
              }),
          }),
          maybeSingle: () =>
            Promise.resolve({
              data: {
                id: "test-1",
                title_masked: "Test Incident",
                description_masked: "Description",
                category: "security",
                severity: "high",
                status: "published",
                created_at: "2026-07-23T00:00:00Z",
                ai_providers: { name: "OpenAI", slug: "openai" },
                ai_models: { name: "GPT-4o" },
              },
              error: null,
            }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: { id: "new-1", status: "pending_review", created_at: "2026-07-23T00:00:00Z" },
              error: null,
            }),
        }),
      }),
    }),
  }),
}));

describe("ALPAR MCP Server API Endpoint (/api/mcp)", () => {
  it("returns server info on GET request", async () => {
    const res = await GET();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe("online");
    expect(json.server.name).toBe("alpar-ai-mcp");
    expect(json.tools).toContain("alpar_search_incidents");
    expect(json.tools).toContain("alpar_get_passport");
  });

  it("handles initialize method via POST", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.result.serverInfo.name).toBe("alpar-ai-mcp");
  });

  it("handles tools/list method via POST", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.result.tools.length).toBeGreaterThan(0);
  });

  it("executes alpar_get_passport tool call", async () => {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "alpar_get_passport",
          arguments: { incident_id: "test-1" },
        },
      }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.result.content[0].text).toContain("EU AI Act Article 73");
  });
});
