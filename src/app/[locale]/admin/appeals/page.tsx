import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { AppealsClient } from "./appeals-client";

export default async function AppealsPage() {
  const mod = await requireModerator();
  if (!mod) {
    return <div>Forbidden</div>;
  }

  const admin = createAdminClient();
  const { data: appeals } = await admin
    .from("takedown_appeals")
    .select("*")
    .order("created_at", { ascending: false });

  const t = await getTranslations("admin.appeals");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-text-primary text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-text-secondary text-sm">{t("description")}</p>
      </div>

      <AppealsClient appeals={appeals || []} />
    </div>
  );
}
