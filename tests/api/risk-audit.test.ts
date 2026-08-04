import { describe, it, expect, vi, beforeEach } from "vitest";
import "@/../tests/helpers/setup"; // import mock setup
import { callModel } from "@/lib/ai/openrouter-gateway";

const mockMaybeSingle = vi.fn();
const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: mockMaybeSingle,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

vi.mock("@/lib/ai/openrouter-gateway", () => ({
  callModel: vi.fn(),
}));

import { POST } from "@/app/api/v1/risk/audit/route";

describe("Risk Audit API Endpoint", () => {
  beforeEach(() => {
    vi.stubEnv("ENTERPRISE_API_KEY", "ent-secret-key");
    vi.clearAllMocks();
  });

  it("should fail with 401 if unauthorized", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const req = new Request("http://localhost/api/v1/risk/audit", {
      method: "POST",
      headers: {
        authorization: "Bearer bad-key",
      },
      body: JSON.stringify({ text: "Hello" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should fail with 400 if text is missing", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { tier: "enterprise" },
      error: null,
    });

    const req = new Request("http://localhost/api/v1/risk/audit", {
      method: "POST",
      headers: {
        authorization: "Bearer ent-secret-key",
      },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should audit successfully using LLM", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { tier: "enterprise" },
      error: null,
    });

    vi.mocked(callModel).mockResolvedValueOnce({
      ok: true,
      data: {
        content: JSON.stringify({
          eu_act_risk_category: "high",
          eu_act_serious_incident_class: "Biometric Identification Systems",
          risk_score: 0.85,
          reasoning: "System performs real-time biometric identification in public spaces.",
        }),
        model: "gemini-1.5-pro",
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        latencyMs: 120,
      },
    });

    const req = new Request("http://localhost/api/v1/risk/audit", {
      method: "POST",
      headers: {
        authorization: "Bearer ent-secret-key",
      },
      body: JSON.stringify({ text: "A biometric identification software." }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.eu_act_risk_category).toBe("high");
    expect(json.risk_score).toBe(0.85);
  });

  it("should fallback to rule-based classification if LLM fails", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: { tier: "enterprise" },
      error: null,
    });

    vi.mocked(callModel).mockResolvedValueOnce({
      ok: false,
      error: { code: "api_error", message: "Timeout", model: "gemini" },
    });

    const req = new Request("http://localhost/api/v1/risk/audit", {
      method: "POST",
      headers: {
        authorization: "Bearer ent-secret-key",
      },
      body: JSON.stringify({ text: "Self-harm or suicide content." }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.eu_act_risk_category).toBe("unacceptable");
    expect(json.risk_score).toBe(0.95);
  });
});
