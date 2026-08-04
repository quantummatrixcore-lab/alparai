import { describe, it, expect, vi, beforeEach } from "vitest";
import "../helpers/setup";
import { triggerClaimAndRespondAlert } from "@/lib/notifications/claim-and-respond";
import { createAdminClient } from "@/lib/supabase/admin";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

describe("Claim & Respond Alert Trigger", () => {
  const mockInsert = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockMaybeSingle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "provider-123",
        name: "OpenAI",
        contact_email: "safety@openai.com",
      },
      error: null,
    });

    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockSelect.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybeSingle });

    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({
          data: { id: "queue-999" },
          error: null,
        }),
      }),
    });

    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "ai_providers") {
          return { select: mockSelect };
        }
        if (table === "outreach_queue") {
          return { insert: mockInsert };
        }
        return {};
      }),
    } as unknown as ReturnType<typeof createAdminClient>);
  });

  it("skips triggering when incident severity is low or medium", async () => {
    const result = await triggerClaimAndRespondAlert({
      incidentId: "inc-1",
      providerId: "prov-1",
      modelId: "mod-1",
      title: "Minor glitch",
      severity: "medium",
    });

    expect(result.triggered).toBe(false);
    expect(result.reason).toContain("Severity below trigger threshold");
  });

  it("triggers outreach alert for high severity incidents", async () => {
    const result = await triggerClaimAndRespondAlert({
      incidentId: "inc-high-1",
      providerId: "provider-123",
      modelId: "model-456",
      title: "Critical Hallucination Event",
      severity: "high",
    });

    expect(result.triggered).toBe(true);
    expect(result.alertId).toBe("queue-999");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient_name: "OpenAI",
        template_type: "provider_ts_contact",
      }),
    );
  });

  it("triggers outreach alert for critical severity incidents", async () => {
    const result = await triggerClaimAndRespondAlert({
      incidentId: "inc-crit-1",
      providerId: null,
      modelId: null,
      title: "Systemic Data Exposure Incident",
      severity: "critical",
    });

    expect(result.triggered).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient_name: "AI Provider",
        subject: expect.stringContaining("Systemic Data Exposure"),
      }),
    );
  });
});
