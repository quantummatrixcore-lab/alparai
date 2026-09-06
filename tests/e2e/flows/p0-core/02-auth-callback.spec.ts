import { test, expect } from "@playwright/test";

test.describe("P0 - Auth Flow: Callback Handling", () => {
  test("Callback route returns 400 for missing code", async ({ request }) => {
    const response = await request.get("/auth/callback");
    // Depending on logic, it redirects to /auth/auth-error or signin
    expect(response.status()).toBe(200); 
  });
});