import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { BrainCircuit } from "lucide-react";
import { CrossAuditClient } from "@/components/admin/cross-audit/cross-audit-client";

export default async function CrossAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<BrainCircuit className="h-6 w-6 text-purple-400" />}
        title="Multi-Model Cross-Audit & LLM Debate Matrix"
        subtitle="Independent multi-LLM verification console measuring consensus alignment, severity variance, and model bias across reported AI incidents."
        lastUpdated={new Date().toLocaleDateString(locale)}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Cross-Audit Matrix", href: "/admin/cross-audit" },
        ]}
      />

      <CrossAuditClient />
    </AdminContainer>
  );
}

export const metadata = {
  title: "Multi-Model Cross-Audit Matrix | ALPAR AI Admin",
  description:
    "LLM Debate & Cross-Audit matrix evaluating AI safety incidents across independent models.",
};
