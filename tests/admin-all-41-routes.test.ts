import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const adminAppDir = path.join(rootDir, "src", "app", "[locale]", "admin");

const ADMIN_ROUTES = [
  "",
  "advisory-board",
  "metrics-hub/ai-pulse",
  "analytics-hub/analysis",
  "api-keys",
  "api-management",
  "metrics-hub/api-metrics",
  "audit",
  "ai-hub/autopilot",
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
  "analytics-hub/k-benchmark",
  "launch-signal",
  "linkedin",
  "marketing",
  "strategy/master-plan",
  "moderation",
  "outreach",
  "platforms",
  "providers",
  "redaction-queue",
  "resources",
  "settings",
  "metrics-hub/signals",
  "metrics-hub/slo-dashboard",
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
