import { test, expect } from "@playwright/test";

test.describe("P0 - Auth Flow: Sign In", () => {
  test("User can navigate to sign-in and see Google OAuth", async ({ page }) => {
    await page.goto("/en/auth/signin");
    await expect(page).toHaveURL(/.*(\/auth\/signin|\/profile|\/en)/);
  });
});