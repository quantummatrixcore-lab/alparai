import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { requireAdmin } from "@/lib/auth/session";
import {
  SocialDashboardClient,
  type MarketingDraft,
} from "@/components/admin/social-dashboard-client";
import { ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import {
  getSocialPosts,
  getSocialTemplates,
  getSocialAssets,
  getSocialAccounts,
  getMarketingDrafts,
} from "@/actions/social";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("social") || "Social Media Automation"} | ALPAR AI` };
}

export default async function SocialPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  // Authenticate user & check admin access
  await requireAdmin();

  const [posts, templates, assets, accounts, marketingDrafts] = await Promise.all([
    getSocialPosts(),
    getSocialTemplates(),
    getSocialAssets(),
    getSocialAccounts(),
    getMarketingDrafts(),
  ]);

  return (
    <div className="min-h-screen py-8">
      <Container>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <ShareNetwork className="text-brand-400 h-6 w-6" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                {t("social_automation_title") || "Social Media Automation"}
              </h1>
            </div>
            <p className="text-fg-muted mt-1 text-sm">
              {t("social_automation_subtitle") ||
                "Manage accounts and approve AI-generated drafts before publishing"}
            </p>
          </div>
        </div>

        <SocialDashboardClient
          initialPosts={posts}
          initialTemplates={templates}
          initialAssets={assets}
          initialAccounts={accounts}
          initialMarketingDrafts={marketingDrafts as MarketingDraft[]}
        />
      </Container>
    </div>
  );
}
