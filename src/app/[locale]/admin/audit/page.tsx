import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLogClient } from "@/components/admin/audit-log-client";
import { Activity } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("auditTitle") };
}

export default async function AdminAuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/audit`);
  if (user.role !== "admin" && user.role !== "ceo") redirect(`/${locale}/admin`);

  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_log")
    .select(
      `
      id,
      action,
      entity_type,
      entity_id,
      before_data,
      after_data,
      created_at,
      users:actor_id (
        email,
        full_name,
        role
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  interface DatabaseRow {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    before_data: Record<string, unknown> | null;
    after_data: Record<string, unknown> | null;
    created_at: string;
    users: {
      email: string;
      full_name: string | null;
      role: string;
    } | null;
  }

  // Cast retrieved data safely to match the component expectations
  const initialLogs = ((data as unknown as DatabaseRow[]) || []).map((row) => ({
    id: row.id,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    before_data: row.before_data,
    after_data: row.after_data,
    created_at: row.created_at,
    users: row.users
      ? {
          email: row.users.email,
          full_name: row.users.full_name,
          role: row.users.role,
        }
      : null,
  }));

  return (
    <Container className="max-w-7xl py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-fg-primary inline-flex items-center gap-2.5 text-3xl font-extrabold tracking-tight">
            <Activity className="text-brand-400 h-8 w-8" /> {t("auditTitle")}
          </h1>
          <p className="text-fg-muted mt-1 text-sm">
            {t("cross_audit_dashboard_subheading") ||
              "Gerçek zamanlı denetim metrikleri, etik uyum ve düzenleyici sınıflandırma günlükleri."}
          </p>
        </div>
      </header>

      <AuditLogClient initialLogs={initialLogs} locale={locale} />
    </Container>
  );
}
