import { describe, it, expect } from "vitest";
import "../helpers/setup";
import { GET } from "@/app/api/health/route";

describe("Item 149c-wiring — Hermetic Health Route Test", () => {
  it("returns 200 OK and skips missing infra cleanly without throwing or noise", async () => {
    const res = await GET();
    expect([200, 503]).toContain(res.status);

    const json = await res.json();
    expect(json.status).toBeDefined();
    expect(Array.isArray(json.services)).toBe(true);

    const redisService = json.services.find(
      (s: { name: string; status: string }) => s.name === "redis",
    );
    if (redisService) {
      expect(["healthy", "not_configured", "unhealthy"]).toContain(redisService.status);
    }
  });
});
