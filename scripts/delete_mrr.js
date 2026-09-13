const { createClient } = require("@/lib/dehost/client");
const fs = require("fs");
const dotenv = require("dotenv");

const envConfig = dotenv.parse(fs.readFileSync(".env.local"));
const dehost = createClient(
  envConfig.NEXT_PUBLIC_DEHOST_URL,
  envConfig.DEHOST_SERVICE_ROLE_KEY,
);

async function run() {
  const { error } = await dehost
    .from("finance_revenue_metrics")
    .delete()
    .neq("month", "1900-01-01");
  console.log("Deleted mock data:", error || "Success");
}

run();
