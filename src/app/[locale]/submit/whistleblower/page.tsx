import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { WhistleblowerForm } from "@/components/whistleblower/whistleblower-form";
import { Lock } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "whistleblower" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function WhistleblowerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "whistleblower" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <Container size="narrow" className="py-12">
      <header className="mb-8 space-y-2">
        <div className="border-brand-500/30 bg-brand-500/10 text-brand-400 mb-2 inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 text-xs font-bold tracking-wider uppercase">
          <Lock className="h-3.5 w-3.5" />
          {tCommon("secureAndAnonymous", { defaultValue: "SECURE & ANONYMOUS" })}
        </div>
        <h1 className="text-fg-primary text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-fg-muted text-sm">{t("subtitle")}</p>
      </header>

      <Card variant="elevated">
        <CardContent className="p-6 sm:p-8">
          <WhistleblowerForm />
        </CardContent>
      </Card>
    </Container>
  );
}
