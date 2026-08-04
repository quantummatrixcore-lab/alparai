/* eslint-disable */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TRUSTED_ALLOWLIST = [
  "technologyreview.mit.edu",
  "404media.co",
  "lastweekinai.substack.com",
  "theregister.com"
];

async function run() {
  console.log("Starting A2 migration update...");
  for (const domain of TRUSTED_ALLOWLIST) {
    const { data, error } = await supabase
      .from("external_incidents_queue")
      .update({ status: "published" })
      .eq("status", "pending")
      .ilike("external_url", `%${domain}%`);
      
    if (error) {
      console.error(`Error updating for ${domain}:`, error);
    } else {
      console.log(`Updated for ${domain}`);
    }
  }
  
  const { data: check, error: checkError } = await supabase
    .from("external_incidents_queue")
    .select("id", { count: 'exact' })
    .eq("status", "published");
    
  console.log(`Total published records now: ${check?.length || 0}`);
}

run();
