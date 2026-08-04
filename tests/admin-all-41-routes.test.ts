import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const adminAppDir = path.join(rootDir, "src", "app", "[locale]", "admin");

const ADMIN_ROUTES = [
  "",
  "advisory-board",
  "ai-pulse",
  "analysis",
  "api-keys",
  "api-management",
  "api-metrics",
  "audit",
  "autopilot",
  "billing",
  "crons",
  "cross-audit-dashboard",
  "dsar",
  "ecosystem",
  "experts",
  "feature-flags",
  "finance",
  "geo",
  "grants",
  "health",
  "import",
  "innovations",
  "integrations",
  "investors",
  "k-benchmark",
  "launch-signal",
  "linkedin",
  "marketing",
  "master-plan",
  "moderation",
  "outreach",
  "platforms",
  "providers",
  "redaction-queue",
  "resources",
  "settings",
  "signals",
  "slo-dashboard",
  "social",
  "strategy",
  "takedown",
  "users",
];

describe("360 Degree Comprehensive Admin 41-Route Audit", () => {
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
