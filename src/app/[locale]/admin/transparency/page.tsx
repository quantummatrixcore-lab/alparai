import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireModerator } from "@/lib/auth/session";
import { AdminContainer, AdminPageHeader } from "@/components/admin/admin-design-kit";
import { Flame } from "lucide-react";
import { TransparencyDeskClient } from "@/components/admin/transparency/transparency-desk-client";

export default async function TransparencyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireModerator();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <AdminContainer shell>
      <AdminPageHeader
        icon={<Flame className="h-6 w-6 text-rose-500" />}
        title="Streisand Legal Notice & Threat Desk"
        subtitle="Tracking vendor legal threats, SLAPP suits, and takedown demands sent against AI whistleblowers and security researchers with automated public transparency triggers."
        lastUpdated={new Date().toLocaleDateString(locale)}
        breadcrumb={[
          { label: "Admin", href: "/admin" },
          { label: "Transparency Desk", href: "/admin/transparency" },
        ]}
      />

      <TransparencyDeskClient />
    </AdminContainer>
  );
}

export const metadata = {
  title: "Streisand Legal Radar | ALPAR AI Admin",
  description:
    "Streisand Legal Notice & Vendor Threat Monitoring Desk protecting AI transparency and whistleblower rights.",
};
