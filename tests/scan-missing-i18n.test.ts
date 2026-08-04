import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const enPath = path.join(rootDir, "messages", "en.json");
const trPath = path.join(rootDir, "messages", "tr.json");

const enJson = JSON.parse(fs.readFileSync(enPath, "utf-8"));
const trJson = JSON.parse(fs.readFileSync(trPath, "utf-8"));

const adminEn = enJson.admin || {};
const adminTr = trJson.admin || {};

describe("Admin i18n Translation Key Audit", () => {
  it("ensures all admin keys in en.json exist in tr.json", () => {
    const missingInTr: string[] = [];
    for (const key of Object.keys(adminEn)) {
      if (adminTr[key] === undefined) {
        missingInTr.push(key);
      }
    }
    expect(missingInTr).toEqual([]);
  });

  it("ensures all admin keys in tr.json exist in en.json", () => {
    const missingInEn: string[] = [];
    for (const key of Object.keys(adminTr)) {
      if (adminEn[key] === undefined) {
        missingInEn.push(key);
      }
    }
    expect(missingInEn).toEqual([]);
  });

  it("scans src/components/admin/sidebar.tsx for missing translation keys", () => {
    const sidebarContent = fs.readFileSync(
      path.join(rootDir, "src", "components", "admin", "sidebar.tsx"),
      "utf-8",
    );
    const tMatches = [...sidebarContent.matchAll(/t\(["']([^"']+)["']\)/g)].map((m) => m[1]);

    const missing: string[] = [];
    for (const key of tMatches) {
      if (!key) continue;
      if (adminEn[key] === undefined || adminTr[key] === undefined) {
        missing.push(key);
      }
    }
    expect(missing).toEqual([]);
  });
});
