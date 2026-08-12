import { redirect } from "next/navigation";

export default async function MetricsHubRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/metrics-hub/slo-dashboard`);
}
