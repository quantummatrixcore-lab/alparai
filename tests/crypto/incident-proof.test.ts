import { describe, it, expect } from "vitest";
import {
  generateIncidentMerkleProof,
  verifyIncidentMerkleProof,
} from "@/lib/crypto/incident-proof";

describe("Incident Proof Merkle Tree", () => {
  it("generates a valid Merkle proof with leaf hashes and root", () => {
    const payload = {
      incidentId: "inc-001",
      titleMasked: "AI hallucinated false medical advice",
      descriptionMasked: "Model suggested incorrect dosage for patient",
      modelId: "gpt-4o",
      providerId: "openai",
      timestamp: "2026-08-26T12:00:00Z",
      evidenceHashes: ["a1b2c3d4e5f6", "f6e5d4c3b2a1"],
      piiCategories: ["phone_tr", "email"],
    };

    const proof = generateIncidentMerkleProof(payload);
    expect(proof.leafCount).toBeGreaterThan(5);
    expect(proof.merkleRoot).toHaveLength(64);
    expect(proof.algorithm).toBe("SHA-256");

    const isValid = verifyIncidentMerkleProof(proof);
    expect(isValid).toBe(true);
  });

  it("fails verification if proof leaves are tampered", () => {
    const payload = {
      incidentId: "inc-002",
      titleMasked: "Safe title",
      descriptionMasked: "Safe desc",
      timestamp: "2026-08-26T12:00:00Z",
      evidenceHashes: [],
      piiCategories: [],
    };

    const proof = generateIncidentMerkleProof(payload);
    proof.leaves[0] = "0000000000000000000000000000000000000000000000000000000000000000";
    const isValid = verifyIncidentMerkleProof(proof);
    expect(isValid).toBe(false);
  });
});
