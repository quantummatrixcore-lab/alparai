import { logger } from "@/lib/utils/logger";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ClaimAndRespondTriggerInput {
  incidentId: string;
  providerId: string | null;
  modelId: string | null;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Claim & Respond Automated Trigger (MASTER_PLAN v11.18 Action 1)
 *
 * When an incident with severity 'high' or 'critical' is published,
 * automatically generates a Claim & Respond alert payload for the provider's
 * Trust & Safety team with a claim/response link.
 */
export async function triggerClaimAndRespondAlert(
  input: ClaimAndRespondTriggerInput,
): Promise<{ triggered: boolean; alertId?: string; reason?: string }> {
  // Only trigger automatically for high or critical incidents
  if (input.severity !== "high" && input.severity !== "critical") {
    return {
      triggered: false,
      reason: "Severity below trigger threshold (requires high or critical)",
    };
  }

  const supabase = createAdminClient();

  try {
    // 1. Fetch provider details if providerId is supplied
    let providerEmail: string | null = null;
    let providerName = "AI Provider";

    if (input.providerId) {
      const { data: provider } = await supabase
        .from("ai_providers")
        .select("name, contact_email")
        .eq("id", input.providerId)
        .maybeSingle();

      if (provider) {
        providerName = provider.name;
        providerEmail = provider.contact_email ?? null;
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
    const claimUrl = `${appUrl}/en/incidents/${input.incidentId}?claim=true`;

    logger.info(
      `[ClaimAndRespond] Alert generated for ${providerName} on Incident ${input.incidentId}`,
      {
        incidentId: input.incidentId,
        severity: input.severity,
        providerEmail: providerEmail ?? "simulated-trust-and-safety@provider.com",
        claimUrl,
      },
    );

    // 2. Queue into outreach queue table for record keeping
    const { data: queued, error: queueErr } = await supabase
      .from("outreach_queue")
      .insert({
        recipient_email:
          providerEmail ?? `safety@${providerName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        recipient_name: providerName,
        subject: `[ALPAR AI Alert] High-Severity Incident Reported: "${input.title.slice(0, 60)}"`,
        template_type: "provider_ts_contact",
        body_template: `A high-severity incident (${input.severity.toUpperCase()}) involving ${providerName} has been reported and published on ALPAR AI.\n\nClaim your provider profile and submit an official response here:\n${claimUrl}`,
        status: "pending",
      })
      .select("id")
      .maybeSingle();

    if (queueErr) {
      logger.warn(`[ClaimAndRespond] Could not insert into outreach_queue`, {
        error: queueErr.message,
      });
      return {
        triggered: true,
        reason: "Alert generated and logged, outreach queue insert bypassed",
      };
    }

    return {
      triggered: true,
      alertId: queued?.id,
    };
  } catch (err) {
    logger.error(
      `[ClaimAndRespond] Failed to trigger alert`,
      {},
      err instanceof Error ? err : undefined,
    );
    return { triggered: false, reason: err instanceof Error ? err.message : "Unknown error" };
  }
}
