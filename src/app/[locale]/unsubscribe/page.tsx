import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/utils/unsubscribe";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { logger } from "@/lib/utils/logger";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "unsubscribe" });
  return { title: t("meta_title") };
}

interface UnsubscribePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    userId?: string;
    token?: string;
    type?: string;
    ok?: string;
  }>;
}

export default async function UnsubscribePage({ params, searchParams }: UnsubscribePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "unsubscribe" });

  const { userId, token, type, ok } = await searchParams;

  if (ok === "1") {
    return (
      <Container size="narrow" className="py-20">
        <Card className="border-success-500/20 bg-emerald-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-emerald-500">{t("unsubscribed_title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-fg-muted text-center">
            <p className="text-fg-primary mb-4 text-base font-semibold">
              {t("unsubscribed_desc_all")}
            </p>
            <p className="text-sm">{t("reopen_note")}</p>
            <div className="mt-8 flex justify-center space-x-6">
              <Link href={`/${locale}`} className="text-sm text-cyan-500 hover:underline">
                {t("home")}
              </Link>
              <span className="text-fg-muted">|</span>
              <Link href={`/${locale}/settings`} className="text-sm text-cyan-500 hover:underline">
                {t("settings")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!userId || !token) {
    return (
      <Container size="narrow" className="py-20">
        <Card className="border-danger-500/20 bg-red-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-red-500">{t("invalid_title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-fg-muted text-center">
            <p>{t("invalid_desc")}</p>
            <div className="mt-6">
              <Link href={`/${locale}`} className="text-cyan-500 hover:underline">
                {t("back_to_home")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 1. Verify token
  const isValid = verifyUnsubscribeToken(userId, token);

  if (!isValid) {
    return (
      <Container size="narrow" className="py-20">
        <Card className="border-danger-500/20 bg-red-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-red-500">{t("security_failed_title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-fg-muted text-center">
            <p>{t("security_failed_desc")}</p>
            <div className="mt-6">
              <Link href={`/${locale}`} className="text-cyan-500 hover:underline">
                {t("back_to_home")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 2. Perform database update
  const admin = createAdminClient();
  const prefType = type || "all";

  let successMessage = t("unsubscribed_desc_updated");

  const updatePayload: Record<string, boolean> = {};
  if (prefType === "weekly_digest") {
    updatePayload.weekly_digest = false;
    successMessage = t("unsubscribed_desc_digest");
  } else if (prefType === "watches") {
    updatePayload.watches = false;
    successMessage = t("unsubscribed_desc_watches");
  } else if (prefType === "reporter_notifications") {
    updatePayload.reporter_notifications = false;
    successMessage = t("unsubscribed_desc_reporter");
  } else {
    // Unsubscribe from all
    updatePayload.weekly_digest = false;
    updatePayload.watches = false;
    updatePayload.reporter_notifications = false;
    successMessage = t("unsubscribed_desc_all");
  }

  const { error } = await admin
    .from("email_preferences")
    .update({
      ...updatePayload,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    logger.error(
      "[Unsubscribe] Database update failed",
      undefined,
      error instanceof Error ? error : undefined,
    );
    return (
      <Container size="narrow" className="py-20">
        <Card className="border-danger-500/20 bg-red-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-red-500">{t("system_error_title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-fg-muted text-center">
            <p>{t("system_error_desc")}</p>
            <div className="mt-6">
              <Link href={`/${locale}`} className="text-cyan-500 hover:underline">
                {t("back_to_home")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="narrow" className="py-20">
      <Card className="border-success-500/20 bg-emerald-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-emerald-500">{t("unsubscribed_title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-fg-muted text-center">
          <p className="text-fg-primary mb-4 text-base font-semibold">{successMessage}</p>
          <p className="text-sm">{t("reopen_note")}</p>
          <div className="mt-8 flex justify-center space-x-6">
            <Link href={`/${locale}`} className="text-sm text-cyan-500 hover:underline">
              {t("home")}
            </Link>
            <span className="text-fg-muted">|</span>
            <Link href={`/${locale}/settings`} className="text-sm text-cyan-500 hover:underline">
              {t("settings")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
