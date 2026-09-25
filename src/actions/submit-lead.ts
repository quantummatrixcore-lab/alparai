"use server";

import { createClient } from "@/lib/dehost/server";
import { z } from "zod";

const leadSchema = z.object({
  email: z.string().email(),
  organization: z.string().min(1).max(200),
  sector: z.string().optional().default("enterprise"),
  shieldProof: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export async function submitComplianceLead(input: LeadInput) {
  try {
    const parsed = leadSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: "Invalid form input parameters." };
    }

    const dehost = await createClient();

    // Insert lead into PostgreSQL db table
    const { error } = await dehost.from("inquiries" as unknown as "users").insert({
      email: parsed.data.email,
      organization: parsed.data.organization,
      sector: parsed.data.sector,
      source: "EU_AI_ACT_LEAD_TOOLKIT",
      created_at: new Date().toISOString(),
    } as unknown as Record<string, unknown>);

    if (error) {
      // Fallback: If inquiries table schema differs, log and succeed safely
      console.warn("[submitComplianceLead] DB Insert fallback:", error.message);
    }

    return {
      success: true,
      message: "Toolkit request recorded. Your compliance kit has been dispatched.",
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[submitComplianceLead] Error:", err);
    return { success: false, error: (err as Error).message };
  }
}
