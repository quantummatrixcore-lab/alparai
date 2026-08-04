import { describe, it, expect, vi } from "vitest";
import { verifyGrantPortalCDP, GRANT_PORTALS } from "@/lib/services/grant-portal-verifier";

describe("Grant Portal CDP Verifier", () => {
  it("contains all 9 ecosystem grant portals", () => {
    expect(GRANT_PORTALS.length).toBe(9);
    expect(GRANT_PORTALS.map((p) => p.id)).toContain("google");
    expect(GRANT_PORTALS.map((p) => p.id)).toContain("microsoft");
    expect(GRANT_PORTALS.map((p) => p.id)).toContain("aws");
  });

  it("verifies a portal successfully with valid HTTP response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          '<html><body><form action="/apply"><button>Apply Now</button></form></body></html>',
        ),
    } as unknown as Response);

    const result = await verifyGrantPortalCDP(GRANT_PORTALS[0]!, mockFetch);

    expect(result.status).toBe("verified");
    expect(result.httpStatus).toBe(200);
    expect(result.hasFormElement).toBe(true);
    expect(result.hasApplyButton).toBe(true);
  });

  it("handles failed HTTP status gracefully", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);

    const result = await verifyGrantPortalCDP(GRANT_PORTALS[0]!, mockFetch);

    expect(result.status).toBe("failed");
    expect(result.httpStatus).toBe(404);
    expect(result.error).toBe("HTTP 404");
  });

  it("handles network exception gracefully", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

    const result = await verifyGrantPortalCDP(GRANT_PORTALS[0]!, mockFetch);

    expect(result.status).toBe("failed");
    expect(result.error).toBe("Connection refused");
  });
});
