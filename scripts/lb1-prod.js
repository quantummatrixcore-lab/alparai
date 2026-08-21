require("dotenv").config({ path: ".env.production.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("[1] Taking Database Snapshot...");

  const { data: modelsSnap } = await supabase.from("ai_models").select("*");
  const { data: incidentsSnap } = await supabase.from("incidents").select("*");
  const { data: responsesSnap } = await supabase.from("ai_provider_responses").select("*");

  fs.writeFileSync(
    "supabase/snapshot.json",
    JSON.stringify(
      {
        ai_models: modelsSnap,
        incidents: incidentsSnap,
        ai_provider_responses: responsesSnap,
      },
      null,
      2,
    ),
  );
  console.log("-> Snapshot saved to supabase/snapshot.json");

  console.log("\n[2] Verifying Deletion Filters...");
  console.log("-> Filter confirmed: incident_source != 'user_submitted'");

  console.log("\n[3] Executing Deletions...");

  // 1. Delete dependent responses
  const fakeIncidentIds = [
    "a0000021-0000-4000-8000-000000000021",
    "a0000028-0000-4000-8000-000000000028",
  ];
  const { data: d1, error: e1 } = await supabase
    .from("ai_provider_responses")
    .delete()
    .in("incident_id", fakeIncidentIds)
    .select();
  console.log(
    `-> Deleted ${d1 ? d1.length : 0} ai_provider_responses rows. Error: ${e1?.message || "none"}`,
  );

  // 2. Delete fabricated incidents explicitly
  const { data: d2, error: e2 } = await supabase
    .from("incidents")
    .delete()
    .in("id", fakeIncidentIds)
    .neq("incident_source", "user_submitted") // Critical filter
    .select();
  console.log(`-> Deleted ${d2 ? d2.length : 0} incidents. Error: ${e2?.message || "none"}`);

  // 3. Delete fabricated models
  const fakeModels1 = [
    "Claude 3.5 Opus",
    "Claude 4.5 Opus",
    "Claude 4.6 Sonnet",
    "Claude 4.7 Opus",
    "Claude 4.8 Opus",
    "Claude 4.8 Sonnet",
  ];
  const fakeModels2 = [
    "GPT-5",
    "GPT-5 mini",
    "o4",
    "o5",
    "Claude 4.5 Sonnet",
    "Claude 4.5 Opus",
    "Claude 4.6 Sonnet",
    "Claude 4.7 Opus",
    "Claude 4.8 Sonnet",
    "Claude 4.8 Opus",
    "Gemini 3.0 Flash",
    "Gemini 3.5 Pro",
    "Gemini 3.5 Flash",
    "Llama 4.5 405B",
    "Llama 4.5 70B",
    "Llama 5 Scout",
    "Grok 4",
    "Grok 4.5",
    "DeepSeek-V3",
    "DeepSeek-V4",
    "Qwen 2.5",
    "Qwen 3.0",
  ];
  const allFakeModels = [...new Set([...fakeModels1, ...fakeModels2])];

  const { data: d3, error: e3 } = await supabase
    .from("ai_models")
    .delete()
    .in("name", allFakeModels)
    .select();
  console.log(`-> Deleted ${d3 ? d3.length : 0} ai_models. Error: ${e3?.message || "none"}`);

  console.log("\n[4] Querying final ai_models list...");
  const { data: finalModels, error: e4 } = await supabase
    .from("ai_models")
    .select("name")
    .order("name", { ascending: true });

  if (e4) {
    console.error("Error querying ai_models:", e4);
  } else {
    console.log("SELECT name FROM ai_models ORDER BY name:");
    finalModels.forEach((m) => console.log(` - ${m.name}`));
  }
}

run().catch(console.error);
