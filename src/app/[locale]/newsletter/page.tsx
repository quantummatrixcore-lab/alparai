import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import { Mail, Shield, Bell } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletter" });
  return { title: t("title") };
}

export default async function NewsletterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "newsletter" });

  return (
    <Container className="max-w-xl py-16">
      <Card variant="elevated" className="border-brand-500/20 shadow-2xl">
        <CardHeader className="pb-4 text-center">
          <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-fg-primary text-2xl font-black tracking-tight">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-fg-secondary mt-2 text-sm">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <NewsletterForm />

          <div className="border-border-subtle mt-8 grid grid-cols-2 gap-4 border-t pt-6">
            <div className="flex items-start gap-2.5">
              <Shield className="text-success-500 mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <h4 className="text-fg-primary text-xs font-bold">{t("gdprAligned")}</h4>
                <p className="text-fg-muted mt-0.5 text-[10px]">{t("gdprDesc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Bell className="text-brand-400 mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <h4 className="text-fg-primary text-xs font-bold">{t("weeklyPulse")}</h4>
                <p className="text-fg-muted mt-0.5 text-[10px]">{t("weeklyPulseDesc")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
