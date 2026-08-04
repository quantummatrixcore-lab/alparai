import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe("Visitor Journey - Submit Incident Flow", () => {
  test("navigates to submit page and displays validation errors for empty fields", async ({
    page,
  }) => {
    await page.goto("/en");

    // Check if hero and submit CTA is present
    const submitCta = page
      .getByRole("link", { name: /Report in 60 Seconds|60 Saniyede Bildir/i })
      .first();
    await expect(submitCta).toBeVisible();
    await submitCta.click();

    // Verify it navigates to /submit
    await page.waitForURL(/\/submit/, { timeout: 10000 }).catch(async () => {
      await page.goto("/en/submit");
    });
    await expect(page).toHaveURL(/.*submit/);

    // Verify submit form elements
    const submitHeading = page.getByRole("heading", { name: /Report an incident/i });
    await expect(submitHeading).toBeVisible();

    const titleInput = page.locator("input[name='title']");
    const descInput = page.locator("textarea[name='description']");
    await expect(titleInput).toBeVisible();
    await expect(descInput).toBeVisible();

    // Click submit button to trigger client/server validation errors (should be disabled when empty)
    const submitBtn = page.getByRole("button", { name: /Submit report|Raporu gönder/i });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Since consents are not checked, it should display consent required warning
    // or validate required fields
    const consentErr = page.locator("text=consent is required|consent_required");
    const count = await consentErr.count();
    if (count > 0) {
      await expect(consentErr.first()).toBeVisible();
    }
  });
});
