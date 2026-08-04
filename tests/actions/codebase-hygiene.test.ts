import { describe, it, expect } from "vitest";
import { getCodebaseHygieneAction } from "@/actions/admin/codebase-hygiene";
import { checkCodebaseHygiene } from "../../scripts/codebase-hygiene";

describe("Codebase Hygiene & Context Pruning (Item 35)", () => {
  it("returns clean codebase hygiene report with optimal context status", async () => {
    const report = await getCodebaseHygieneAction();
    expect(report.contextStatus).toBe("OPTIMAL");
    expect(report.pruningScore).toBe(100);
    expect(report.totalSrcFiles).toBeGreaterThan(0);
    expect(report.graphifyNodeCount).toBeGreaterThan(0);
  });

  it("runs codebase hygiene check script successfully", () => {
    const res = checkCodebaseHygiene();
    expect(res.success).toBe(true);
    expect(res.strayFilesCount).toBe(0);
  });
});
