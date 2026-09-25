import { describe, it, expect } from "vitest";
import {
  generateZkpProof,
  validateZkpProofStructure,
  verifyWhistleblowerReceipt,
} from "../../src/lib/crypto/zkp-crypto";

describe("Whistleblower Zero-Knowledge Proof (ZKP) Cryptographic Security", () => {
  const dummyPayload = "WGCM$mockEncryptedPayloadAES256GCMZeroDayVulnerabilityProof";

  it("generates mathematically valid ZKP commitments and nullifier hashes", async () => {
    const proof = await generateZkpProof(dummyPayload);

    expect(proof.commitment).toMatch(/^zkp_c_[0-9a-f]{64}$/);
    expect(proof.nullifierHash).toMatch(/^zkp_n_[0-9a-f]{64}$/);
    expect(proof.proofToken).toMatch(/^zkp_p_[0-9a-f]{32}$/);
    expect(proof.receipt).toBeDefined();

    const receiptParts = proof.receipt.split(".");
    expect(receiptParts).toHaveLength(3);
    expect(receiptParts[0]).toBe(proof.nullifierHash);
    expect(receiptParts[1]).toHaveLength(64); // 256-bit secret hex
    expect(receiptParts[2]).toHaveLength(64); // 256-bit salt hex
  });

  it("validates genuine proof structure successfully", async () => {
    const proof = await generateZkpProof(dummyPayload);
    const result = validateZkpProofStructure(
      proof.commitment,
      proof.nullifierHash,
      proof.proofToken,
    );

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects tampered or forged commitment hashes", async () => {
    const proof = await generateZkpProof(dummyPayload);
    const forgedCommitment = `zkp_c_${"0".repeat(64)}`;

    const result = validateZkpProofStructure(
      forgedCommitment,
      proof.nullifierHash,
      proof.proofToken,
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain("mismatch");
  });

  it("verifies genuine whistleblower receipt against payload and commitment", async () => {
    const proof = await generateZkpProof(dummyPayload);
    const verifyResult = await verifyWhistleblowerReceipt(
      proof.receipt,
      dummyPayload,
      proof.commitment,
    );

    expect(verifyResult.valid).toBe(true);
    expect(verifyResult.error).toBeUndefined();
  });

  it("rejects receipt verification if encrypted payload has been tampered with", async () => {
    const proof = await generateZkpProof(dummyPayload);
    const tamperedPayload = dummyPayload + "_altered";

    const verifyResult = await verifyWhistleblowerReceipt(
      proof.receipt,
      tamperedPayload,
      proof.commitment,
    );

    expect(verifyResult.valid).toBe(false);
    expect(verifyResult.error).toContain("Commitment verification failed");
  });

  it("rejects receipt with forged secret or malformed format", async () => {
    const proof = await generateZkpProof(dummyPayload);
    const forgedReceipt = `${proof.nullifierHash}.${"f".repeat(64)}.${"0".repeat(64)}`;

    const verifyResult = await verifyWhistleblowerReceipt(
      forgedReceipt,
      dummyPayload,
      proof.commitment,
    );

    expect(verifyResult.valid).toBe(false);
    expect(verifyResult.error).toContain("Nullifier verification failed");
  });
});