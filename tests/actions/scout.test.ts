import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { createMockSupabaseClient } from "../helpers/supabase-mock";

vi.hoisted(() => {
  vi.doMock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
  }));
  vi.doMock("@/lib/auth/session", () => ({
    getCurrentUser: vi.fn(),
  }));
  vi.doMock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: vi.fn(),
    RATE_LIMIT_KEYS: { vertex_scout: "vertex_scout" },
  }));
  vi.doMock("@/lib/ai/adapters/vertex-gemini", () => ({
    VertexGeminiAdapter: vi.fn(),
  }));
});

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { VertexGeminiAdapter } from "@/lib/ai/adapters/vertex-gemini";
import { scoutNewAIIncidents } from "@/actions/scout";

let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient = createMockSupabaseClient();
});

function mockAdapter(response: { ok: boolean; data?: unknown; error?: string }) {
  vi.mocked(VertexGeminiAdapter).mockImplementation(
    () =>
      ({
        generateJson: vi.fn().mockResolvedValue(response),
      }) as never,
  );
}

describe("scoutNewAIIncidents", () => {
  it("returns rate limited when rate limit exceeded", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: false, retryAfter: 30 } as never);

    const result = await scoutNewAIIncidents();
    expect(result.success).toBe(false);
    expect(result.error).toContain("Rate limit");
  });

  it("returns error when AI generation fails", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true } as never);
    mockAdapter({ ok: false, error: "API error" });

    const result = await scoutNewAIIncidents();
    expect(result.success).toBe(false);
    expect(result.error).toBe("API error");
  });

  it("creates incidents from scout data", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true } as never);
    vi.mocked(createAdminClient).mockReturnValue(mockSupabaseClient as never);

    mockAdapter({
      ok: true,
      data: [
        {
          title: "New AI Incident",
          description: "Description of the incident that happened today involving AI systems",
          severity: "high",
          category: "Data Leak",
          ai_provider_name: "OpenAI",
        },
      ],
    });

    const mockSingleProvider = vi
      .fn()
      .mockResolvedValue({ data: { id: "provider-1" }, error: null });
    const mockLimitProvider = vi.fn().mockReturnValue({ single: mockSingleProvider });
    const mockIlike = vi.fn().mockReturnValue({ limit: mockLimitProvider });
    const mockUsersLimit = vi.fn().mockResolvedValue({ data: [{ id: "admin-1" }], error: null });
    const mockUsersEq = vi.fn().mockReturnValue({ limit: mockUsersLimit });
    const mockUsersSelect = vi.fn().mockReturnValue({ eq: mockUsersEq, ilike: mockIlike });

    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "incidents") return { insert: vi.fn().mockReturnValue({}) };
      return { select: mockUsersSelect, insert: vi.fn() };
    });

    const result = await scoutNewAIIncidents();
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
  });

  it("handles provider not found by creating one", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true } as never);
    vi.mocked(createAdminClient).mockReturnValue(mockSupabaseClient as never);

    mockAdapter({
      ok: true,
      data: [
        {
          title: "New AI Incident",
          description: "Description of the incident that happened today involving AI systems",
          severity: "medium",
          category: "Bias",
          ai_provider_name: "NewAI",
        },
      ],
    });

    const mockSingleNotFound = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockLimitNotFound = vi.fn().mockReturnValue({ single: mockSingleNotFound });
    const mockIlike = vi.fn().mockReturnValue({ limit: mockLimitNotFound });
    const mockUsersLimit = vi.fn().mockResolvedValue({ data: [{ id: "admin-1" }], error: null });
    const mockUsersEq = vi.fn().mockReturnValue({ limit: mockUsersLimit });
    const mockUsersSelect = vi.fn().mockReturnValue({ eq: mockUsersEq, ilike: mockIlike });
    const mockInsertSelectSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: "new-provider-1" }, error: null });

    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "incidents") return { insert: vi.fn().mockReturnValue({}) };
      return {
        select: mockUsersSelect,
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single: mockInsertSelectSingle }),
        }),
      };
    });

    const result = await scoutNewAIIncidents();
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
  });

  it("handles parse failure of AI response", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ ok: true } as never);
    vi.mocked(createAdminClient).mockReturnValue(mockSupabaseClient as never);
    mockAdapter({ ok: true, data: { not_an_array: true } });

    mockSupabaseClient.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [{ id: "admin-1" }], error: null }),
        }),
      }),
      insert: vi.fn().mockReturnValue({}),
    }));

    const result = await scoutNewAIIncidents();
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
  });
});
