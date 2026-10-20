import { describe, expect, it } from "vitest";
import { computeEvidenceHash } from "@/lib/import/incident-importer";

describe("evidence_hash (sayaç mührü)", () => {
  it("is deterministic for the same record", () => {
    const a = computeEvidenceHash({ source: "aiaaic_import", externalId: "X-1", title: "Test" });
    const b = computeEvidenceHash({ source: "aiaaic_import", externalId: "X-1", title: "Test" });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
  it("changes when source, id or title change", () => {
    const base = { source: "aiaaic_import", externalId: "X-1", title: "Test" };
    expect(computeEvidenceHash({ ...base, externalId: "X-2" })).not.toBe(computeEvidenceHash(base));
    expect(computeEvidenceHash({ ...base, title: "Other" })).not.toBe(computeEvidenceHash(base));
    expect(computeEvidenceHash({ ...base, source: "aiid_import" })).not.toBe(
      computeEvidenceHash(base),
    );
  });
  it("tolerates null fields without crashing", () => {
    expect(() => computeEvidenceHash({ source: "x", externalId: null, title: null })).not.toThrow();
  });
});
