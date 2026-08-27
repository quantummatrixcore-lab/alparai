import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import {
  AdminContainer,
  AdminPageHeader,
  AdminSectionCard,
} from "@/components/admin/admin-design-kit";
import { TakedownQueue, type TakedownItem } from "@/components/admin/takedown-queue";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("stats_takedown_requests") };
}

export default async function AdminTakedownPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/takedown`);
  if (user.role !== "moderator" && user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }
  const admin = createAdminClient();
  const { data } = await admin
    .from("takedown_requests")
    .select(
      "id, reason, details, status, created_at, requester_name, requester_email, organization, requester_organization, country, target_url",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const items: TakedownItem[] = ((data as Array<Record<string, unknown>>) ?? []).map((r) => ({
    id: r["id"] as string,
    reason: (r["reason"] as string) ?? "",
    details: (r["details"] as string) ?? "",
    status: (r["status"] as TakedownItem["status"]) ?? "pending",
    created_at: r["created_at"] as string,
    requester_name: (r["requester_name"] as string | null) ?? null,
    requester_email: (r["requester_email"] as string | null) ?? null,
    organization:
      (r["organization"] as string | null) ??
      (r["requester_organization"] as string | null) ??
      null,
    country: (r["country"] as string | null) ?? null,
    target_url: (r["target_url"] as string | null) ?? null,
  }));

  const pending = items.filter((i) => i.status === "pending");

  return (
    <AdminContainer shell>
      <Container className="py-6">
        <AdminPageHeader
          title={t("stats_takedown_requests")}
          subtitle={`${pending.length} ${t("pending_review")} · ${items.length} ${t("stats_total")}`}
          className="mb-6"
        />
        <AdminSectionCard>
          <TakedownQueue items={items} />
        </AdminSectionCard>
      </Container>
    </AdminContainer>
  );
}
