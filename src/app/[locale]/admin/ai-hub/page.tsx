import { redirect } from "next/navigation";

/** Responsive AI Hub Redirect */
export default async function AiHubRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/admin/ai-hub/orchestrator`);
}
