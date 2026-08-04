import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("Provider Respond Token Flow E2E", () => {
  test("renders invalid token warning when token is missing or incorrect", async ({ page }) => {
    const incidentId = "00000000-0000-0000-0000-000000000002";
    await page.goto(`/en/incidents/${incidentId}/respond`);
    await expect(page.locator("h1")).toContainText(/Invalid or Expired Link|Geçersiz/i);

    await page.goto(`/en/incidents/${incidentId}/respond?token=wrongtoken`);
    await expect(page.locator("h1")).toContainText(/Invalid or Expired Link|Geçersiz/i);
  });

  test("successfully renders the response form when token is valid", async ({ page }) => {
    const incidentId = "00000000-0000-0000-0000-000000000002";
    const token = "0000000000000000000000000000000000000000000000000000000000000000";
    await page.goto(`/en/incidents/${incidentId}/respond?token=${token}`);

    // Verify page headers and form elements exist
    await expect(page.getByRole("heading", { name: "Submit Official Response" })).toBeVisible();
    await expect(page.locator("textarea[name='responseText']")).toBeVisible();
    await expect(page.locator("input[name='responderName']")).toBeVisible();
    await expect(page.locator("input[name='responderRole']")).toBeVisible();
    await expect(page.getByRole("button", { name: /Submit Official Response/i })).toBeVisible();
  });
});
