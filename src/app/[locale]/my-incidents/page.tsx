import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { IncidentList } from "@/components/incidents/incident-list";
import { getCurrentUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import type { IncidentListItem } from "@/types";
import { toIncidentListItems } from "@/lib/mappers";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "myIncidents" });
  return { title: t("metadata_title") };
}

export default async function MyIncidentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "myIncidents" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/my-incidents`);

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("incidents")
    .select(
      "id, title_masked, description_masked, severity, status, category, is_anonymous, incident_date, views_count, created_at, ai_provider_id, user_id, cross_audit_truth_score, cross_audit_confidence",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items: IncidentListItem[] = toIncidentListItems(data);

  return (
    <Container className="py-10">
      <header className="mb-6">
        <h1 className="text-fg-primary text-2xl font-bold">{t("title")}</h1>
        <p className="text-fg-muted mt-1 text-sm">{t("subtitle", { count: items.length })}</p>
      </header>
      <IncidentList incidents={items} />
    </Container>
  );
}
