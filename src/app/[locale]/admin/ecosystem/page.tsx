import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { EcosystemDashboard } from "@/components/admin/ecosystem/ecosystem-dashboard";

export default async function AdminEcosystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/ecosystem`);
  if (user.role !== "admin" && user.role !== "ceo") redirect(`/${locale}`);

  const supabase = createAdminClient();

  const [queueRes, feedRes, positiveRes, statsRes] = await Promise.all([
    supabase
      .from("external_incidents_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("ecosystem_news")
      .select("*")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(50),
    supabase
      .from("ecosystem_news")
      .select("*")
      .eq("is_active", true)
      .eq("category", "positive_development")
      .order("published_at", { ascending: false })
      .limit(50),
    supabase.from("ecosystem_news").select("id, category", { count: "exact", head: false }),
  ]);

  const allItems = statsRes.data ?? [];
  const stats = {
    total: allItems.length,
    incidents: allItems.filter((n) => n.category !== "positive_development").length,
    positive: allItems.filter((n) => n.category === "positive_development").length,
    queue: queueRes.data?.length ?? 0,
    sourceCount: new Set(feedRes.data?.map((n) => n.source).filter(Boolean) as string[]).size,
  };

  return (
    <EcosystemDashboard
      data={{
        queue: queueRes.data ?? [],
        feed: feedRes.data ?? [],
        positive: positiveRes.data ?? [],
        stats,
      }}
    />
  );
}
