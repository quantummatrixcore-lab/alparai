require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

(async () => {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: "ataturk@alparai.com",
  });
  if (error) console.error(error);
  else {
    console.log("Magic Link:", data.properties.action_link);
  }
})();
