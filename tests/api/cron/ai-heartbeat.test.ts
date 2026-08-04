import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/cron/ai-heartbeat/route";

describe("AI Heartbeat Cron Route (/api/cron/ai-heartbeat)", () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "test-cron-secret-123";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  it("rejects unauthorized requests when CRON_SECRET is set", async () => {
    const req = new Request("http://localhost:3000/api/cron/ai-heartbeat", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("executes model heartbeat check successfully with valid auth", async () => {
    const req = new Request("http://localhost:3000/api/cron/ai-heartbeat", {
      headers: { authorization: "Bearer test-cron-secret-123" },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.auditedCount).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(json.results)).toBe(true);
  });
});
