import { setRequestLocale, getTranslations } from "next-intl/server";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { AdminHQDashboard } from "@/components/admin/admin-hq-dashboard";
import { parseMasterPlan } from "@/lib/utils/markdown-parser";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("dashboard") };
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin`);

  const userRole = user.role as string;
  if (
    userRole !== "moderator" &&
    userRole !== "admin" &&
    userRole !== "ceo" &&
    userRole !== "advisor"
  ) {
    redirect(`/${locale}`);
  }

  const admin = createAdminClient();
  // eslint-disable-next-line react-hooks/purity
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: total },
    { count: pending },
    { count: totalUsers },
    { data: recentUsersRaw },
    { data: recentIncidents },
    dsarResult,
    { count: users30 },
    { count: incidents30 },
    { count: newsletter30 },
    grantResult,
  ] = await Promise.all([
    admin.from("incidents").select("*", { count: "exact", head: true }),
    admin
      .from("incidents")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    admin.from("users").select("*", { count: "exact", head: true }),
    admin
      .from("users")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("incidents")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
    (async () => {
      try {
        const { count } = await admin
          .from("dsar_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
        return { count: count ?? 0 };
      } catch {
        return { count: 0 };
      }
    })(),
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    admin
      .from("incidents")
      .select("*", { count: "exact", head: true })
      .gte("published_at", thirtyDaysAgo),
    admin
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .gte("subscribed_at", thirtyDaysAgo),
    admin.from("grant_applications").select("status"),
  ]);

  const pendingDsar = dsarResult.count;

  // Build day-by-day incident counts for the last 7 days
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  const incidentsByDayMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    // eslint-disable-next-line react-hooks/purity
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    incidentsByDayMap[dayLabels[d.getDay()]!] = 0;
  }
  for (const inc of recentIncidents ?? []) {
    const d = new Date(inc.created_at as string);
    const label = dayLabels[d.getDay()]!;
    if (label in incidentsByDayMap) {
      incidentsByDayMap[label] = (incidentsByDayMap[label] ?? 0) + 1;
    }
  }
  const incidentsByDay = Object.entries(incidentsByDayMap).map(([day, count]) => ({ day, count }));

  const planItems = parseMasterPlan().items;
  const planCompleted = planItems.filter((i) => i.status === "completed").length;

  const grants = grantResult?.data ?? [];
  const grantApproved = grants.filter((g: { status: string }) => g.status === "approved").length;
  const grantRejected = grants.filter((g: { status: string }) => g.status === "rejected").length;
  const grantTotal = grants.length;

  interface SafeUserItem {
    id: string;
    email: string;
    full_name?: string | null;
    role?: string | null;
    created_at: string;
  }
  const recentUsers = (recentUsersRaw as unknown as SafeUserItem[]) ?? [];

  return (
    <AdminContainer>
      <AdminPageHeader
        icon={<Shield className="h-7 w-7 text-emerald-400" />}
        title={t("dashboard") || "Control Center"}
        subtitle={t("dashboard_subtitle") || "360° platform monitoring and operations cockpit"}
      />
      <AdminHQDashboard
        totalIncidents={total ?? 0}
        pendingQueue={pending ?? 0}
        totalUsers={totalUsers ?? 0}
        planCompleted={planCompleted}
        planTotal={planItems.length}
        planItems={planItems}
        recentUsers={recentUsers}
        incidentsByDay={incidentsByDay}
        pendingDsar={pendingDsar}
        locale={locale}
        startupHealthMetrics={{
          users: users30 ?? 0,
          incidents: incidents30 ?? 0,
          newsletter: newsletter30 ?? 0,
        }}
        grantStats={{
          approved: grantApproved,
          rejected: grantRejected,
          total: grantTotal,
        }}
      />
    </AdminContainer>
  );
}
