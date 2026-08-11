require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

(async () => {
  const { data: users, error: findError } = await supabase.auth.admin.listUsers();
  if (findError) return console.error(findError);

  const user = users.users.find((u) => u.email === "ataturk@alparai.com");
  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name: "Atat�rk" },
    });
    if (error) console.error(error);
    else console.log("Updated name for:", data.user.email);
  } else {
    console.log("User not found");
  }
})();
