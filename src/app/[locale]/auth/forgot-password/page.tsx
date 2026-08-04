import { setRequestLocale } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return { title: "Şifremi Unuttum · ALPAR AI" };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordForm />;
}
