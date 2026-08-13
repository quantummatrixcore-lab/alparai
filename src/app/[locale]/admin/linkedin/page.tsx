import dynamic from "next/dynamic";
import { createAdminClient } from "@/lib/supabase/admin";
const LinkedinContactsList = dynamic(() =>
  import("@/components/admin/linkedin-contacts-list").then((m) => m.LinkedinContactsList),
);

import { AdminSectionCard } from "@/components/admin/admin-design-kit";
import { requireModerator } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MarketingHubTabs } from "@/components/admin/marketing-hub-tabs";

export default async function LinkedinAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await requireModerator();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/linkedin`);

  const supabase = createAdminClient();

  const { data: contacts, error } = await (supabase as unknown as SupabaseClient)
    .from("linkedin_contacts")
    .select("*")
    .order("status", { ascending: true })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching linkedin_contacts", error);
  }

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8 rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <MarketingHubTabs />
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white">
            <Users className="h-8 w-8 text-sky-400" />
            {t("linkedin_title")}
          </h1>
          <p className="text-fg-muted mt-2 text-lg">{t("linkedin_subtitle")}</p>
        </div>

        <AdminSectionCard title={t("linkedin_target_section")}>
          <LinkedinContactsList initialContacts={contacts || []} />
        </AdminSectionCard>
      </div>
    </div>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
