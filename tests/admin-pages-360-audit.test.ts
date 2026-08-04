import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const adminAppDir = path.join(rootDir, "src", "app", "[locale]", "admin");
const enJsonPath = path.join(rootDir, "messages", "en.json");
const trJsonPath = path.join(rootDir, "messages", "tr.json");

describe("360 Degree Admin Panel Integrity Audit", () => {
  const enJson = JSON.parse(fs.readFileSync(enJsonPath, "utf-8"));
  const trJson = JSON.parse(fs.readFileSync(trJsonPath, "utf-8"));
  const adminEn = enJson.admin || {};
  const adminTr = trJson.admin || {};

  it("verifies all admin routes have valid page.tsx files", () => {
    function getAllPageFiles(dir: string): string[] {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...getAllPageFiles(fullPath));
        } else if (entry.name === "page.tsx") {
          results.push(fullPath);
        }
      }
      return results;
    }

    const pageFiles = getAllPageFiles(adminAppDir);
    expect(pageFiles.length).toBeGreaterThan(30);

    for (const pageFile of pageFiles) {
      const content = fs.readFileSync(pageFile, "utf-8");
      expect(content).toContain("export default");
    }
  });

  it("verifies sidebar navigation links map to existing page files", () => {
    const sidebarPath = path.join(rootDir, "src", "components", "admin", "sidebar.tsx");
    const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");

    // Extract all hrefs starting with /admin
    const hrefMatches = [...sidebarContent.matchAll(/href:\s*["'](\/admin[^"']*)["']/g)];
    const hrefs = hrefMatches.map((m) => m[1]);

    expect(hrefs.length).toBeGreaterThan(15);

    const missingRoutes: string[] = [];

    for (const href of hrefs) {
      if (!href) continue;
      // Strip query parameters or trailing slashes
      const routePath = href.split("?")[0]!;
      const relativeRoute = routePath.replace(/^\/admin/, "");

      let targetFile = path.join(adminAppDir, relativeRoute, "page.tsx");
      if (relativeRoute === "" || relativeRoute === "/") {
        targetFile = path.join(adminAppDir, "page.tsx");
      }

      if (!fs.existsSync(targetFile)) {
        missingRoutes.push(href);
      }
    }

    expect(missingRoutes).toEqual([]);
  });

  it("verifies translation keys in admin namespace exist in both en.json and tr.json", () => {
    const enKeys = new Set(Object.keys(adminEn));
    const trKeys = new Set(Object.keys(adminTr));

    const missingInTr = [...enKeys].filter((k) => !trKeys.has(k));
    const missingInEn = [...trKeys].filter((k) => !enKeys.has(k));

    expect(missingInTr).toEqual([]);
    expect(missingInEn).toEqual([]);
  });
});
