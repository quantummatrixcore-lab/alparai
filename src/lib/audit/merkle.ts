import "server-only";
import { createHash } from "node:crypto";

// FAZ2: SHA-384 Merkle kökü + TSA staged makbuzu.
// Gerçek TSA gönderimi yok; kök deterministik, makbuz "staged" damgalı.
// Kabul: 1 bayt değişince kök değişir, aynı girdide kök sabittir.

export function sha384Hex(input: string): string {
  return createHash("sha384").update(input, "utf8").digest("hex");
}

export function merkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return sha384Hex("alparai:empty");
  let level = leaves.map((l) => sha384Hex(l));
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i] as string;
      const b = (level[i + 1] ?? level[i]) as string;
      next.push(sha384Hex(a + b));
    }
    level = next;
  }
  return level[0] as string;
}

export interface TsaReceipt {
  root: string;
  leafCount: number;
  stagedAt: string;
  tsa: "staged";
  algorithm: "SHA-384";
}

export function stageTsaReceipt(leaves: string[]): TsaReceipt {
  return {
    root: merkleRoot(leaves),
    leafCount: leaves.length,
    stagedAt: new Date().toISOString(),
    tsa: "staged",
    algorithm: "SHA-384",
  };
}
