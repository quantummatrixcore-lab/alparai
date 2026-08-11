import { IntegrationsClient } from "@/components/admin/integrations/integrations-client";

export default async function AdminIntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const unwrappedParams = await params;
  const locale = unwrappedParams.locale;

  return <IntegrationsClient locale={locale} />;
}
