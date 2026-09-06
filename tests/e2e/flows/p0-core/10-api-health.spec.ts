import { test, expect } from "@playwright/test";

test.describe("P0 - API Health", () => {
  test("Health check endpoint returns 200", async ({ request }) => {
    const res = await request.get("/api/v1/health");
    expect(res.status()).toBe(200);
  });
});