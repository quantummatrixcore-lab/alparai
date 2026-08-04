const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const dotenv = require("dotenv");

const envConfig = dotenv.parse(fs.readFileSync(".env.local"));
const supabase = createClient(
  envConfig.NEXT_PUBLIC_SUPABASE_URL,
  envConfig.SUPABASE_SERVICE_ROLE_KEY,
);

async function run() {
  const { error } = await supabase
    .from("finance_revenue_metrics")
    .delete()
    .neq("month", "1900-01-01");
  console.log("Deleted mock data:", error || "Success");
}

run();
