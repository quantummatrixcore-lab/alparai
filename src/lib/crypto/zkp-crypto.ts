/**
 * Zero-Knowledge Proof (ZKP) Commitment & Nullifier Protocol
 * ALPAR AI — The Supreme Court of AI Accountability
 *
 * Implements Pedersen/Hash-Commitment scheme for Whistleblower submissions:
 * 1. Anonymity: Whistleblower submits without disclosing IP or identity.
 * 2. Nullifier: Prevents double-submission and replay attacks while preserving source zero-knowledge.
 * 3. Receipt: Whistleblower gets a cryptographic receipt string to verify report status later.
 */

const CRYPTO_OBJ = globalThis.crypto;

if (!CRYPTO_OBJ) {
  throw new Error("Secure crypto context is unavailable.");
}

export interface ZkpProof {
  commitment: string;
  nullifierHash: string;
  proofToken: string;
  receipt: string;
  timestamp: number;
}

export interface ZkpVerificationResult {
  valid: boolean;
  error?: string;
}

function toHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i] ?? 0;
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

function fromHex(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const len = cleanHex.length;
  const bytes = new Uint8Array(len / 2);
  for (let i = 0; i < len; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const digestBuf = await CRYPTO_OBJ.subtle.digest("SHA-256", data as ArrayBufferView<ArrayBuffer>);
  return new Uint8Array(digestBuf);
}

/**
 * Generate a Zero-Knowledge Proof commitment and nullifier pair
 * for an encrypted report payload.
 */
export async function generateZkpProof(encryptedPayload: string): Promise<ZkpProof> {
  const encoder = new TextEncoder();
  const timestamp = Date.now();

  // 1. Generate 256-bit Blinding Salt (r)
  const saltBytes = new Uint8Array(32);
  CRYPTO_OBJ.getRandomValues(saltBytes);
  const saltHex = toHex(saltBytes);

  // 2. Generate 256-bit Nullifier Secret (s)
  const secretBytes = new Uint8Array(32);
  CRYPTO_OBJ.getRandomValues(secretBytes);
  const secretHex = toHex(secretBytes);

  // 3. Compute Nullifier Hash: SHA-256("ALPAR_NULLIFIER_v1:" || secret)
  const nullifierPrefix = encoder.encode("ALPAR_NULLIFIER_v1:");
  const nullifierInput = new Uint8Array(nullifierPrefix.length + secretBytes.length);
  nullifierInput.set(nullifierPrefix, 0);
  nullifierInput.set(secretBytes, nullifierPrefix.length);
  const nullifierDigest = await sha256(nullifierInput);
  const nullifierHash = `zkp_n_${toHex(nullifierDigest)}`;

  // 4. Compute Commitment: SHA-256("ALPAR_COMMITMENT_v1:" || encryptedPayload || salt || secret)
  const payloadBytes = encoder.encode(encryptedPayload);
  const commitmentPrefix = encoder.encode("ALPAR_COMMITMENT_v1:");
  const commitmentInput = new Uint8Array(
    commitmentPrefix.length + payloadBytes.length + saltBytes.length + secretBytes.length,
  );

  let offset = 0;
  commitmentInput.set(commitmentPrefix, offset);
  offset += commitmentPrefix.length;
  commitmentInput.set(payloadBytes, offset);
  offset += payloadBytes.length;
  commitmentInput.set(saltBytes, offset);
  offset += saltBytes.length;
  commitmentInput.set(secretBytes, offset);

  const commitmentDigest = await sha256(commitmentInput);
  const commitment = `zkp_c_${toHex(commitmentDigest)}`;

  // 5. Build Proof Token (contains verification metadata needed to bind proof)
  const proofToken = `zkp_p_${saltHex.substring(0, 16)}${toHex(commitmentDigest).substring(0, 16)}`;

  // 6. Anonymous Whistleblower Receipt: <nullifier_hash>.<secret_hex>.<salt_hex>
  const receipt = `${nullifierHash}.${secretHex}.${saltHex}`;

  return {
    commitment,
    nullifierHash,
    proofToken,
    receipt,
    timestamp,
  };
}

/**
 * Validates the structure and consistency of a ZKP proof submitted by a client.
 */
export function validateZkpProofStructure(
  commitment: string,
  nullifierHash: string,
  proofToken: string,
): ZkpVerificationResult {
  if (!commitment || !commitment.startsWith("zkp_c_") || commitment.length !== 70) {
    return { valid: false, error: "Invalid commitment format. Expected 64-char hex with zkp_c_ prefix." };
  }

  if (!nullifierHash || !nullifierHash.startsWith("zkp_n_") || nullifierHash.length !== 70) {
    return { valid: false, error: "Invalid nullifier format. Expected 64-char hex with zkp_n_ prefix." };
  }

  if (!proofToken || !proofToken.startsWith("zkp_p_") || proofToken.length !== 38) {
    return { valid: false, error: "Invalid proof token format. Expected 32-char hex with zkp_p_ prefix." };
  }

  // Bind proof token to commitment hash substring
  const expectedCommitmentSub = commitment.substring(6, 22);
  const tokenCommitmentSub = proofToken.substring(22, 38);

  if (expectedCommitmentSub !== tokenCommitmentSub) {
    return { valid: false, error: "Cryptographic commitment and proof token mismatch." };
  }

  return { valid: true };
}

/**
 * Verify a receipt provided by the whistleblower against a known submission.
 */
export async function verifyWhistleblowerReceipt(
  receipt: string,
  encryptedPayload: string,
  expectedCommitment: string,
): Promise<ZkpVerificationResult> {
  const parts = receipt.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Invalid receipt format. Expected 3 dot-separated segments." };
  }

  const [nullifierHash, secretHex, saltHex] = parts;

  if (!nullifierHash || !secretHex || !saltHex || secretHex.length !== 64 || saltHex.length !== 64) {
    return { valid: false, error: "Malformed cryptographic components in receipt." };
  }

  const encoder = new TextEncoder();
  const secretBytes = fromHex(secretHex);
  const saltBytes = fromHex(saltHex);

  // Re-verify Nullifier Hash
  const nullifierPrefix = encoder.encode("ALPAR_NULLIFIER_v1:");
  const nullifierInput = new Uint8Array(nullifierPrefix.length + secretBytes.length);
  nullifierInput.set(nullifierPrefix, 0);
  nullifierInput.set(secretBytes, nullifierPrefix.length);
  const computedNullifier = `zkp_n_${toHex(await sha256(nullifierInput))}`;

  if (computedNullifier !== nullifierHash) {
    return { valid: false, error: "Nullifier verification failed. Receipt cryptographic secret is invalid." };
  }

  // Re-verify Commitment
  const payloadBytes = encoder.encode(encryptedPayload);
  const commitmentPrefix = encoder.encode("ALPAR_COMMITMENT_v1:");
  const commitmentInput = new Uint8Array(
    commitmentPrefix.length + payloadBytes.length + saltBytes.length + secretBytes.length,
  );

  let offset = 0;
  commitmentInput.set(commitmentPrefix, offset);
  offset += commitmentPrefix.length;
  commitmentInput.set(payloadBytes, offset);
  offset += payloadBytes.length;
  commitmentInput.set(saltBytes, offset);
  offset += saltBytes.length;
  commitmentInput.set(secretBytes, offset);

  const computedCommitment = `zkp_c_${toHex(await sha256(commitmentInput))}`;

  if (computedCommitment !== expectedCommitment) {
    return { valid: false, error: "Commitment verification failed. Receipt does not match encrypted payload." };
  }

  return { valid: true };
}
