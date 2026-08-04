import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

interface RedactionRequestRow {
  id: string;
  incident_id: string;
  provider_id: string;
  status: string;
  reason: string | null;
  created_at: string;
}

export default async function RedactionQueuePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/redaction-queue`);
  if (user.role !== "moderator" && user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }

  const admin = createAdminClient();
  const { data: requests } = await admin
    .from("redaction_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const items: RedactionRequestRow[] = (requests as unknown as RedactionRequestRow[]) ?? [];

  const statusBadge = (status: string) => {
    if (status === "pending") return <Badge variant="warning">{t("pending")}</Badge>;
    if (status === "approved") return <Badge variant="success">{t("approved")}</Badge>;
    return <Badge variant="danger">{t("rejected")}</Badge>;
  };

  return (
    <Container className="py-10">
      <header className="mb-6">
        <h1 className="text-fg-primary text-2xl font-bold">{t("redaction_queue_title")}</h1>
        <p className="text-fg-muted mt-1 text-sm">
          {items.length} {t("redaction_queue_count")}
        </p>
      </header>
      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-fg-muted text-sm">{t("redaction_queue_empty")}</p>
            </div>
          ) : (
            <div className="divide-fg-muted/10 divide-y">
              {items.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-fg-primary text-sm font-medium">{r.incident_id}</p>
                    <p className="text-fg-muted text-xs">{r.reason ?? "—"}</p>
                    <p className="text-fg-muted/50 text-xs">{formatDate(r.created_at, locale)}</p>
                  </div>
                  <div>{statusBadge(r.status)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
