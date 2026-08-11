import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { setupAuthenticatedPage } from "../helpers/auth";

/**
 * Runtime companion to scripts/check-admin-links.mjs (Doctrine G-11).
 *
 * The static checker proves an href has a page.tsx behind it. This one proves
 * that clicking it actually lands somewhere: it walks every admin route and
 * follows the links the page really rendered, asserting none of them 404.
 *
 * Static analysis cannot see runtime-composed hrefs, middleware rewrites or
 * server errors — that gap is what this spec covers. It is intended to run
 * against a deployed environment (PLAYWRIGHT_BASE_URL), on a schedule rather
 * than on every pull request.
 */

const adminAppDir = path.join(process.cwd(), "src", "app", "[locale]", "admin");

function discoverAdminRoutes(dir: string, baseRelative = ""): string[] {
  let routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const rel = baseRelative ? `${baseRelative}/${entry.name}` : entry.name;
      routes = routes.concat(discoverAdminRoutes(path.join(dir, entry.name), rel));
    } else if (entry.isFile() && entry.name === "page.tsx") {
      routes.push(baseRelative);
    }
  }
  return routes.sort();
}

const ADMIN_ROUTES = discoverAdminRoutes(adminAppDir).filter((route) => !route.includes("["));

const LOCALE = "en";

test.describe("admin link integrity", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test("every admin route responds", async ({ page }) => {
    const notFound: string[] = [];

    for (const route of ADMIN_ROUTES) {
      const url = `/${LOCALE}/admin${route ? `/${route}` : ""}`;
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      const status = response?.status() ?? 0;

      // 3xx and 401 mean the auth gate spoke, which is a working route.
      // 404 means the page is simply not there.
      if (status === 404) notFound.push(`${url} -> 404`);
    }

    expect(notFound, `Admin routes returning 404:\n${notFound.join("\n")}`).toEqual([]);
  });

  test("links rendered inside the admin panel resolve", async ({ page, request }) => {
    const broken: string[] = [];
    const checked = new Set<string>();

    for (const route of ADMIN_ROUTES) {
      const url = `/${LOCALE}/admin${route ? `/${route}` : ""}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });

      const hrefs = await page
        .locator(`a[href^="/${LOCALE}/admin"]`)
        .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href") ?? ""));

      for (const href of hrefs) {
        if (!href || checked.has(href)) continue;
        checked.add(href);
        const response = await request.get(href, { maxRedirects: 0 });
        if (response.status() === 404) broken.push(`${url} -> ${href} (404)`);
      }
    }

    expect(
      broken,
      `Links rendered in the admin panel that lead nowhere:\n${broken.join("\n")}`,
    ).toEqual([]);
  });
});
