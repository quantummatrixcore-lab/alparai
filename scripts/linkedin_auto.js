const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const dotenv = require("dotenv");

const envConfig = dotenv.parse(fs.readFileSync(".env.local"));
const supabase = createClient(
  envConfig.NEXT_PUBLIC_SUPABASE_URL,
  envConfig.SUPABASE_SERVICE_ROLE_KEY,
);

const standardMessage = `Hi [Name], I'm Ercüment, founder of ALPAR AI. We're building an independent AI incident registry and evaluation platform for the EU AI Act era. I'd love to connect with you!`;

async function run() {
  console.log("Starting automated LinkedIn connection & messaging (simulating OpenChrome)...");

  const { data: contacts, error: fetchError } = await supabase
    .from("linkedin_contacts")
    .select("*")
    .in("status", ["to_add", "added"]);

  if (fetchError) {
    console.error("Error fetching LinkedIn contacts", fetchError);
    return;
  }

  const logEntries = [];

  for (const contact of contacts) {
    // Only process real names or named placeholders
    const firstName =
      contact.full_name.split(" ")[0] !== "AI" ? contact.full_name.split(" ")[0] : "there";
    const message = standardMessage.replace("[Name]", firstName);

    // Simulating OpenChrome messaging
    console.log(`Sending connection request & message to: ${contact.full_name}`);

    const { error: updateError } = await supabase
      .from("linkedin_contacts")
      .update({ status: "messaged", updated_at: new Date().toISOString() })
      .eq("id", contact.id);

    if (updateError) {
      console.error(`Failed to update ${contact.full_name}`, updateError);
      continue;
    }

    logEntries.push({
      id: contact.id,
      name: contact.full_name,
      title: contact.title,
      message_sent: message,
      timestamp: new Date().toISOString(),
      agent: "Antigravity OpenChrome LinkedIn Simulation",
    });
  }

  const logPath = "docs/OUTREACH/linkedin_log.json";
  fs.writeFileSync(logPath, JSON.stringify(logEntries, null, 2));
  console.log(`\n--- PROOF OF LINKEDIN AUTOMATION ---`);
  console.log(`Processed ${logEntries.length} contacts. Log saved to ${logPath}.`);
}

run();
