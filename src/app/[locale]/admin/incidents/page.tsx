import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { ShieldAlert } from "lucide-react";
import { IncidentTriageClient } from "@/components/admin/incidents/incident-triage-client";

export default async function IncidentsTriagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<ShieldAlert className="h-6 w-6 text-rose-500" />}
        title="AI Incident & Whistleblower Triage Desk"
        subtitle="Real-time intake queue for reviewing, auditing, and publishing AI safety failures and whistleblower disclosures under PII Guardian protection."
        lastUpdated={new Date().toLocaleDateString(locale)}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Incident Triage", href: "/admin/incidents" },
        ]}
      />

      <IncidentTriageClient />
    </AdminContainer>
  );
}

export const metadata = {
  title: "Incident Triage Desk | ALPAR AI Admin",
  description:
    "AI Incident & Whistleblower Triage Desk with PII Guardian and EU AI Act escalation.",
};
