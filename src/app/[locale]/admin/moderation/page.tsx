import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { VerifiedRespondentListClient } from "@/components/admin/verified-respondent-list-client";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVerifiedRespondentProviders } from "@/actions/admin";
import type { IncidentListItem } from "@/types";
import { toIncidentListItems } from "@/lib/mappers";
import { ShieldCheck, Flag } from "lucide-react";

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
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
          <Flag className="h-6 w-6 text-emerald-400" />
          {t("moderation_queue")}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t("review_pending_incident_reports_and_gran")}
        </p>
      </header>

      <div className="space-y-10">
        {/* Section 1: Pending Incident Moderation Queue */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-white">
            {t("pending_review")} ({items.length})
          </h2>
          <Card className="border-white/10 bg-[#0F1E2E]">
            <CardContent className="pt-6">
              <ModerationQueue incidents={items} />
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Verified Respondent Badge Moderation */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            {t("verified_respondent_badge_moderation")}
          </h2>
          <VerifiedRespondentListClient providers={providers} />
        </div>
      </div>
    </Container>
  );
}
