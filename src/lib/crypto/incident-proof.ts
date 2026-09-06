import crypto from "node:crypto";

export interface IncidentProofPayload {
  incidentId: string;
  titleMasked: string;
  descriptionMasked: string;
  modelId?: string;
  providerId?: string;
  timestamp: string;
  evidenceHashes: string[];
  piiCategories: string[];
}

export interface MerkleProof {
  leafCount: number;
  leaves: string[];
  merkleRoot: string;
  proofHash: string;
  algorithm: "SHA-256";
  generatedAt: string;
  schemaVersion: "1.0.0";
}

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function generateIncidentMerkleProof(payload: IncidentProofPayload): MerkleProof {
  const leaves: string[] = [
    sha256("incidentId:" + payload.incidentId),
    sha256("title:" + payload.titleMasked),
    sha256("desc:" + payload.descriptionMasked),
    sha256("model:" + (payload.modelId || "unspecified")),
    sha256("provider:" + (payload.providerId || "unspecified")),
    sha256("time:" + payload.timestamp),
    sha256("pii:" + payload.piiCategories.sort().join(",")),
    ...payload.evidenceHashes.map((h, i) => sha256("evidence_" + i + ":" + h)),
  ];

  let currentLevel = [...leaves];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i]!;
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1]! : left;
      nextLevel.push(sha256(left + right));
    }
    currentLevel = nextLevel;
  }

  const merkleRoot = currentLevel[0] || sha256("");
  const generatedAt = new Date().toISOString();
  const proofHash = sha256(merkleRoot + ":" + generatedAt);

  return {
    leafCount: leaves.length,
    leaves,
    merkleRoot,
    proofHash,
    algorithm: "SHA-256",
    generatedAt,
    schemaVersion: "1.0.0",
  };
}

export function verifyIncidentMerkleProof(proof: MerkleProof): boolean {
  if (proof.leaves.length === 0) return false;
  let currentLevel = [...proof.leaves];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i]!;
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1]! : left;
      nextLevel.push(sha256(left + right));
    }
    currentLevel = nextLevel;
  }
  const recalculatedRoot = currentLevel[0];
  return recalculatedRoot === proof.merkleRoot;
}
