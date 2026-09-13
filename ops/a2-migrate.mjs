/* eslint-disable */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@/lib/dehost/client";

const dehostUrl = process.env.NEXT_PUBLIC_DEHOST_URL || process.env.DEHOST_URL;
const dehostKey = process.env.DEHOST_SERVICE_ROLE_KEY;

if (!dehostUrl || !dehostKey) {
  console.error("Missing DeHost credentials");
  process.exit(1);
}

const dehost = createClient(dehostUrl, dehostKey);

const TRUSTED_ALLOWLIST = [
  "technologyreview.mit.edu",
  "404media.co",
  "lastweekinai.substack.com",
  "theregister.com"
];

async function run() {
  console.log("Starting A2 migration update...");
  for (const domain of TRUSTED_ALLOWLIST) {
    const { data, error } = await dehost
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
  
  const { data: check, error: checkError } = await dehost
    .from("external_incidents_queue")
    .select("id", { count: 'exact' })
    .eq("status", "published");
    
  console.log(`Total published records now: ${check?.length || 0}`);
}

run();
