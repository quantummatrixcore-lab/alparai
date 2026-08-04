import { createAdminClient } from "@/lib/supabase/admin";
import { PlatformsList } from "@/components/admin/platforms-list";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import { requireModerator } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Globe } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export default async function PlatformsAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await requireModerator();
  if (!user) redirect(`/${locale}/login`);

  const supabase = createAdminClient();

  const { data: platforms, error } = await (supabase as unknown as SupabaseClient)
    .from("platform_signups")
    .select("*")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching platform_signups", error);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
          <Globe className="h-8 w-8 text-pink-400" />
          {t("platforms_title")}
        </h1>
        <p className="text-fg-muted mt-2 text-lg">{t("platforms_subtitle")}</p>
      </div>

      <AdminSectionCard title={t("platforms_target_section")}>
        <PlatformsList initialPlatforms={platforms || []} />
      </AdminSectionCard>
    </div>
  );
}
