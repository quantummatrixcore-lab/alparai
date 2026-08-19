import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedRespondentProviders } from "@/actions/admin";
import type { IncidentListItem } from "@/types";
import { toIncidentListItems } from "@/lib/mappers";
import { Flag } from "lucide-react";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { ModerationClient } from "@/components/admin/moderation-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("moderation_queue") };
}

export default async function ModerationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/moderation`);
  if (user.role !== "moderator" && user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }

  const admin = createAdminClient();
  const [incidentsRes, providersRes] = await Promise.all([
    admin
      .from("incidents")
      .select(
        "id, title_masked, description_masked, severity, status, category, is_anonymous, incident_date, views_count, created_at, ai_provider_id, user_id, processing_stage",
      )
      .eq("status", "pending_review")
      .order("created_at", { ascending: false })
      .limit(50),
    getVerifiedRespondentProviders(),
  ]);

  const items: IncidentListItem[] = toIncidentListItems(incidentsRes.data);
  const providers = providersRes.ok && providersRes.data ? providersRes.data : [];

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<Flag className="h-7 w-7 text-emerald-400" />}
        title={t("moderation_queue") || "Incident Moderation Queue"}
        subtitle={
          t("review_pending_incident_reports_and_gran") ||
          "Review pending incident reports and grant official verified respondent badges."
        }
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Moderation", href: "/admin/moderation" },
        ]}
      />

      <ModerationClient items={items} providers={providers} />
    </AdminContainer>
  );
}
