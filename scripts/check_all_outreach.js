const fs = require("fs");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

const envConfig = fs.existsSync(".env.local") ? dotenv.parse(fs.readFileSync(".env.local")) : {};
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function checkAll() {
  const { data, error } = await supabase
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
