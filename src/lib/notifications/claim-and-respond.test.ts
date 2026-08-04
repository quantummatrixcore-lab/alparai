import { describe, expect, it, vi } from "vitest";
import { triggerClaimAndRespondAlert } from "./claim-and-respond";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            Promise.resolve({ data: { name: "OpenAI", contact_email: "safety@openai.com" } }),
        }),
      }),
      insert: () => ({
        select: () => ({
          maybeSingle: () => Promise.resolve({ data: { id: "outreach-123" } }),
        }),
      }),
    }),
  }),
}));

describe("triggerClaimAndRespondAlert", () => {
  it("does not trigger for low or medium severity incidents", async () => {
    const result = await triggerClaimAndRespondAlert({
      incidentId: "inc-1",
      providerId: "prov-1",
      modelId: "mod-1",
      title: "Minor glitch in output formatting",
      severity: "medium",
    });

    expect(result.triggered).toBe(false);
    expect(result.reason).toContain("Severity below trigger threshold");
  });

  it("triggers successfully for high and critical incidents", async () => {
    const result = await triggerClaimAndRespondAlert({
      incidentId: "inc-2",
      providerId: "prov-1",
      modelId: "mod-1",
      title: "Severe privacy leak during incorporation chat",
      severity: "critical",
    });

    expect(result.triggered).toBe(true);
    expect(result.alertId).toBe("outreach-123");
  });
});
