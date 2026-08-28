import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { Target } from "lucide-react";
import { ChallengesBankClient } from "@/components/admin/challenges/challenges-bank-client";

export default async function ChallengesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<Target className="h-6 w-6 text-rose-400" />}
        title="Topluluk Kırmızı Takım Test Bankası (Red-Teaming Bank)"
        subtitle="Adversarial red-teaming bounties, jailbreak taxonomy bank, and automated sandboxed prompt vulnerability evaluations."
        lastUpdated={new Date().toLocaleDateString(locale)}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Red-Teaming Bank", href: "/admin/challenges" },
        ]}
      />

      <ChallengesBankClient />
    </AdminContainer>
  );
}

export const metadata = {
  title: "Red-Teaming Challenge Bank | ALPAR AI Admin",
  description:
    "Community Red-Teaming & Adversarial AI Challenge Bank with automated sandbox testing.",
};
