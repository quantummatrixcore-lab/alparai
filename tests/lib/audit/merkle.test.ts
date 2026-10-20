import { describe, expect, it } from "vitest";
import { merkleRoot, sha384Hex, stageTsaReceipt } from "@/lib/audit/merkle";

describe("Merkle + TSA receipt", () => {
  it("sha384 is stable", () => {
    expect(sha384Hex("alparai")).toBe(sha384Hex("alparai"));
  });
  it("1 byte change flips root", () => {
    expect(merkleRoot(["a", "b"])).not.toBe(merkleRoot(["a", "c"]));
  });
  it("staged receipt carries root + count", () => {
    const r = stageTsaReceipt(["x", "y", "z"]);
    expect(r.leafCount).toBe(3);
    expect(r.tsa).toBe("staged");
    expect(r.root.length).toBeGreaterThan(32);
  });
});
