import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { setupAuthenticatedPage } from "./helpers/auth";

const adminAppDir = path.join(process.cwd(), "src", "app", "[locale]", "admin");

function discoverAdminRoutes(dir: string, baseRelative = ""): string[] {
  let routes: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(dir, entry.name);
      const rel = baseRelative ? `${baseRelative}/${entry.name}` : entry.name;
      routes = routes.concat(discoverAdminRoutes(subDir, rel));
    } else if (entry.isFile() && entry.name === "page.tsx") {
      routes.push(baseRelative);
    }
  }
  return routes.sort();
}

const ADMIN_ROUTES = discoverAdminRoutes(adminAppDir);

test.describe("Admin 360-Degree Pages E2E Audit", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  for (const route of ADMIN_ROUTES) {
    const routePath = route === "" ? "/en/admin" : `/en/admin/${route}`;

    test(`Admin Route [${routePath}] loads cleanly without 500, crash, or blank content`, async ({
      page,
    }) => {
      const pageErrors: string[] = [];

      page.on("pageerror", (err) => {
        if (!err.message.includes("ServiceWorker") && !err.message.includes("service worker")) {
          pageErrors.push(err.message);
        }
      });

      const response = await page.goto(routePath);

      // 1. Verify response HTTP status code is not 5xx server error
      if (response) {
        expect(
          response.status(),
          `Route ${routePath} returned HTTP status ${response.status()}`,
        ).toBeLessThan(500);
      }

      await page.waitForLoadState("domcontentloaded");

      // 2. Verify body visibility
      const body = page.locator("body");
      await expect(body).toBeVisible({ timeout: 10000 });

      // 3. Verify page body is not blank
      const text = await body.innerText();
      expect(text.trim().length, `Page ${routePath} content should not be blank`).toBeGreaterThan(
        0,
      );

      // 4. Verify no standard server error / client exception text
      expect(text).not.toContain("500 Internal Server Error");
      expect(text).not.toContain("An error occurred");
      expect(text).not.toContain("Application error: a client-side exception has occurred");
      expect(text).not.toContain("Unhandled Runtime Error");

      // 5. Verify presence of key UI structural elements
      const hasStructure = await page
        .locator("h1, h2, h3, main, nav, table, form, [role='main'], div")
        .count();
      expect(hasStructure).toBeGreaterThan(0);

      // 6. Check for unhandled client runtime page crashes
      expect(pageErrors, `Uncaught page errors on ${routePath}: ${pageErrors.join("; ")}`).toEqual(
        [],
      );
    });
  }
});
