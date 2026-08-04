import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { OnboardingWizard } from "@/components/auth/onboarding-wizard";
import { Container } from "@/components/ui/layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding" });
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/auth/signin?next=/${locale}/onboarding`);
  }

  return (
    <Container size="narrow" className="py-12 md:py-20">
      <Suspense
        fallback={
          <div className="text-fg-muted text-center font-mono text-xs">Loading onboarding...</div>
        }
      >
        <OnboardingWizard locale={locale} />
      </Suspense>
    </Container>
  );
}
