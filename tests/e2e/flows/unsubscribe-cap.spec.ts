import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Load .env.local manually for the test runner if it exists
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts
          .join("=")
          .trim()
          .replace(/^['"]|['"]$/g, "");
        if (key && value) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
} catch (e) {
  console.warn("Failed to load .env.local for test runner:", e);
}

import {
  generateUnsubscribeToken,
  generateEmailUnsubscribeToken,
} from "../../../src/lib/utils/unsubscribe";

test.describe("One-click Unsubscribe Flow", () => {
  test("should show invalid request when params are missing", async ({ page }) => {
    await page.goto("/en/unsubscribe");
    const title = page.locator("h3");
    await expect(title).toContainText("Invalid Request");
  });

  test("should show security verification failed with invalid token", async ({ page }) => {
    await page.goto("/en/unsubscribe?userId=usr-123&token=invalidtoken");
    const title = page.locator("h3");
    await expect(title).toContainText("Security Verification Failed");
  });

  test("should successfully unsubscribe with a valid token", async ({ page }) => {
    const userId = "00000000-0000-0000-0000-000000000000"; // Dummy UUID
    const token = generateUnsubscribeToken(userId);

    await page.goto(`/en/unsubscribe?userId=${userId}&token=${token}&type=reporter_notifications`);

    const title = page.locator("h3");
    await expect(title).toContainText("Unsubscribed Successfully");
  });

  test("should successfully unsubscribe via GET API with valid token and redirect", async ({
    page,
  }) => {
    const email = "test-reporter@alparai.com";
    const token = generateEmailUnsubscribeToken(email);

    await page.goto(`/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`);

    await expect(page).toHaveURL(/.*unsubscribe\?ok=1/);
    const title = page.locator("h3");
    await expect(title).toContainText("Unsubscribed Successfully");
  });

  test("should successfully unsubscribe via POST API with valid token", async ({ request }) => {
    const email = "test-reporter@alparai.com";
    const token = generateEmailUnsubscribeToken(email);

    const response = await request.post("/api/unsubscribe", {
      data: { email, token },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
  });

  test("should fail API unsubscribe with invalid token", async ({ request }) => {
    const email = "test-reporter@alparai.com";
    const response = await request.get(
      `/api/unsubscribe?email=${encodeURIComponent(email)}&token=invalidtoken`,
    );

    expect(response.status()).toBe(400);
    const text = await response.text();
    expect(text).toContain("The unsubscribe link is missing or invalid");
  });
});
