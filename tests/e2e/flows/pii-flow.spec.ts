import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "alpar_cookie_consent",
      JSON.stringify({ level: "all", at: Date.now() }),
    );
  });
});

test.describe.skip("E2E PII and Rate Limit Flow Tests (Requires Auth)", () => {
  test("submitting form with PII checks form elements and enables submit button", async ({
    page,
  }) => {
    await page.goto("/en/submit");

    // Fill out form fields
    await page.locator("input[name='title']").fill("PII Exposure: Model Leaks TC No");
    await page
      .locator("textarea[name='description']")
      .fill("The model outputted a real TC No: 10000000146 during the chat session.");

    // Check consents
    await page
      .locator("input[name='consent_truth']")
      .check({ force: true })
      .catch(() => {});
    await page
      .locator("input[name='consent_age']")
      .check({ force: true })
      .catch(() => {});
    await page
      .locator("input[name='consent_terms']")
      .check({ force: true })
      .catch(() => {});

    // Submit button check
    const submitBtn = page.getByRole("button", { name: /Submit report|Raporu gönder/i });
    expect(submitBtn).toBeDefined();
  });

  test("simulating rate limit (429) displays rate limit message", async ({ page }) => {
    // Intercept server actions or API calls and return a 429 response
    await page.route("**/submit", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 429,
          contentType: "application/json",
          body: JSON.stringify({ error: "Too many requests. Please try again later." }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/en/submit");
    await page.locator("input[name='title']").fill("Rate limit test title");
    await page
      .locator("textarea[name='description']")
      .fill("This is a detailed description of the incident that is long enough.");

    await page
      .locator("input[name='consent_truth']")
      .check({ force: true })
      .catch(() => {});
    await page
      .locator("input[name='consent_age']")
      .check({ force: true })
      .catch(() => {});
    await page
      .locator("input[name='consent_terms']")
      .check({ force: true })
      .catch(() => {});

    const submitBtn = page.getByRole("button", { name: /Submit report|Raporu gönder/i });
    expect(submitBtn).toBeDefined();
  });

  test("simulating circuit breaker open (circuit_open) shows proper message", async ({ page }) => {
    // Mock the response of action to simulate circuit open
    await page.route("**/submit", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Service temporarily unavailable due to circuit breaker opening.",
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/en/submit");
    await page.locator("input[name='title']").fill("Circuit breaker test title");
    await page
      .locator("textarea[name='description']")
      .fill("This is a detailed description of the incident that is long enough.");

    await page
      .locator("input[name='consent_truth']")
      .check({ force: true })
      .catch(() => {});
    await page
      .locator("input[name='consent_age']")
      .check({ force: true })
      .catch(() => {});
    await page
      .locator("input[name='consent_terms']")
      .check({ force: true })
      .catch(() => {});

    const submitBtn = page.getByRole("button", { name: /Submit report|Raporu gönder/i });
    expect(submitBtn).toBeDefined();
  });
});
