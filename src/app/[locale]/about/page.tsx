import { getTranslations } from "next-intl/server";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { constructPageMetadata } from "@/lib/seo/metadata";
import { AboutPageJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return constructPageMetadata({
    locale,
    pathname: "/about",
    title: t("title"),
    description: t("vision_desc"),
  });
}

export default function AboutPage() {
  const locale = useLocale();
  const t = useTranslations("about");
  const tCommittee = useTranslations("about_methodology_committee");
  const tBlog = useTranslations("blog");

  return (
    <div className="min-h-screen bg-black px-6 pt-4 pb-12 text-white md:pt-8 md:pb-16">
      <div className="mx-auto max-w-4xl space-y-24">
        {/* Vision */}
        <section className="space-y-6 text-center">
          <h1 className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-7xl">
            {t("title")}
          </h1>
          <div className="border-border-subtle mt-12 rounded-3xl border bg-white/5 p-8 backdrop-blur-md">
            <h2 className="mb-4 text-3xl font-semibold">{t("vision_title")}</h2>
            <p className="text-fg-muted text-lg leading-relaxed">{t("vision_desc")}</p>
          </div>
        </section>

        {/* Governance */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-semibold">{tBlog("tags.governance")}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/about/advisory-board"
              className="group border-border-subtle flex items-center justify-between gap-4 rounded-2xl border bg-white/5 p-6 transition-colors hover:bg-white/10"
            >
              <div>
                <h3 className="text-xl font-medium">{t("advisory_board_title")}</h3>
                <p className="text-fg-muted">{t("advisory_board_desc")}</p>
              </div>
              <ArrowUpRight className="text-fg-muted h-6 w-6 shrink-0 transition-colors group-hover:text-white" />
            </Link>
            <Link
              href="/about/methodology-committee"
              className="group border-border-subtle flex items-center justify-between gap-4 rounded-2xl border bg-white/5 p-6 transition-colors hover:bg-white/10"
            >
              <div>
                <h3 className="text-xl font-medium">{tCommittee("title")}</h3>
                <p className="text-fg-muted">{tCommittee("description")}</p>
              </div>
              <ArrowUpRight className="text-fg-muted h-6 w-6 shrink-0 transition-colors group-hover:text-white" />
            </Link>
          </div>
        </section>

        {/* MOUs */}
        <section className="border-border-subtle space-y-6 rounded-3xl border bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 text-center backdrop-blur-lg">
          <h2 className="text-3xl font-semibold">{t("mou_title")}</h2>
          <p className="text-fg-secondary mx-auto max-w-2xl text-lg">{t("mou_desc")}</p>
        </section>

        <BreadcrumbJsonLd
          items={[
            { name: "Home", url: `${APP_URL}/${locale}` },
            { name: t("title"), url: `${APP_URL}/${locale}/about` },
          ]}
        />
        <AboutPageJsonLd
          name={t("title")}
          description={t("vision_desc")}
          url={`${APP_URL}/${locale}/about`}
        />
      </div>
    </div>
  );
}
