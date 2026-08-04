import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8");
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim().replace(/^"|"$|^'|'$/g, "");
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim().replace(/^"|"$|^'|'$/g, "");

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const incidentId = "ed410ab9-55e5-4c78-928f-1628331e8080";
  const { data, error } = await supabase
    .from("evidence")
    .select("*")
    .eq("incident_id", incidentId);
    
  if (error) {
    console.error("Error fetching evidence:", error);
    return;
  }
  console.log("Evidence records:");
  console.log(JSON.stringify(data, null, 2));
}
main().catch(console.error);
