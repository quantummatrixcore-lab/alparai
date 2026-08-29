import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const adminAppDir = path.join(rootDir, "src", "app", "[locale]", "admin");

const ADMIN_ROUTES = [
  "",
  "incidents",
  "cross-audit",
  "compliance",
  "legal-tracker",
  "transparency",
  "challenges",
  "moderation",
  "social",
  "dilemmas",
  "mail",
  "seo",
  "strategy",
  "investors",
  "grants",
  "finance",
  "api-keys",
  "data-moat",
  "ai-signals",
  "innovations",
  "system-health",
  "users",
  "experts",
  "academy",
  "vault",
  "settings",
];

describe("360 Degree Comprehensive Admin Route Audit", () => {
  for (const route of ADMIN_ROUTES) {
    const pagePath =
      route === "" ? path.join(adminAppDir, "page.tsx") : path.join(adminAppDir, route, "page.tsx");

    it(`verifies route /admin/${route} page exists and exports default component`, () => {
      expect(fs.existsSync(pagePath)).toBe(true);
      const content = fs.readFileSync(pagePath, "utf-8");
      expect(content).toContain("export default");
    });
  }
});
