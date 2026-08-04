import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/utils/unsubscribe";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { logger } from "@/lib/utils/logger";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: locale === "tr" ? "Abonelik İptali — ALPAR AI" : "Unsubscribe — ALPAR AI" };
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

  const { userId, token, type, ok } = await searchParams;

  const isTr = locale === "tr";

  if (ok === "1") {
    const successMessage = isTr
      ? "Tüm e-posta bildirimlerinden başarıyla çıkış yaptınız."
      : "You have been successfully unsubscribed from all email notifications.";
    return (
      <Container size="narrow" className="py-20">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-emerald-500">
              {isTr ? "Abonelik İptal Edildi" : "Unsubscribed Successfully"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-fg-muted text-center">
            <p className="text-fg-primary mb-4 text-base font-semibold">{successMessage}</p>
            <p className="text-sm">
              {isTr
                ? "Herhangi bir zamanda hesabınıza giriş yaparak Tercihler sayfasından bildirimlerinizi yeniden açabilirsiniz."
                : "You can turn notifications back on at any time by logging into your account and visiting Settings."}
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <Link href={`/${locale}`} className="text-sm text-cyan-500 hover:underline">
                {isTr ? "Ana Sayfa" : "Home"}
              </Link>
              <span className="text-fg-muted">|</span>
              <Link href={`/${locale}/settings`} className="text-sm text-cyan-500 hover:underline">
                {isTr ? "Ayarlar" : "Settings"}
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
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-red-500">
              {isTr ? "Geçersiz İstek" : "Invalid Request"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-fg-muted text-center">
            <p>
              {isTr
                ? "Abonelik iptal bağlantısı eksik veya geçersiz. Lütfen e-postanızdaki bağlantıyı tam olarak kullandığınızdan emin olun."
                : "The unsubscribe link is missing or invalid. Please check that you used the full link from your email."}
            </p>
            <div className="mt-6">
              <Link href={`/${locale}`} className="text-cyan-500 hover:underline">
                {isTr ? "Ana Sayfaya Dön" : "Back to Home"}
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
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-red-500">
              {isTr ? "Geçersiz Güvenlik Anahtarı" : "Security Verification Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-fg-muted text-center">
            <p>
              {isTr
                ? "Güvenlik doğrulaması başarısız oldu. Bu bağlantının süresi dolmuş olabilir veya bağlantı değiştirilmiş."
                : "Security verification failed. This link may have expired or been modified."}
            </p>
            <div className="mt-6">
              <Link href={`/${locale}`} className="text-cyan-500 hover:underline">
                {isTr ? "Ana Sayfaya Dön" : "Back to Home"}
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

  let successMessage = "";
  if (isTr) {
    successMessage = "Bildirim tercihleriniz başarıyla güncellendi.";
  } else {
    successMessage = "Your email notification preferences have been successfully updated.";
  }

  const updatePayload: Record<string, boolean> = {};
  if (prefType === "weekly_digest") {
    updatePayload.weekly_digest = false;
    if (isTr) successMessage = "Haftalık bülten aboneliğiniz iptal edildi.";
    else successMessage = "You have been unsubscribed from the weekly digest.";
  } else if (prefType === "watches") {
    updatePayload.watches = false;
    if (isTr) successMessage = "Takip ettiğiniz olay bildirimleri iptal edildi.";
    else successMessage = "You have unsubscribed from incident watch notifications.";
  } else if (prefType === "reporter_notifications") {
    updatePayload.reporter_notifications = false;
    if (isTr) successMessage = "Rapor bildirimleriniz (sağlayıcı yanıtları vb.) iptal edildi.";
    else successMessage = "You have unsubscribed from reporter and provider response alerts.";
  } else {
    // Unsubscribe from all
    updatePayload.weekly_digest = false;
    updatePayload.watches = false;
    updatePayload.reporter_notifications = false;
    if (isTr) successMessage = "Tüm e-posta bildirimlerinden başarıyla çıkış yaptınız.";
    else successMessage = "You have been successfully unsubscribed from all email notifications.";
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
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-red-500">
              {isTr ? "Sistem Hatası" : "System Error"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-fg-muted text-center">
            <p>
              {isTr
                ? "Tercihleriniz güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
                : "An error occurred while updating your preferences. Please try again later."}
            </p>
            <div className="mt-6">
              <Link href={`/${locale}`} className="text-cyan-500 hover:underline">
                {isTr ? "Ana Sayfaya Dön" : "Back to Home"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="narrow" className="py-20">
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-emerald-500">
            {isTr ? "Abonelik İptal Edildi" : "Unsubscribed Successfully"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-fg-muted text-center">
          <p className="text-fg-primary mb-4 text-base font-semibold">{successMessage}</p>
          <p className="text-sm">
            {isTr
              ? "Herhangi bir zamanda hesabınıza giriş yaparak Tercihler sayfasından bildirimlerinizi yeniden açabilirsiniz."
              : "You can turn notifications back on at any time by logging into your account and visiting Settings."}
          </p>
          <div className="mt-8 flex justify-center space-x-6">
            <Link href={`/${locale}`} className="text-sm text-cyan-500 hover:underline">
              {isTr ? "Ana Sayfa" : "Home"}
            </Link>
            <span className="text-fg-muted">|</span>
            <Link href={`/${locale}/settings`} className="text-sm text-cyan-500 hover:underline">
              {isTr ? "Ayarlar" : "Settings"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
