"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { createServerClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";
import { maskPII } from "@/lib/pii/guardian";
import { checkRateLimit, RATE_LIMIT_KEYS } from "@/lib/utils/rate-limit";
import { validateZkpProofStructure, verifyWhistleblowerReceipt } from "@/lib/crypto/zkp-crypto";

const createWhistleblowerSchema = z.object({
  encryptedPayload: z.string().min(10, "Encrypted payload is required"),
  category: z.string().min(1, "Category is required").max(50),
  providerHint: z.string().max(200).optional().nullable(),
  zkpCommitment: z.string().startsWith("zkp_c_").length(70, "Invalid commitment hash length"),
  nullifierHash: z.string().startsWith("zkp_n_").length(70, "Invalid nullifier hash length"),
  proofToken: z.string().startsWith("zkp_p_").length(38, "Invalid proof token length"),
  zeroDayRisk: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"]).optional().default("NONE"),
});

export type CreateWhistleblowerInput = z.infer<typeof createWhistleblowerSchema>;

export interface CreateWhistleblowerResult {
  ok: boolean;
  submissionId?: string;
  commitment?: string;
  error?: string;
}

export interface VerifyReceiptResult {
  ok: boolean;
  status?: string;
  submittedAt?: string;
  category?: string;
  error?: string;
}

/**
 * Server Action: Submit an anonymous E2EE encrypted whistleblower incident
 * authenticated via Zero-Knowledge Proof (ZKP) commitment & nullifier.
 */
export async function createWhistleblowerIncidentAction(
  rawInput: unknown,
): Promise<CreateWhistleblowerResult> {
  try {
    const parseResult = createWhistleblowerSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        ok: false,
        error: parseResult.error.issues.map((i) => i.message).join(", "),
      };
    }

    const data = parseResult.data;

    // 1. Enforce IP Rate Limiting
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = await checkRateLimit(`${RATE_LIMIT_KEYS.whistleblower_submission}:${ip}`);
    if (!rl.ok) {
      return {
        ok: false,
        error: `Rate limit exceeded. Please try again in ${rl.retryAfter}s.`,
      };
    }

    // 2. Cryptographic ZKP Structure Verification
    const zkpCheck = validateZkpProofStructure(
      data.zkpCommitment,
      data.nullifierHash,
      data.proofToken,
    );

    if (!zkpCheck.valid) {
      logger.warn("[createWhistleblowerIncidentAction] Invalid ZKP proof structure", {
        reason: zkpCheck.error,
      });
      return { ok: false, error: zkpCheck.error || "Cryptographic proof rejected" };
    }

    // 3. Mask PII in provider hint
    const sanitizedHint = data.providerHint ? maskPII(data.providerHint).masked : null;

    // 4. Supabase DB Persistence
    const supabase = await createServerClient();

    // Check for nullifier replay (double-spending / replay attack)
    const { data: existingNullifier } = await supabase
      .from("whistleblower_submissions")
      .select("id")
      .eq("nullifier_hash", data.nullifierHash)
      .maybeSingle();

    if (existingNullifier) {
      return {
        ok: false,
        error: "Nullifier collision: This cryptographic proof has already been submitted.",
      };
    }

    const generatedId = randomUUID();
    const { error: insertError } = await supabase.from("whistleblower_submissions").insert({
      id: generatedId,
      encrypted_content: data.encryptedPayload,
      category: data.category,
      provider_hint: sanitizedHint,
      zkp_commitment: data.zkpCommitment,
      nullifier_hash: data.nullifierHash,
      proof_metadata: {
        proof_token: data.proofToken,
        client_timestamp: new Date().toISOString(),
      },
      zero_day_risk: data.zeroDayRisk,
      status: "pending",
    });

    if (insertError) {
      logger.error("[createWhistleblowerIncidentAction] DB Insert Failed", {
        message: insertError.message,
      });
      return { ok: false, error: "Failed to securely record whistleblower report." };
    }

    return {
      ok: true,
      submissionId: generatedId,
      commitment: data.zkpCommitment,
    };
  } catch (error) {
    logger.error(
      "[createWhistleblowerIncidentAction] Unhandled failure",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { ok: false, error: "Internal server error occurred." };
  }
}

/**
 * Server Action: Verify report status using the whistleblower's secret receipt.
 * Allows anonymous sources to verify that their report is being audited without
 * breaking anonymity.
 */
export async function verifyWhistleblowerReceiptAction(
  submissionId: string,
  receipt: string,
): Promise<VerifyReceiptResult> {
  try {
    if (!submissionId || !receipt) {
      return { ok: false, error: "Submission ID and receipt string are required." };
    }

    const supabase = await createServerClient();
    const { data: record, error } = await supabase
      .from("whistleblower_submissions")
      .select("id, encrypted_content, zkp_commitment, status, submitted_at, category")
      .eq("id", submissionId)
      .maybeSingle();

    if (error || !record) {
      return { ok: false, error: "Submission record not found." };
    }

    if (!record.zkp_commitment) {
      return { ok: false, error: "Record does not support ZKP receipt verification." };
    }

    const verification = await verifyWhistleblowerReceipt(
      receipt,
      record.encrypted_content,
      record.zkp_commitment,
    );

    if (!verification.valid) {
      return { ok: false, error: verification.error || "Invalid cryptographic receipt." };
    }

    return {
      ok: true,
      status: record.status,
      submittedAt: record.submitted_at,
      category: record.category,
    };
  } catch (error) {
    logger.error(
      "[verifyWhistleblowerReceiptAction] Failed",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { ok: false, error: "Failed to verify receipt." };
  }
}