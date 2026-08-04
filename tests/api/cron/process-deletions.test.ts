import { describe, it, expect, vi, beforeEach } from "vitest";
import "../../helpers/setup";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { createAdminClient } from "@/lib/supabase/admin";

function makeMockAdmin(overrides: Record<string, unknown> = {}) {
  const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

  const mockLte = vi.fn().mockResolvedValue({ data: [], error: null });
  const mockIs = vi.fn().mockResolvedValue({ data: [], error: null });
  const mockEq = vi.fn().mockReturnValue({ lte: mockLte, is: mockIs });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  const mockDeleteEq = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq });

  const client = {
    from: vi.fn().mockImplementation((_table: string) => ({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    })),
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
    _mocks: { mockUpdate, mockUpdateEq, mockLte, mockEq, mockSelect, mockDeleteEq, mockDelete },
    ...overrides,
  };
  return client;
}

import { GET } from "@/app/api/cron/process-deletions/route";

describe("B5 — KVKK/GDPR Delete Flow Cron Chain", () => {
  let mockAdmin: ReturnType<typeof makeMockAdmin>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdmin = makeMockAdmin();
    vi.mocked(createAdminClient).mockReturnValue(mockAdmin as never);
  });

  it("soft-delete: anonymizes user — sets full_name to 'Anonim Kullanıcı'", async () => {
    const userId = "user-gdpr-test-001";

    // Simulate: user has delete_scheduled_for in the past, is_soft_deleted=false
    mockAdmin._mocks.mockLte.mockResolvedValueOnce({ data: [{ id: userId }], error: null });
    // Subsequent lte call (hard-delete candidates): empty
    mockAdmin._mocks.mockLte.mockResolvedValueOnce({ data: [], error: null });

    // GET request with dev env (no auth needed)
    const req = new Request("http://localhost/api/cron/process-deletions");
    await GET(req as never);

    // The cron should have called update on users table
    expect(mockAdmin.from).toHaveBeenCalledWith("users");
    expect(mockAdmin._mocks.mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: "Anonim Kullanıcı",
        is_soft_deleted: true,
      }),
    );
  });

  it("soft-delete: auto-unsubscribes email preferences", async () => {
    const userId = "user-gdpr-test-002";
    mockAdmin._mocks.mockLte.mockResolvedValueOnce({ data: [{ id: userId }], error: null });
    mockAdmin._mocks.mockLte.mockResolvedValueOnce({ data: [], error: null });

    const { GET } = await import("@/app/api/cron/process-deletions/route");
    const req = new Request("http://localhost/api/cron/process-deletions");
    await GET(req as never);

    // Verify email_preferences table was updated (auto-unsubscribe)
    expect(mockAdmin.from).toHaveBeenCalledWith("email_preferences");
    expect(mockAdmin._mocks.mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        weekly_digest: false,
        watches: false,
        reporter_notifications: false,
      }),
    );
  });

  it("hard-delete: calls auth.admin.deleteUser after 30d soft-delete window", async () => {
    const userId = "user-gdpr-test-003";
    // First lte (soft candidates): empty
    mockAdmin._mocks.mockLte.mockResolvedValueOnce({ data: [], error: null });
    // Second lte (hard-delete candidates): one user
    mockAdmin._mocks.mockLte.mockResolvedValueOnce({ data: [{ id: userId }], error: null });

    const { GET } = await import("@/app/api/cron/process-deletions/route");
    const req = new Request("http://localhost/api/cron/process-deletions");
    await GET(req as never);

    expect(mockAdmin.auth.admin.deleteUser).toHaveBeenCalledWith(userId);
  });

  it("G5: processes approved redaction requests — replaces provider name with asterisks", async () => {
    const mockRedactions = [
      {
        id: "req-1",
        incident_id: "inc-1",
        provider_id: "prov-1",
        ai_providers: { name: "OpenAI" },
      },
    ];

    const mockIncident = {
      id: "inc-1",
      title: "OpenAI gpt-4 jailbreak",
      description: "We found a jailbreak in OpenAI models.",
      title_masked: "OpenAI gpt-4 jailbreak",
      description_masked: "We found a jailbreak in OpenAI models.",
    };

    const mockIs = vi.fn().mockResolvedValue({ data: mockRedactions, error: null });
    const mockEqRedact = vi.fn().mockReturnValue({ is: mockIs });
    const mockSelectRedact = vi.fn().mockReturnValue({ eq: mockEqRedact });

    const mockSingle = vi.fn().mockResolvedValue({ data: mockIncident, error: null });
    const mockEqInc = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelectInc = vi.fn().mockReturnValue({ eq: mockEqInc });

    const mockUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockUpdateMock = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    const customFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "redaction_requests") {
        return {
          select: mockSelectRedact,
          update: mockUpdateMock,
        };
      }
      if (table === "incidents") {
        return {
          select: mockSelectInc,
          update: mockUpdateMock,
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
        update: mockUpdateMock,
      };
    });

    mockAdmin.from = customFrom;

    const { GET } = await import("@/app/api/cron/process-deletions/route");
    const req = new Request("http://localhost/api/cron/process-deletions");
    const res = await GET(req as never);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.redactions_processed).toBe(1);

    expect(mockUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "*** gpt-4 jailbreak",
        description: "We found a jailbreak in *** models.",
      }),
    );
  });

  it("returns 401 for unauthorized requests in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { GET } = await import("@/app/api/cron/process-deletions/route");
    const req = new Request("http://localhost/api/cron/process-deletions");
    const res = await GET(req as never);

    expect(res.status).toBe(401);

    vi.unstubAllEnvs();
  });
});
