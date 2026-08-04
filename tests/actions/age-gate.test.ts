import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient, createTestUser } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/server", () => ({
    createClient: vi.fn(),
    createServerClient: vi.fn(),
  }));
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    getRedisInstance: vi.fn().mockReturnValue(null),
    RATE_LIMIT_KEYS: {
      global_incident_burst_guard: "ratelimit:global_incident_burst_guard",
      incident_submission: "ratelimit:incident_submission",
      coordinated_incident_burst_guard: "ratelimit:coordinated_incident_burst_guard",
    },
  }));
  vi.doMock("@/lib/pii/guardian", () => ({
    maskPII: vi.fn(),
  }));
});

import { createClient, createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { maskPII } from "@/lib/pii/guardian";
import { submitIncident } from "@/actions/incidents";

let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
let mockAdminClient: ReturnType<typeof createMockSupabaseClient>;
let mockUser: ReturnType<typeof createTestUser>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase = createMockSupabaseClient();
  mockAdminClient = createMockSupabaseClient();
  mockUser = createTestUser();
  vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  vi.mocked(createServerClient).mockResolvedValue(mockSupabase as never);
  vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);
  vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);
  vi.mocked(checkRateLimit).mockResolvedValue({ ok: true, remaining: 4 });
  vi.mocked(maskPII).mockImplementation((input: string) => ({
    masked: input,
    detections: [],
    piiFound: false,
    redactedCount: 0,
    detectedTypes: [],
  }));
});

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("title", "A valid incident title here");
  fd.set(
    "description",
    "This is a detailed description of the AI incident that happened recently with enough detail",
  );
  fd.set("category", "hallucination");
  fd.set("severity", "medium");
  fd.set("provider_id", "");
  fd.set("model_id", "");
  fd.set("incident_date", "2026-01-15");
  fd.set("consent_truth", "on");
  fd.set("consent_anonymous", "on");
  fd.set("consent_age", "on");
  fd.set("consent_terms", "on");
  fd.set("consent_coppa", "on");
  fd.set("consent_uk_osa", "on");
  for (const [key, value] of Object.entries(overrides)) {
    fd.set(key, value);
  }
  return fd;
}

describe("submitIncident Age Gate Integration", () => {
  it("should record age gate self-declaration to age_declarations table via submit_incident_atomic", async () => {
    const fd = buildFormData({ consent_age: "on" });
    const res = await submitIncident({ ok: false }, fd);

    expect(res.ok).toBe(true);
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      "submit_incident_atomic",
      expect.objectContaining({
        payload: expect.objectContaining({
          age_consent: true,
          coppa_consent: true,
          uk_osa_consent: true,
        }),
      }),
    );
  });
});
