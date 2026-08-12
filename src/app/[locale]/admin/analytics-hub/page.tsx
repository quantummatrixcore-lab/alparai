import { redirect } from "next/navigation";

export default async function AnalyticsHubRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/analytics-hub/analysis`);
}
