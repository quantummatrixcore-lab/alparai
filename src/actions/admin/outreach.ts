"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator, requireAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/utils/logger";
import type { Json } from "@/types/database";
import { processOutreachQueue } from "@/lib/audit/outreach-agent";
import { Resend } from "resend";

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

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "sent", "failed"]),
});

const createItemSchema = z.object({
  recipient_email: z.string().email(),
  recipient_name: z.string().nullable().optional(),
  template_type: z.enum(["media", "expert"]),
  subject: z.string().min(1),
  body_template: z.string().min(1),
  company: z.string().nullable().optional(),
});

export async function getOutreachQueue() {
  try {
    const user = await requireModerator();
    if (!user) throw new Error("Unauthorized");

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("outreach_queue")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Failed to fetch outreach queue", { error });
      throw error;
    }

    return data || [];
  } catch (error) {
    logger.error("getOutreachQueue error", undefined, error instanceof Error ? error : undefined);
    return [];
  }
}

export async function updateOutreachStatus(input: z.infer<typeof updateStatusSchema>) {
  try {
    const user = await requireModerator();
    if (!user) return { success: false, error: "Unauthorized" };

    const parsed = updateStatusSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const { id, status } = parsed.data;
    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from("outreach_queue")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      logger.error("Failed to update outreach status", { error: updateError, id });
      return { success: false, error: "Failed to update status" };
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "UPDATE_OUTREACH_STATUS",
      entity_type: "outreach_queue",
      entity_id: id,
      after_data: { status },
    });

    revalidatePath("/admin/outreach");
    revalidatePath("/tr/admin/outreach");
    revalidatePath("/de/admin/outreach");
    revalidatePath("/fr/admin/outreach");
    revalidatePath("/ru/admin/outreach");

    return { success: true };
  } catch (error) {
    logger.error(
      "updateOutreachStatus error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return { success: false, error: "Internal server error" };
  }
}

export async function createOutreachItem(input: z.infer<typeof createItemSchema>) {
  try {
    const user = await requireModerator();
    if (!user) return { success: false, error: "Unauthorized" };

    const parsed = createItemSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Invalid input" };

    const supabase = createAdminClient();

    const { data, error: insertError } = await (supabase as unknown as UnsafeClient)
      .from("outreach_queue")
      .insert({
        recipient_email: parsed.data.recipient_email,
        recipient_name: parsed.data.recipient_name || null,
        template_type: parsed.data.template_type,
        subject: parsed.data.subject,
        body_template: parsed.data.body_template,
        company: parsed.data.company || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      logger.error("Failed to create outreach item", { error: insertError });
      return { success: false, error: "Failed to create outreach item" };
    }

    await supabase.from("audit_log").insert({
      actor_id: user.id,
      action: "CREATE_OUTREACH_ITEM",
      entity_type: "outreach_queue",
      entity_id: data.id,
      after_data: parsed.data as unknown as Json,
    });

    revalidatePath("/admin/outreach");
    revalidatePath("/tr/admin/outreach");
    revalidatePath("/de/admin/outreach");
    revalidatePath("/fr/admin/outreach");
    revalidatePath("/ru/admin/outreach");

    return { success: true };
  } catch (error) {
    logger.error("createOutreachItem error", undefined, error instanceof Error ? error : undefined);
    return { success: false, error: "Internal server error" };
  }
}

export async function triggerOutreachQueueAction() {
  try {
    const user = await requireAdmin();
    if (!user) return { success: false, error: "Unauthorized" };

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return { success: false, error: "RESEND_API_KEY environment variable is not defined" };
    }

    const supabase = createAdminClient();
    const resend = new Resend(resendApiKey);

    const result = await processOutreachQueue(supabase, resend);

    revalidatePath("/[locale]/admin/outreach", "page");

    return { success: true, ...result };
  } catch (error) {
    logger.error(
      "triggerOutreachQueueAction error",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}

export async function processOutreachQueueAction() {
  return triggerOutreachQueueAction();
}
