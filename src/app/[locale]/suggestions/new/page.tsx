import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { getCurrentUser } from "@/lib/auth/session";
import { GoogleSignInButton, EmailMagicLinkForm } from "@/components/auth/auth-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { NewSuggestionForm } from "@/components/marketing/new-suggestion-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "suggestions" });
  return { title: t("create_title") };
}

export default async function NewSuggestionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  const t = await getTranslations({ locale, namespace: "suggestions" });
  if (!user) {
    return (
      <Container size="narrow" className="py-12">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Shield className="text-brand-400 h-5 w-5" />
              {t("signInToSuggest")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignInButton next={`/${locale}/suggestions/new`} className="w-full" />
            <EmailMagicLinkForm />
          </CardContent>
        </Card>
      </Container>
    );
  }
  return (
    <Container size="narrow" className="py-12">
      <header className="mb-6">
        <h1 className="text-fg-primary text-3xl font-bold tracking-tight">{t("newSuggestion")}</h1>
        <p className="text-fg-muted mt-1 text-sm">{t("shareIdea")}</p>
      </header>
      <NewSuggestionForm />
    </Container>
  );
}
