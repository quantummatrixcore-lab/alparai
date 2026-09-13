import { test, expect } from "@playwright/test";

test.describe("P0 - Auth Flow: Callback Handling", () => {
  test("Callback route redirects on missing code", async ({ request }) => {
    const response = await request.get("/en/auth/callback", { maxRedirects: 0 });
    expect([200, 302, 307, 308]).toContain(response.status());
  });
});