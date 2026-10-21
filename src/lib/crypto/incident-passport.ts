import crypto from "node:crypto";

/**
 * W3C Verifiable Credential Incident Passport & ISO/IEC 27037 Digital Forensics Attestation
 *
 * Provides cryptographic integrity, chain of custody, and tamper-evident proof
 * for AI safety incidents under EU AI Act Article 73 & ISO/IEC 27037 norms.
 */

export interface ISO27037ChainOfCustodyRecord {
  timestamp: string;
  action: string;
  actor: string;
  hash: string;
}

export interface ISO27037ChainOfCustody {
  standard: "ISO/IEC 27037:2012";
  evidenceId: string;
  custodian: string;
  acquisitionTimestamp: string;
  hashAlgorithm: "SHA-256" | "SHA-384";
  dataIntegrityHash: string;
  verificationStatus: "VERIFIED" | "PENDING";
  jurisdiction: string;
  chainOfCustodyRecord?: ISO27037ChainOfCustodyRecord[];
}

export interface W3CCredentialProof {
  type: "DataIntegrityProof" | "JsonWebSignature2020" | "HmacSha384Verification2026";
  created: string;
  proofPurpose: "assertionMethod";
  verificationMethod: string;
  digestAlgorithm: "HMAC-SHA384" | "SHA-256";
  proofValue: string;
  jws?: string;
}

export interface IncidentPassport {
  // W3C Verifiable Credential Specification
  "@context": string[];
  type: string[];
  id?: string;
  issuer?: string;
  issuanceDate?: string;

  // Forensic & Cryptographic Seals
  iso27037ChainOfCustody: ISO27037ChainOfCustody;
  proof: W3CCredentialProof;

  // Backward-Compatible Incident Passport Base Metadata
  meta: {
    generated_at: string;
    passport_version: "1.0";
    alpar_provenance: string;
    compliance_framework: "EU AI Act Article 73";
  };
  incident: {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    status: string;
    incident_date: string | null;
    created_at: string;
    updated_at: string | null;
    language: string;
    location_country: string | null;
    source_url: string | null;
  };
  provider: {
    name: string;
    slug: string;
  } | null;
  model: {
    name: string;
  } | null;
  eu_ai_act: {
    risk_category: string | null;
    serious_incident_class: string | null;
    high_risk_system_category: string | null;
    reporting_deadline_days: number | null;
  };
  assessment: {
    truth_score: number | null;
    confidence: number | null;
    reasoning: string | null;
    model: string | null;
  };
  evidence: Array<{
    file_name: string;
    file_path: string;
    mime_type: string | null;
  }>;
  engagement: {
    views: number;
    upvotes: number;
    shares: number;
    comments: number;
  };
}

export type BaseIncidentPassport = Omit<
  IncidentPassport,
  "@context" | "type" | "iso27037ChainOfCustody" | "proof" | "id" | "issuer" | "issuanceDate"
>;

/**
 * Deterministically serializes objects into canonical RFC 8785 (JCS) representation.
 */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalJsonStringify(item)).join(",") + "]";
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const entries = keys.map(
    (k) => `${JSON.stringify(k)}:${canonicalJsonStringify((obj as Record<string, unknown>)[k])}`,
  );
  return "{" + entries.join(",") + "}";
}

/**
 * Computes a cryptographic seal using HMAC-SHA384 or SHA-256 over normalized canonical payload.
 */
export function computePassportSeal(
  canonicalPayload: string,
  secretKey: string = process.env.INCIDENT_PASSPORT_SECRET || "alpar-default-passport-hmac-secret-v1",
  algorithm: "HMAC-SHA384" | "SHA-256" = "HMAC-SHA384",
): { proofValue: string; digestAlgorithm: "HMAC-SHA384" | "SHA-256" } {
  if (algorithm === "HMAC-SHA384") {
    const hmac = crypto.createHmac("sha384", secretKey);
    hmac.update(canonicalPayload);
    return {
      proofValue: hmac.digest("hex"),
      digestAlgorithm: "HMAC-SHA384",
    };
  } else {
    const hash = crypto.createHash("sha256");
    hash.update(canonicalPayload);
    return {
      proofValue: hash.digest("hex"),
      digestAlgorithm: "SHA-256",
    };
  }
}

/**
 * Enriches an incident passport with W3C Verifiable Credential fields,
 * ISO/IEC 27037 chain of custody, and a cryptographic HMAC-SHA384 / SHA-256 seal.
 */
export function enrichIncidentPassport(
  base: BaseIncidentPassport,
  secretKey?: string,
  algorithm: "HMAC-SHA384" | "SHA-256" = "HMAC-SHA384",
): IncidentPassport {
  const timestamp = base.meta?.generated_at || new Date().toISOString();
  const incidentId = base.incident?.id || "unknown";

  // 1. ISO/IEC 27037 Forensic Evidence Digest
  const canonicalContent = canonicalJsonStringify({
    incident: base.incident,
    assessment: base.assessment,
    evidence: base.evidence,
    eu_ai_act: base.eu_ai_act,
  });
  const dataIntegrityHash = crypto.createHash("sha256").update(canonicalContent).digest("hex");

  const iso27037ChainOfCustody: ISO27037ChainOfCustody = {
    standard: "ISO/IEC 27037:2012",
    evidenceId: `EVID-${incidentId}`,
    custodian: "ALPAR AI Digital Forensics Unit",
    acquisitionTimestamp: timestamp,
    hashAlgorithm: "SHA-256",
    dataIntegrityHash,
    verificationStatus: "VERIFIED",
    jurisdiction: "EU / TR Cross-Border AI Liability Framework",
    chainOfCustodyRecord: [
      {
        timestamp,
        action: "Evidence Acquisition and Cryptographic Hash Sealing",
        actor: "ALPAR AI Forensic Attestation Engine",
        hash: dataIntegrityHash,
      },
    ],
  };

  // 2. Prepare W3C Verifiable Credential Structure
  const payloadToSign = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://alparai.com/contexts/incident-passport-v1.jsonld",
    ],
    type: ["VerifiableCredential", "AlparIncidentPassport"],
    id: `urn:alpar:incident:${incidentId}`,
    issuer: "https://alparai.com/issuers/alpar-authority",
    issuanceDate: timestamp,
    iso27037ChainOfCustody,
    meta: base.meta,
    incident: base.incident,
    provider: base.provider,
    model: base.model,
    eu_ai_act: base.eu_ai_act,
    assessment: base.assessment,
    evidence: base.evidence,
    engagement: base.engagement,
  };

  // 3. Compute Cryptographic Seal (HMAC-SHA384 / SHA-256)
  const seal = computePassportSeal(canonicalJsonStringify(payloadToSign), secretKey, algorithm);

  const proof: W3CCredentialProof = {
    type: "DataIntegrityProof",
    created: timestamp,
    proofPurpose: "assertionMethod",
    verificationMethod: "https://alparai.com/issuers/alpar-authority#key-1",
    digestAlgorithm: seal.digestAlgorithm,
    proofValue: seal.proofValue,
  };

  return {
    ...payloadToSign,
    proof,
  };
}

/**
 * Cryptographically verifies an enriched W3C Verifiable Credential Incident Passport.
 */
export function verifyIncidentPassport(
  passport: IncidentPassport,
  secretKey?: string,
): { valid: boolean; error?: string } {
  if (
    !passport["@context"] ||
    !passport["@context"].includes("https://www.w3.org/2018/credentials/v1")
  ) {
    return { valid: false, error: "Missing or invalid W3C @context" };
  }
  if (
    !passport.type ||
    !passport.type.includes("VerifiableCredential") ||
    !passport.type.includes("AlparIncidentPassport")
  ) {
    return { valid: false, error: "Missing or invalid W3C credential type" };
  }
  if (
    !passport.iso27037ChainOfCustody ||
    passport.iso27037ChainOfCustody.standard !== "ISO/IEC 27037:2012"
  ) {
    return { valid: false, error: "Missing or invalid ISO/IEC 27037 chain of custody" };
  }
  if (!passport.proof || !passport.proof.proofValue) {
    return { valid: false, error: "Missing cryptographic proof seal" };
  }

  // 1. Verify ISO/IEC 27037 Evidence Digest
  const canonicalContent = canonicalJsonStringify({
    incident: passport.incident,
    assessment: passport.assessment,
    evidence: passport.evidence,
    eu_ai_act: passport.eu_ai_act,
  });
  const expectedDataHash = crypto.createHash("sha256").update(canonicalContent).digest("hex");
  if (passport.iso27037ChainOfCustody.dataIntegrityHash !== expectedDataHash) {
    return { valid: false, error: "ISO/IEC 27037 data integrity hash mismatch" };
  }

  // 2. Verify Cryptographic Proof Seal
  const { proof, ...unsignedPayload } = passport;
  const seal = computePassportSeal(
    canonicalJsonStringify(unsignedPayload),
    secretKey,
    proof.digestAlgorithm,
  );

  if (seal.proofValue !== proof.proofValue) {
    return { valid: false, error: "Cryptographic proof signature mismatch" };
  }

  return { valid: true };
}
