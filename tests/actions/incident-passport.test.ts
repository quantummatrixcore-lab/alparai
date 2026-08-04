import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    requireUser: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    RATE_LIMIT_KEYS: { export_request: "export_request" },
  }));
  vi.doMock("next/headers", () => ({
    headers: vi.fn(),
  }));
});

import { createServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { headers } from "next/headers";
import { getIncidentPassport } from "@/actions/incident-passport";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;
const mockSessionUser = {
  id: "user-1",
  email: "user@test.com",
  fullName: "Test User",
  avatarUrl: null,
  role: "admin" as const,
  isVerified: true,
  createdAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
});

describe("getIncidentPassport", () => {
  it("returns passport for valid incident", async () => {
    vi.mocked(requireUser).mockResolvedValue(mockSessionUser);
    vi.mocked(headers).mockResolvedValue(new Map([["x-forwarded-for", "127.0.0.1"]]) as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true } as never);
    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as never);

    const mockIncident = {
      id: "inc-1",
      title_masked: "AI Incident",
      description_masked: "Description",
      category: "Bias",
      severity: "medium",
      status: "published",
      incident_date: "2026-01-01",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: null,
      language: "en",
      location_country: "US",
      source_url: null,
      ai_provider_id: null,
      ai_model_id: null,
      eu_act_risk_category: null,
      eu_act_serious_incident_class: null,
      eu_act_high_risk_system_category: null,
      eu_act_reporting_deadline_days: null,
      cross_audit_truth_score: null,
      cross_audit_confidence: null,
      cross_audit_reasoning: null,
      cross_audit_model: null,
      views_count: 100,
      upvotes_count: 10,
      shares_count: 5,
      comments_count: 3,
      ai_providers: null,
      ai_models: null,
    };

    mockSupabaseClient._mocks.mockMaybeSingle.mockResolvedValue({
      data: mockIncident,
      error: null,
    });

    const result = await getIncidentPassport("inc-1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.passport.incident.id).toBe("inc-1");
      expect(result.passport.incident.title).toBe("AI Incident");
      expect(result.passport.engagement.views).toBe(100);
    }
  });

  it("returns forbidden when not authenticated", async () => {
    vi.mocked(requireUser).mockRejectedValue(new Error("Unauthorized"));

    const result = await getIncidentPassport("inc-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Forbidden");
    }
  });

  it("returns rate limited when rate limit exceeded", async () => {
    vi.mocked(requireUser).mockResolvedValue(mockSessionUser);
    vi.mocked(headers).mockResolvedValue(new Map([["x-forwarded-for", "127.0.0.1"]]) as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfter: 60 } as never);

    const result = await getIncidentPassport("inc-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Rate limited");
    }
  });

  it("returns error when incident not found", async () => {
    vi.mocked(requireUser).mockResolvedValue(mockSessionUser);
    vi.mocked(headers).mockResolvedValue(new Map([["x-forwarded-for", "127.0.0.1"]]) as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true } as never);
    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as never);
    mockSupabaseClient._mocks.mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await getIncidentPassport("inc-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Incident not found");
    }
  });

  it("returns error on database failure", async () => {
    vi.mocked(requireUser).mockResolvedValue(mockSessionUser);
    vi.mocked(headers).mockResolvedValue(new Map([["x-forwarded-for", "127.0.0.1"]]) as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true } as never);
    vi.mocked(createServerClient).mockResolvedValue(mockSupabaseClient as never);
    mockSupabaseClient._mocks.mockMaybeSingle.mockResolvedValue({
      data: null,
      error: new Error("DB down"),
    });

    const result = await getIncidentPassport("inc-1");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Incident not found");
    }
  });
});
