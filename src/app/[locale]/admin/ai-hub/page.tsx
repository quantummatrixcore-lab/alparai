import { redirect } from "next/navigation";

export default async function AiHubRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/ai-hub/orchestrator`);
}
