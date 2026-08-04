import { createAdminClient } from "@/lib/supabase/admin";
import { GrantsList } from "@/components/admin/grants-list";
import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import { requireModerator } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export default async function GrantsAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await requireModerator();
  if (!user) redirect(`/${locale}/login`);

  const supabase = createAdminClient();

  const { data: grants, error } = await (supabase as unknown as SupabaseClient)
    .from("grant_applications")
    .select("*")
    .order("phase", { ascending: true })
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching grant_applications", error);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
          <Building2 className="h-8 w-8 text-amber-400" />
          {t("nav_grants")}
        </h1>
        <p className="text-fg-muted mt-2 text-lg">{t("grants_subtitle")}</p>
      </div>

      <AdminSectionCard title={t("grants_active_section")}>
        <GrantsList initialGrants={grants || []} userRole={user.role} />
      </AdminSectionCard>
    </div>
  );
}
