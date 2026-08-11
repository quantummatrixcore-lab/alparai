import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase
    .from("users")
    .update({ role: "admin" })
    .eq("email", "sorularvesinavlar@gmail.com")
    .select();

  if (error) {
    console.error("Error updating user:", error);
  } else {
    if (data && data.length > 0) {
      console.log("Updated user successfully:", data);
    } else {
      console.log("User not found or role already updated.");
    }
  }
}

main().catch(console.error);
