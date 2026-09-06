import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "@/i18n/routing";
import { AutonomousCompanyCanvas } from "@/components/admin/autonomous-company/AutonomousCompanyCanvas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autonomous AI Company — 24/7 Multi-Agent Operations · ALPAR AI",
  description: "Live gamified 24/7 command center and multi-agent conveyor belt orchestration.",
};

export default async function AutonomousCompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/auth/signin?returnTo=/admin/autonomous-company", locale });
    return null;
  }

  // Strict Executive RBAC Gate: Only admin and ceo roles permitted
  if (user.role !== "admin" && user.role !== "ceo") {
    redirect({ href: "/", locale });
    return null;
  }

  return (
    <div className="bg-bg-primary text-fg-primary min-h-screen py-6">
      <AutonomousCompanyCanvas />
    </div>
  );
}
