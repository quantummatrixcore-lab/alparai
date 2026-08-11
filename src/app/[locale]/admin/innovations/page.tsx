import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getInnovations, getExternalQueue, getConnectorStatuses } from "@/actions/innovations";
import { InnovationsClient } from "@/components/admin/innovations-client";
import type { ExternalIncidentQueueItem, StrategyInnovation } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("innovations") || "Innovations" };
}

export default async function AdminInnovationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/innovations`);

  // Only CEO and Admin can access Innovations Hub
  if (user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}/admin`);
  }

  const [innovationsData, queueData, connectorsData] = await Promise.all([
    getInnovations(),
    getExternalQueue(),
    getConnectorStatuses(),
  ]);

  // Filter queue items to only show pending ones
  const pendingQueue = (queueData || []).filter(
    (item) => item.status === "pending",
  ) as ExternalIncidentQueueItem[];
  const initialInnovations = (innovationsData || []) as StrategyInnovation[];

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <div className="rounded-3xl bg-zinc-900/40 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:p-8">
        <InnovationsClient
          initialInnovations={initialInnovations}
          initialQueue={pendingQueue}
          initialConnectors={connectorsData}
          locale={locale}
        />
      </div>
    </div>
  );
}
