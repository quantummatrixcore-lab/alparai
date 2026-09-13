const fs = require("fs");
const dotenv = require("dotenv");
const { createClient } = require("@/lib/dehost/client");

const envConfig = fs.existsSync(".env.local") ? dotenv.parse(fs.readFileSync(".env.local")) : {};
const url = process.env.NEXT_PUBLIC_DEHOST_URL || envConfig.NEXT_PUBLIC_DEHOST_URL;
const key = process.env.DEHOST_SERVICE_ROLE_KEY || envConfig.DEHOST_SERVICE_ROLE_KEY;

const dehost = createClient(url, key);

async function checkAll() {
  const { data, error } = await dehost
    .from("outreach_queue")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Total items in outreach_queue: ${data.length}`);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkAll();
