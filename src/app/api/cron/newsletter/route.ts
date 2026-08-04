import { withCronLogger } from "@/lib/utils/cron-logger";
import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/utils/logger";
import { getResendClient } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

interface IncidentWithProvider {
  id: string;
  title_masked: string;
  description_masked: string;
  severity: string;
  category: string;
  created_at: string;
  ai_providers: {
    name: string;
  } | null;
}

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

  try {
    const admin = createAdminClient();

    // 1. Fetch active subscribers who are confirmed
    const { data: subscribers, error: subsError } = await admin
      .from("newsletter_subscribers")
      .select("email, locale")
      .eq("confirmed", true)
      .is("unsubscribed_at", null);

    if (subsError) {
      throw new Error(`Failed to query subscribers: ${subsError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, message: "No subscribers found" });
    }

    // 2. Fetch critical and high incidents published in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: incidents, error: incError } = await admin
      .from("incidents")
      .select(
        `
        id,
        title_masked,
        description_masked,
        severity,
        category,
        created_at,
        ai_providers:ai_provider_id ( name )
      `,
      )
      .eq("status", "published")
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(5);

    if (incError) {
      throw new Error(`Failed to query recent incidents: ${incError.message}`);
    }

    const recentIncidents = (incidents || []) as unknown as IncidentWithProvider[];

    if (recentIncidents.length === 0) {
      return NextResponse.json({ success: true, message: "No new incidents this week" });
    }

    // 3. Compose email templates for each locale
    const buildNewsletterHtml = (locale: string, incidentsList: IncidentWithProvider[]) => {
      const isTr = locale === "tr";
      const title = isTr ? "Haftalık Yapay Zeka Olayları Bülteni" : "Weekly AI Incidents Digest";
      const subtitle = isTr
        ? "Yapay zeka hesap verebilirliği ve şeffaflığı için haftalık özet."
        : "Weekly digest for AI accountability and transparency.";

      const incidentCardsHtml = incidentsList
        .map((inc) => {
          const providerName = inc.ai_providers?.name || "Unknown Provider";
          const severityColor = inc.severity === "critical" ? "#ef4444" : "#f97316";
          const detailLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://alparai.com"}/${locale}/incidents/${inc.id}`;

          return `
          <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; gap: 8px; margin-bottom: 12px; align-items: center;">
              <span style="background-color: ${severityColor}20; color: ${severityColor}; border: 1px solid ${severityColor}40; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                ${inc.severity}
              </span>
              <span style="background-color: #27272a; color: #a1a1aa; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                ${providerName}
              </span>
            </div>
            <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: bold;">
              ${inc.title_masked}
            </h3>
            <p style="margin: 0 0 16px 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
              ${inc.description_masked.substring(0, 150)}...
            </p>
            <a href="${detailLink}" style="color: #00ff88; text-decoration: none; font-size: 13px; font-weight: bold;">
              ${isTr ? "Raporu İncele &rarr;" : "View Report &rarr;"}
            </a>
          </div>
        `;
        })
        .join("");

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
              body {
                background-color: #09090b;
                color: #f4f4f5;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #18181b;
                border: 1px solid #27272a;
                border-radius: 16px;
                overflow: hidden;
              }
              .header {
                background: linear-gradient(135deg, #00ff88, #0A1622);
                padding: 30px 40px;
                text-align: center;
              }
              .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 800;
              }
              .header p {
                color: #a1a1aa;
                margin: 8px 0 0 0;
                font-size: 14px;
              }
              .content {
                padding: 40px;
              }
              .footer {
                background-color: #18181b;
                border-top: 1px solid #27272a;
                padding: 20px 40px;
                text-align: center;
                font-size: 12px;
                color: #71717a;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ALPAR AI DIGEST</h1>
                <p>${subtitle}</p>
              </div>
              <div class="content">
                ${incidentCardsHtml}
              </div>
              <div class="footer">
                <p>ALPAR AI — Trust Infrastructure for AI Accountability</p>
              </div>
            </div>
          </body>
        </html>
      `;
    };

    // 4. Send emails to subscribers
    const resend = getResendClient();
    let sentCount = 0;

    for (const sub of subscribers) {
      const html = buildNewsletterHtml(sub.locale || "en", recentIncidents);
      const subject =
        sub.locale === "tr"
          ? "ALPAR AI Haftalık Bülteni: Yapay Zeka Hataları & Risk Raporu"
          : "ALPAR AI Weekly: Recent AI Failures & Ethics Report";

      if (resend) {
        await resend.emails.send({
          from: "ALPAR AI <newsletter@alparai.com>",
          to: sub.email,
          subject,
          html,
        });
        sentCount++;
      } else {
        logger.info("Newsletter email simulated (no RESEND_API_KEY)", {
          email: sub.email,
          subject,
        });
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      incidentsCount: recentIncidents.length,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Newsletter cron failed", {}, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export const GET = withCronLogger("newsletter", getHandler);
