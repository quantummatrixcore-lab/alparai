import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SignInForm } from "@/components/auth/sign-in-form";
import { AlertCircle, Mail } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/layout/logo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: `${t("signin_title")} — ALPAR AI`,
    description: t("signin_description"),
  };
}

const ERROR_KEYS: Record<
  string,
  "oauth_failed" | "otp_failed" | "server_error" | "missing_params"
> = {
  oauth: "oauth_failed",
  otp: "otp_failed",
  server_error: "server_error",
  missing_params: "missing_params",
};

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; reason?: string; sent?: string; email?: string }>;
}) {
  const { locale } = await params;
  const { error, reason, sent, email } = await searchParams;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (user) redirect(`/${locale}/profile`);

  const t = await getTranslations({ locale, namespace: "auth" });

  const errorKey = error ? ERROR_KEYS[error] : null;
  const errorMessage = errorKey
    ? (() => {
        try {
          return t(errorKey);
        } catch {
          return null;
        }
      })()
    : null;

  const showMagicLinkConfirmation = sent === "1" && email;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070913] px-4 py-16">
      {/* Background Gradients & Grid */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:40px_40px]" />

        {/* Ambient Glows */}
        <div className="bg-brand-500/10 absolute -top-[20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/8 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex justify-center">
            <Logo
              size="xl"
              className="drop-shadow-[0_0_35px_rgba(168,85,247,0.45)] filter transition-all duration-500 hover:scale-105"
            />
          </div>
          <h1 className="text-fg-primary text-3xl font-extrabold tracking-tight drop-shadow-md">
            {t("signin_title")}
          </h1>
          <p className="text-fg-muted mt-2.5 text-sm font-medium tracking-wide">{t("tagline")}</p>
        </div>

        {/* Glassmorphic Container Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0F1424]/60 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
          {/* Magic link confirmation */}
          {showMagicLinkConfirmation && (
            <div
              className="border-success-500/30 bg-success-500/10 text-success-500 mb-6 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm"
              role="status"
              aria-live="polite"
            >
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold">{t("magic_link_sent_toast", { email })}</p>
              </div>
            </div>
          )}

          {/* Error alerts */}
          {errorMessage && (
            <div
              className="border-danger-500/30 bg-danger-500/10 text-danger-400 mb-6 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-semibold">{errorMessage}</p>
                {reason && (
                  <p className="text-fg-muted mt-1.5 font-mono text-xs break-all">[{reason}]</p>
                )}
              </div>
            </div>
          )}

          {/* Welcome Text */}
          <div className="mb-8 text-center">
            <h2 className="text-fg-primary text-2xl font-extrabold tracking-tight">
              {t("welcome_title")}
            </h2>
            <p className="text-fg-muted mt-1.5 text-sm font-medium">{t("welcome_subtitle")}</p>
          </div>

          <SignInForm locale={locale} />
        </div>

        {/* Footer info links */}
        <p className="text-fg-muted/65 mt-8 text-center text-xs font-medium">
          {t("signin_footer_prefix")}{" "}
          <Link href="/legal/terms" className="text-brand-400 font-semibold hover:underline">
            {t("terms_service")}
          </Link>{" "}
          {t("signin_footer_and")}{" "}
          <Link href="/legal/privacy" className="text-brand-400 font-semibold hover:underline">
            {t("terms_privacy")}
          </Link>
        </p>
      </div>
    </div>
  );
}
