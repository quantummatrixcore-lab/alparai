const fs = require("fs");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

const envConfig = fs.existsSync(".env.local") ? dotenv.parse(fs.readFileSync(".env.local")) : {};
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY || envConfig.RESEND_API_KEY;

if (!url || !key || !resendKey) {
  console.error("CRITICAL ERROR: Missing URL, Key, or Resend Key.");
  process.exit(1);
}

const supabase = createClient(url, key);
const resend = new Resend(resendKey);

const DAILY_LIMIT = 50;

async function executeCampaign() {
  console.log("=== STARTING MAIL CAMPAIGN MANAGER EXECUTION ===\n");

  // Step 1: Check 24-hour limit
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: sentLast24h, error: countErr } = await supabase
    .from("outreach_queue")
    .select("id")
    .eq("status", "sent")
    .gte("sent_at", oneDayAgo);

  if (countErr) {
    console.error("Error counting 24h sent emails:", countErr);
    process.exit(1);
  }

  const currentSentCount = sentLast24h ? sentLast24h.length : 0;
  console.log(`[QUOTA CHECK] Sent in last 24h: ${currentSentCount} / ${DAILY_LIMIT}`);

  if (currentSentCount >= DAILY_LIMIT) {
    console.log(`[QUOTA EXCEEDED] Daily limit of ${DAILY_LIMIT} reached. Aborting.`);
    process.exit(0);
  }

  let remainingQuota = DAILY_LIMIT - currentSentCount;
  console.log(`[QUOTA CHECK] Remaining quota available: ${remainingQuota}\n`);

  // Step 2: Query pending items from outreach_queue
  const { data: pendingItems, error: pendingErr } = await supabase
    .from("outreach_queue")
    .select("*")
    .or("status.eq.pending,status.eq.approved")
    .order("created_at", { ascending: true })
    .limit(remainingQuota);

  if (pendingErr) {
    console.error("Error querying pending items:", pendingErr);
    process.exit(1);
  }

  console.log(
    `[PENDING QUEUE] Found ${pendingItems.length} existing pending/approved items in DB.`,
  );

  const sentLog = [];

  // Step 3: Process existing pending items if any
  for (const item of pendingItems) {
    if (remainingQuota <= 0) break;

    const fromAddress = "Ercüment Erden <ercument.erden@alparai.com>";
    console.log(`Sending existing pending item #${item.id} to ${item.recipient_email}...`);

    const { data: resendRes, error: sendErr } = await resend.emails.send({
      from: fromAddress,
      to: item.recipient_email,
      subject: item.subject,
      text: item.body_template,
    });

    if (sendErr) {
      console.error(`[FAIL] Resend error for ${item.recipient_email}:`, sendErr);
      await supabase.from("outreach_queue").update({ status: "failed" }).eq("id", item.id);
    } else {
      const sentAt = new Date().toISOString();
      await supabase
        .from("outreach_queue")
        .update({ status: "sent", sent_at: sentAt })
        .eq("id", item.id);
      console.log(`[SUCCESS] Email sent to ${item.recipient_email}. Resend ID: ${resendRes.id}`);
      sentLog.push({
        id: item.id,
        recipient: item.recipient_email,
        from: fromAddress,
        subject: item.subject,
        resend_id: resendRes.id,
        sent_at: sentAt,
      });
      remainingQuota--;
    }
  }

  // Step 4: Prepare HackerOne & Product Hunt intro emails
  const newOutreachList = [
    {
      recipient_email: "security@hackerone.com",
      recipient_name: "HackerOne Security Team",
      company: "HackerOne",
      template_type: "expert",
      subject: "ALPAR AI — The Trust Infrastructure for AI Accountability",
      body_template: `Dear HackerOne Security Team,

I am reaching out from ALPAR AI (https://alparai.com), an AGPL-3.0 open-source trust infrastructure logging AI model vulnerabilities, hallucination incidents, and EU AI Act compliance signals.

We are introducing our Vulnerability Disclosure & Bug Bounty Program for AI safety and platform security. We welcome collaboration with the global ethical hacker community on HackerOne to strengthen AI accountability and model security.

Key Platform Details:
- Website: https://alparai.com
- Security & VDP Policy: https://alparai.com/security
- Repository: https://github.com/quantummatrixcore-lab/Alparai.com

Best regards,

Ercüment Erden
Founder, ALPAR AI
ercument.erden@alparai.com | https://alparai.com`,
    },
    {
      recipient_email: "hello@producthunt.com",
      recipient_name: "Product Hunt Team & Hunters",
      company: "Product Hunt",
      template_type: "media",
      subject: "ALPAR AI — The Trust Infrastructure for AI Accountability",
      body_template: `Dear Product Hunt Team & Hunters,

I am reaching out from ALPAR AI (https://alparai.com), an AGPL-3.0 open-source trust infrastructure for AI accountability and safety monitoring.

As AI models deploy across critical enterprise workflows, tracking real-world model failures, hallucination incidents, and compliance signals (EU AI Act Article 73) has become essential. ALPAR AI provides real-time model safety scores (K-BENCHMARK) across 7 major frontier AI providers and an open incident registry.

We would love to introduce ALPAR AI to the Product Hunt community and collaborate on our upcoming product launch.

Key Highlights:
- Live Trust Platform: https://alparai.com
- Open Source (AGPL-3.0): https://github.com/quantummatrixcore-lab/Alparai.com
- Live Benchmark: K-BENCHMARK Safety & Drift Evaluation

Best regards,

Ercüment Erden
Founder, ALPAR AI
ercument.erden@alparai.com | https://alparai.com`,
    },
  ];

  console.log(`\n[NEW OUTREACH] Processing ${newOutreachList.length} new intro emails...`);

  for (const target of newOutreachList) {
    if (remainingQuota <= 0) {
      console.log(
        `[QUOTA EXCEEDED] Remaining quota reached limit. Skipping ${target.recipient_email}`,
      );
      break;
    }

    // Check if already sent in outreach_queue
    const { data: existing } = await supabase
      .from("outreach_queue")
      .select("id, status")
      .eq("recipient_email", target.recipient_email)
      .eq("subject", target.subject);

    if (existing && existing.some((e) => e.status === "sent")) {
      console.log(
        `[SKIP] Email already sent to ${target.recipient_email} with subject: "${target.subject}"`,
      );
      continue;
    }

    // Insert into outreach_queue as pending/approved
    const { data: dbData, error: dbError } = await supabase
      .from("outreach_queue")
      .insert({
        recipient_email: target.recipient_email,
        recipient_name: target.recipient_name,
        company: target.company,
        template_type: target.template_type,
        subject: target.subject,
        body_template: target.body_template,
        status: "approved",
      })
      .select()
      .single();

    if (dbError) {
      console.error(`[DB ERROR] Failed to insert ${target.recipient_email}:`, dbError);
      continue;
    }

    const fromAddress = "Ercüment Erden <ercument.erden@alparai.com>";
    console.log(
      `[SENDING] Dispatching to ${target.recipient_email} via Resend (${fromAddress})...`,
    );

    const { data: resendRes, error: sendErr } = await resend.emails.send({
      from: fromAddress,
      to: target.recipient_email,
      subject: target.subject,
      text: target.body_template,
    });

    if (sendErr) {
      console.error(`[FAIL] Resend API error for ${target.recipient_email}:`, sendErr);
      await supabase.from("outreach_queue").update({ status: "failed" }).eq("id", dbData.id);
    } else {
      const sentAt = new Date().toISOString();
      await supabase
        .from("outreach_queue")
        .update({ status: "sent", sent_at: sentAt })
        .eq("id", dbData.id);
      console.log(
        `[SUCCESS] Email sent to ${target.recipient_email}. DB ID: ${dbData.id}, Resend ID: ${resendRes.id}`,
      );
      sentLog.push({
        id: dbData.id,
        recipient: target.recipient_email,
        from: fromAddress,
        subject: target.subject,
        resend_id: resendRes.id,
        sent_at: sentAt,
      });
      remainingQuota--;
    }
  }

  console.log("\n=== FINAL CAMPAIGN REPORT ===");
  console.log(`Total emails sent in this session: ${sentLog.length}`);
  console.log(JSON.stringify(sentLog, null, 2));
}

executeCampaign();
