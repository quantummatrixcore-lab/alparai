import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/email/resend";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

async function getHandler(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    process.env.NODE_ENV !== "production";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com";
  const resend = getResendClient();
  const supabase = createAdminClient();

  try {
    // 1. Process PENDING previews -> Send preview email, transition to 'sent'
    const { data: pending, error: pendingErr } = await supabase
      .from("k_provider_previews")
      .select("id, preview_token, expires_at, ai_providers(name, contact_email)")
      .eq("status", "pending");

    if (pendingErr) throw pendingErr;

    const sentIds: string[] = [];
    if (pending && pending.length > 0) {
      for (const item of pending) {
        const provider = item.ai_providers as unknown as {
          name: string;
          contact_email: string;
        } | null;
        if (!provider || !provider.contact_email) {
          logger.warn(`[K-ProviderPreview] Missing provider email for preview: ${item.id}`);
          continue;
        }

        const expiresDate = new Date(item.expires_at).toUTCString();
        const previewUrl = `${APP_URL}/en/providers/preview/${item.preview_token}`;

        if (resend) {
          await resend.emails.send({
            from: "ALPAR AI Benchmark <benchmark@alparai.com>",
            to: provider.contact_email,
            subject: `[ALPAR AI] K-BENCHMARK Draft Scores Preview Available - ${provider.name}`,
            html: `
              <p>Dear ${provider.name} Team,</p>
              <p>Your K-BENCHMARK draft scores are now available for review.</p>
              <p>Under ALPAR AI accountability rules, you have 60 days to preview and audit these scores before they are published publicly.</p>
              <p>Access your secure preview dashboard here: <a href="${previewUrl}">${previewUrl}</a></p>
              <p><strong>Expiration:</strong> This preview link will expire on ${expiresDate}. After expiration, the scores will automatically go public.</p>
              <p>Best regards,<br/>ALPAR AI Team</p>
            `,
          });
        }

        await supabase
          .from("k_provider_previews")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        sentIds.push(item.id);
      }
    }

    // 2. Process EXPIRED previews -> Send public announcement email, transition to 'expired'
    const { data: expired, error: expiredErr } = await supabase
      .from("k_provider_previews")
      .select("id, ai_providers(name, contact_email)")
      .eq("status", "sent")
      .lte("expires_at", new Date().toISOString());

    if (expiredErr) throw expiredErr;

    const expiredIds: string[] = [];
    if (expired && expired.length > 0) {
      for (const item of expired) {
        const provider = item.ai_providers as unknown as {
          name: string;
          contact_email: string;
        } | null;
        if (!provider || !provider.contact_email) {
          logger.warn(`[K-ProviderPreview] Missing provider email for expired notice: ${item.id}`);
          continue;
        }

        const ratingsUrl = `${APP_URL}/en/ratings`;

        if (resend) {
          await resend.emails.send({
            from: "ALPAR AI Benchmark <benchmark@alparai.com>",
            to: provider.contact_email,
            subject: `[ALPAR AI] K-BENCHMARK Scores Published - ${provider.name}`,
            html: `
              <p>Dear ${provider.name} Team,</p>
              <p>The 60-day preview and audit period for your K-BENCHMARK scores has ended.</p>
              <p>Your scores have now been officially published and are live on the ALPAR AI public dashboard.</p>
              <p>You can view your ratings here: <a href="${ratingsUrl}">${ratingsUrl}</a></p>
              <p>Best regards,<br/>ALPAR AI Team</p>
            `,
          });
        }

        await supabase
          .from("k_provider_previews")
          .update({
            status: "expired",
          })
          .eq("id", item.id);

        expiredIds.push(item.id);
      }
    }

    return NextResponse.json({
      success: true,
      sent_count: sentIds.length,
      sent_ids: sentIds,
      expired_count: expiredIds.length,
      expired_ids: expiredIds,
    });
  } catch (error) {
    logger.error("K-ProviderPreview cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

export const GET = withCronLogger("k-provider-preview", getHandler);
