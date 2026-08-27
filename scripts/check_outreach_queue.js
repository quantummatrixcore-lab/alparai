const fs = require("fs");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

const envConfig = fs.existsSync(".env.local") ? dotenv.parse(fs.readFileSync(".env.local")) : {};
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY || envConfig.RESEND_API_KEY;

console.log("ENV CHECK:");
console.log("NEXT_PUBLIC_SUPABASE_URL present:", !!url);
console.log("SUPABASE_SERVICE_ROLE_KEY present:", !!key);
console.log("RESEND_API_KEY present:", !!resendKey);

if (!url || !key || !resendKey) {
  console.error("CRITICAL: Missing essential environment variables.");
  process.exit(1);
}

const supabase = createClient(url, key);
const resend = new Resend(resendKey);

async function inspectAndRun() {
  // 1. Check current sent count in last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: sentLast24h, error: countErr } = await supabase
    .from("outreach_queue")
    .select("id")
    .eq("status", "sent")
    .gte("sent_at", oneDayAgo);

  const sentCount = sentLast24h ? sentLast24h.length : 0;
  console.log(`\n--- 24H SENT COUNT ---`);
  console.log(`Emails sent in last 24h: ${sentCount} / 50 limit`);

  // 2. Fetch pending records
  const { data: pendingItems, error: pendingErr } = await supabase
    .from("outreach_queue")
    .select("*")
    .or("status.eq.pending,status.eq.approved")
    .order("created_at", { ascending: true });

  console.log(`\n--- PENDING / APPROVED ITEMS IN DB ---`);
  if (pendingErr) {
    console.error("Error fetching pending items:", pendingErr);
  } else {
    console.log(`Found ${pendingItems.length} items with status 'pending' or 'approved':`);
    console.log(JSON.stringify(pendingItems, null, 2));
  }
}

inspectAndRun();
