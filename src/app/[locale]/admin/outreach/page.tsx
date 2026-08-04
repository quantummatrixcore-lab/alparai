import { createAdminClient } from "@/lib/supabase/admin";
import { requireModerator } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Megaphone } from "lucide-react";
import { OutreachPageContent } from "./outreach-page-content";
import { getTranslations } from "next-intl/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OutreachAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireModerator();
  if (!user) redirect(`/${locale}/login`);

  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = createAdminClient();

  const { data: queue, error } = await (supabase as unknown as SupabaseClient)
    .from("outreach_queue")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching outreach queue:", error);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
          <Megaphone className="h-8 w-8 text-amber-400" />
          {t("outreach_hub")}
        </h1>
        <p className="text-fg-muted mt-2 text-lg">{t("outreach_subtitle")}</p>
      </div>

      <OutreachPageContent initialQueue={queue || []} />
    </div>
  );
}
