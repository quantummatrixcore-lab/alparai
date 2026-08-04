import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/webhooks/sentry-alert/route";

describe("Sentry Alert Webhook", () => {
  beforeEach(() => {
    vi.stubEnv("SENTRY_WEBHOOK_SECRET", "super-secret-key");
    vi.stubEnv("VERCEL_TOKEN", "mock-vercel-token");
    vi.restoreAllMocks();
  });

  it("should return 401 if secret is invalid", async () => {
    const req = new Request("http://localhost/api/webhooks/sentry-alert?secret=bad-key", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("unauthorized");
  });

  it("should return ignored status if rule name does not match 5xx criteria", async () => {
    const req = new Request("http://localhost/api/webhooks/sentry-alert?secret=super-secret-key", {
      method: "POST",
      body: JSON.stringify({
        rule_name: "Some other alert",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ignored");
    expect(json.reason).toBe("not_5xx_spike");
  });

  it("should perform rollback when criteria met and ready deployments exist", async () => {
    const globalFetchSpy = vi.spyOn(global, "fetch");

    // Mock Vercel GET deployments response
    globalFetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        deployments: [
          { id: "dpl_new_failed", state: "READY", url: "failed.vercel.app" },
          { id: "dpl_old_stable", state: "READY", url: "stable.vercel.app" },
        ],
      }),
    } as Response);

    // Mock Vercel POST rollback response
    globalFetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: "completed",
      }),
    } as Response);

    const req = new Request("http://localhost/api/webhooks/sentry-alert?secret=super-secret-key", {
      method: "POST",
      body: JSON.stringify({
        rule_name: "Production 5xx Spike Detected",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe("success");
    expect(json.rollback_target.id).toBe("dpl_old_stable");

    expect(globalFetchSpy).toHaveBeenCalledTimes(2);
  });
});
