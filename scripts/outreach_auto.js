const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azszpzyvxjduhemkjsdh.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_dummy"; // Need real key from env
const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_dummy";

// I need to read the real keys from .env.local
const fs = require("fs");
const dotenv = require("dotenv");
const envConfig = dotenv.parse(fs.readFileSync(".env.local"));

const supabase = createClient(
  envConfig.NEXT_PUBLIC_SUPABASE_URL,
  envConfig.SUPABASE_SERVICE_ROLE_KEY,
);
const resend = new Resend(envConfig.RESEND_API_KEY);

const contacts = [
  { email: "kyle.wiggers@techcrunch.com", name: "Kyle Wiggers", type: "media" },
  { email: "sigal.samuel@vox.com", name: "Sigal Samuel", type: "media" },
  { email: "khari.johnson@wired.com", name: "Khari Johnson", type: "media" },
  { email: "shirin.ghafary@bloomberg.net", name: "Shirin Ghafary", type: "media" },
  { email: "will.knight@wired.com", name: "Will Knight", type: "media" },
  { email: "c.newton@platformer.news", name: "Casey Newton", type: "media" },
];

const mediaSubject = "EU AI Act Article 73 & Independent AI Incident Registry (ALPAR AI)";
const mediaBody = `I am reaching out from ALPAR AI (https://alparai.com), an AGPL-3.0 open-source infrastructure logging AI model vulnerabilities, hallucination incidents, and EU AI Act Article 73 compliance signals.

As enterprise AI adoption expands, independent auditing data remains scarce. ALPAR AI provides:

- Live AI Safety & Trust Scores (K-BENCHMARK) across 7 major model providers (Anthropic, OpenAI, Google, NVIDIA, Meta, Alibaba, Mistral).
- An open, PII-masked incident registry tracking real-world model failures.
- Automated regulatory tracking for the upcoming EU AI Act Article 73 window.

We would be glad to provide exclusive dataset access or expert commentary on enterprise AI safety trends for your coverage.

Best regards,

**Ercüment Erden**
Founder, ALPAR AI
https://alparai.com | ercument.erden@alparai.com`;

async function run() {
  console.log("Starting automated outreach...");
  const results = [];

  for (const contact of contacts) {
    // Insert into DB
    const { data: dbData, error: dbError } = await supabase
      .from("outreach_queue")
      .insert({
        recipient_email: contact.email,
        recipient_name: contact.name,
        template_type: contact.type,
        subject: mediaSubject,
        body_template: mediaBody.replace("[Recipient Name]", contact.name),
        status: "approved",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB Insert Error for", contact.email, dbError);
      continue;
    }

    const dbId = dbData.id;
    console.log(`Inserted DB row ${dbId} for ${contact.email}`);

    // Call Resend API
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: "Ercüment Erden <ercument.erden@alparai.com>",
      to: contact.email,
      subject: mediaSubject,
      text: mediaBody.replace("[Recipient Name]", contact.name),
    });

    if (resendError) {
      console.error("Resend Error for", contact.email, resendError);
      await supabase.from("outreach_queue").update({ status: "failed" }).eq("id", dbId);
      continue;
    }

    const resendId = resendData.id;
    console.log(`Sent email to ${contact.email}. Resend ID: ${resendId}`);

    // Update DB
    await supabase
      .from("outreach_queue")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", dbId);

    results.push({ db_id: dbId, resend_message_id: resendId, email: contact.email });
  }

  console.log("--- PROOF OF OUTREACH ---");
  console.log(JSON.stringify(results, null, 2));
}

run();
