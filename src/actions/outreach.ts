"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import type { Json } from "@/types/database";

const outreachTargetSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  institution: z.string().min(1),
  email: z.string().email(),
  template_type: z.enum(["expert", "media", "researcher", "journalist"]),
  status: z.enum(["pending", "approved", "sent", "failed"]).default("pending"),
  subject: z.string().optional(),
  body_template: z.string().optional(),
});

export async function createOutreachTarget(input: z.infer<typeof outreachTargetSchema>) {
  try {
    const user = await requireModerator();
    if (!user) return { success: false, error: "Unauthorized" };

    const parsed = outreachTargetSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input schema" };

    const { name, role, institution, email, template_type, status, subject, body_template } =
      parsed.data;

    const mappedTemplateType =
      template_type === "journalist"
        ? "media"
        : template_type === "researcher"
          ? "expert"
          : template_type;

    const defaultSubject =
      mappedTemplateType === "media"
        ? "EU AI Act Article 73 & Independent AI Incident Registry (ALPAR AI)"
        : "Invitation: ALPAR AI Methodology Advisory Board (AI Security & Incident Auditing)";

    const defaultBody = `Dear ${name},\n\nALPAR AI (https://alparai.com) is an open-source trust infrastructure logging AI model vulnerabilities, hallucination incidents, and EU AI Act compliance signals.\n\nRole: ${role} at ${institution}.\n\nBest regards,\nErcüment Erden\nFounder, ALPAR AI\nercument.erden@alparai.com`;

    interface UnsafeClient {
      from: (table: string) => {
        insert: (data: Record<string, unknown>) => {
          select: () => {
            single: () => Promise<{
              data: { id: string };
              error: unknown;
            }>;
          };
        };
      };
    }

    const supabase = createAdminClient();
    const { data, error } = await (supabase as unknown as UnsafeClient)
      .from("outreach_queue")
      .insert({
        recipient_name: name,
        recipient_email: email,
        company: `${role} - ${institution}`,
        template_type: mappedTemplateType,
        subject: subject || defaultSubject,
        body_template: body_template || defaultBody,
        status: status || "pending",
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to insert outreach target", { error });
      return { success: false, error: "Database insert failed" };
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "CREATE_OUTREACH_TARGET",
      entity_type: "outreach_queue",
      entity_id: data.id,
      after_data: parsed.data as unknown as Json,
    });

    revalidatePath("/admin/outreach");
    return { success: true, data };
  } catch (error) {
    logger.error(
      "createOutreachTarget error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { success: false, error: "Internal server error" };
  }
}

export async function seedResearcherAndJournalistQueue() {
  try {
    const user = await requireModerator();
    if (!user) return { success: false, error: "Unauthorized" };

    const targets = [
      {
        name: "Stuart Russell",
        role: "AI Safety Researcher & Professor",
        institution: "UC Berkeley (CHAI)",
        email: "stuart.russell@cs.berkeley.edu",
        template_type: "researcher" as const,
        status: "pending" as const,
      },
      {
        name: "Max Tegmark",
        role: "President & AI Safety Researcher",
        institution: "Future of Life Institute / MIT",
        email: "max.tegmark@mit.edu",
        template_type: "researcher" as const,
        status: "pending" as const,
      },
      {
        name: "Cade Metz",
        role: "Senior AI Reporter",
        institution: "The New York Times",
        email: "cade.metz@nytimes.com",
        template_type: "journalist" as const,
        status: "pending" as const,
      },
      {
        name: "Melissa Heikkilä",
        role: "Senior AI Reporter",
        institution: "MIT Technology Review",
        email: "melissa.heikkila@technologyreview.com",
        template_type: "journalist" as const,
        status: "pending" as const,
      },
      {
        name: "Paul Christiano",
        role: "Founder & Alignment Researcher",
        institution: "Alignment Research Center (ARC)",
        email: "paul.christiano@alignment.org",
        template_type: "researcher" as const,
        status: "pending" as const,
      },
    ];

    const results = [];
    for (const target of targets) {
      const res = await createOutreachTarget(target);
      results.push(res);
    }

    return { success: true, inserted: results.length };
  } catch (error) {
    logger.error(
      "seedResearcherAndJournalistQueue error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { success: false, error: "Internal server error" };
  }
}
