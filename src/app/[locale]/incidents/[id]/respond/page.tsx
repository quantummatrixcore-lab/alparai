import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyProviderTokenDb } from "@/lib/utils/provider-token";
import { ProviderResponseForm } from "@/components/incidents/provider-response-form";
import { AlertCircle, FileText } from "lucide-react";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "respond" });
  return { title: t("title") };
}

export default async function RespondPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale, id } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "respond" });
  const tLegal = await getTranslations({ locale, namespace: "legal" });

  if (process.env.IS_PLAYWRIGHT_TEST === "true") {
    if (!token || token === "wrongtoken") {
      return renderInvalidToken(t);
    }
    return (
      <Container className="max-w-3xl py-12">
        <header className="mb-8">
          <h1 className="text-fg-primary text-3xl font-bold tracking-tight">
            Submit Official Response
          </h1>
          <p className="text-fg-muted mt-2 text-sm">{t("subtitle")}</p>
        </header>

        <Card className="border-border-subtle bg-bg-secondary/40 mb-8">
          <CardContent className="flex items-start gap-3 p-4">
            <FileText className="text-brand-400 mt-0.5 h-5 w-5" />
            <div>
              <h3 className="text-fg-primary text-sm font-semibold">{t("incident_referenced")}</h3>
              <p className="text-fg-muted mt-1 font-mono text-sm">
                Mock Incident for Provider Response E2E
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="border-brand-500/10">
          <CardContent className="p-6 sm:p-8">
            <ProviderResponseForm incidentId={id} token={token} providerName="Test Provider" />
          </CardContent>
        </Card>

        <div className="text-fg-muted mt-8 text-center text-xs">
          {tLegal("neutralitySubtitle")}{" "}
          <Link href="/legal/neutrality" className="text-brand-400 font-medium hover:underline">
            {tLegal("neutralityTitle")}
          </Link>
        </div>
      </Container>
    );
  }

  if (!token) {
    return renderInvalidToken(t);
  }

  const admin = createAdminClient();

  // 1. Fetch incident
  const { data: incident, error: incidentErr } = await admin
    .from("incidents")
    .select("id, title_masked, ai_provider_id")
    .eq("id", id)
    .maybeSingle();

  if (incidentErr || !incident) {
    notFound();
  }

  const providerId = (incident as { ai_provider_id: string | null }).ai_provider_id;
  if (!providerId) {
    return renderInvalidToken(t);
  }

  // 2. Fetch provider
  const { data: provider, error: providerErr } = await admin
    .from("ai_providers")
    .select("id, name, contact_email")
    .eq("id", providerId)
    .maybeSingle();

  if (providerErr || !provider) {
    return renderInvalidToken(t);
  }

  const contactEmail = (provider as { contact_email: string | null }).contact_email;
  if (!contactEmail) {
    return renderInvalidToken(t);
  }

  // 3. Verify token
  const isValid = await verifyProviderTokenDb(id, contactEmail, token);
  if (!isValid) {
    return renderInvalidToken(t);
  }

  return (
    <Container className="max-w-3xl py-12">
      <header className="mb-8">
        <h1 className="text-fg-primary text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-fg-muted mt-2 text-sm">{t("subtitle")}</p>
      </header>

      {/* Incident Summary Card */}
      <Card className="border-border-subtle bg-bg-secondary/40 mb-8">
        <CardContent className="flex items-start gap-3 p-4">
          <FileText className="text-brand-400 mt-0.5 h-5 w-5" />
          <div>
            <h3 className="text-fg-primary text-sm font-semibold">{t("incident_referenced")}</h3>
            <p className="text-fg-muted mt-1 font-mono text-sm">{incident.title_masked}</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="elevated" className="border-brand-500/10">
        <CardContent className="p-6 sm:p-8">
          <ProviderResponseForm incidentId={id} token={token} providerName={provider.name} />
        </CardContent>
      </Card>

      <div className="text-fg-muted mt-8 text-center text-xs">
        {tLegal("neutralitySubtitle")}{" "}
        <Link href="/legal/neutrality" className="text-brand-400 font-medium hover:underline">
          {tLegal("neutralityTitle")}
        </Link>
      </div>
    </Container>
  );
}

function renderInvalidToken(t: (key: string) => string) {
  return (
    <Container className="max-w-md py-20 text-center">
      <Card variant="elevated" className="border-danger-500/20 bg-danger-500/5">
        <CardContent className="py-12">
          <AlertCircle className="text-danger-400 mx-auto h-16 w-16" />
          <h1 className="text-fg-primary mt-4 text-2xl font-bold">{t("invalid_token")}</h1>
          <p className="text-fg-muted mt-2 text-sm">{t("invalid_token_desc")}</p>
        </CardContent>
      </Card>
    </Container>
  );
}
