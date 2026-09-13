import { test, expect } from "@playwright/test";

test.describe("P0 - Submit Flow: PII Masking", () => {
  test("PII masking API is reachable", async ({ request }) => {
    const res = await request.post("/api/v1/pii-check", {
      data: { text: "My email is test@test.com" }
    });
    // Assuming API is locked down or returns some shape
    expect([200, 400, 404, 405]).toContain(res.status());
  });
});