export const revalidate = 60;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wordmark } from "@/components/layout/wordmark";
import { getGlobalMetrics } from "@/lib/services/metrics-service";
import { Download, Mail, Globe, Award, FileText, BarChart3, Code2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PRESS_RELEASES } from "@/lib/constants/press-releases";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: `Press Kit | AlparAI`,
    description: `AlparAI brand assets, press releases, and media resources`,
    openGraph: {
      title: `Press Kit | AlparAI`,
      description: `AlparAI brand assets, press releases, and media resources`,
      images: ["/brand-assets/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `Press Kit | AlparAI`,
      images: ["/brand-assets/og-image.png"],
    },
  };
}

export default async function PressKitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pressKit" });

  const { totalIncidents, totalProviders, totalOfficialResponses, averageTrustScore } =
    await getGlobalMetrics();

  const isEn = locale === "en";

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="border-border-subtle/50 bg-bg-primary border-b pt-4 pb-12 text-center md:pt-8 md:pb-16">
        <Container>
          <div className="mx-auto max-w-3xl space-y-4">
            <span className="border-success-500/20 rounded-full border bg-emerald-500/10 px-3 py-1 text-xs font-bold tracking-wider text-emerald-400 uppercase">
              {t("mediaResources")}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {t("title")}
            </h1>
            <p className="text-fg-muted mx-auto max-w-xl text-lg leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Brand Story Section */}
            <Card className="border-border-subtle/50 bg-bg-navy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-emerald-400" /> {t("brandStoryTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-fg-primary space-y-4 text-sm leading-relaxed">
                <p>{t("brandStoryP1")}</p>
                <p>{t("brandStoryP2")}</p>
              </CardContent>
            </Card>

            {/* Platform Stats — Facts & Figures */}
            <Card className="border-success-500/20 bg-bg-navy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  {isEn ? "Facts & Figures" : "Platform İstatistikleri"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="border-border-subtle/50 bg-bg-primary rounded-lg border p-4 text-center">
                    <dd className="text-3xl font-black text-emerald-400">{totalIncidents}</dd>
                    <dt className="text-fg-muted mt-1 text-[10px] font-bold tracking-wider uppercase">
                      {isEn ? "Reported Incidents" : "Kayıtlı Vakalar"}
                    </dt>
                  </div>
                  <div className="border-border-subtle/50 bg-bg-primary rounded-lg border p-4 text-center">
                    <dd className="text-3xl font-black text-emerald-400">{totalProviders}</dd>
                    <dt className="text-fg-muted mt-1 text-[10px] font-bold tracking-wider uppercase">
                      {isEn ? "AI Providers" : "Takip Edilen Sağlayıcılar"}
                    </dt>
                  </div>
                  <div className="border-border-subtle/50 bg-bg-primary rounded-lg border p-4 text-center">
                    <dd className="text-3xl font-black text-emerald-400">
                      {totalOfficialResponses}
                    </dd>
                    <dt className="text-fg-muted mt-1 text-[10px] font-bold tracking-wider uppercase">
                      {isEn ? "Official Responses" : "Resmi Yanıtlar"}
                    </dt>
                  </div>
                  <div className="border-border-subtle/50 bg-bg-primary rounded-lg border p-4 text-center">
                    <dd className="text-3xl font-black text-emerald-400">{averageTrustScore}</dd>
                    <dt className="text-fg-muted mt-1 text-[10px] font-bold tracking-wider uppercase">
                      {isEn ? "Avg Trust Score" : "Ort. Trust Skoru"}
                    </dt>
                  </div>
                </dl>
                <p className="text-fg-muted mt-3 text-center text-[10px]">
                  {isEn
                    ? "Live data — updated every 60 seconds"
                    : "Canlı veri — 60 saniyede bir güncellenir"}
                </p>
              </CardContent>
            </Card>

            {/* Brand Assets & Guidelines */}
            <Card className="border-border-subtle/50 bg-bg-navy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="h-5 w-5 text-emerald-400" /> {t("brandIdentityTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-fg-primary text-sm leading-relaxed">{t("brandIdentityDesc")}</p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="border-border-subtle/50 bg-bg-primary flex flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center">
                    <Wordmark size="md" />
                    <span className="text-fg-muted text-xs">{t("darkThemeLabel")}</span>
                  </div>
                  <div className="border-border-subtle/50 bg-bg-primary flex flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center">
                    <div className="text-2xl font-black tracking-tighter text-emerald-400">
                      ALPAR AI
                    </div>
                    <span className="text-fg-muted text-xs">{t("standardLogotype")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Palette */}
            <Card className="border-border-subtle/50 bg-bg-navy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="h-5 w-5 text-emerald-400" /> {t("colorPaletteTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="border-border-subtle/50 bg-bg-primary rounded-lg border p-4 text-center">
                  <div className="bg-emerald-accent mb-2 h-12 w-full rounded-md shadow-inner" />
                  <span className="block text-xs font-bold text-white">Emerald (Brand)</span>
                  <span className="text-fg-muted text-[10px]">#00FF88</span>
                </div>
                <div className="border-border-subtle/50 bg-bg-primary rounded-lg border p-4 text-center">
                  <div className="border-border-subtle bg-bg-primary mb-2 h-12 w-full rounded-md border shadow-inner" />
                  <span className="block text-xs font-bold text-white">Dark Slate (Bg)</span>
                  <span className="text-fg-muted text-[10px]">#0A1622</span>
                </div>
                <div className="border-border-subtle/50 bg-bg-primary rounded-lg border p-4 text-center">
                  <div className="mb-2 h-12 w-full rounded-md bg-[#E2E8F0] shadow-inner" />
                  <span className="block text-xs font-bold text-white">Light Gray (Fg)</span>
                  <span className="text-fg-muted text-[10px]">#E2E8F0</span>
                </div>
              </CardContent>
            </Card>

            {/* Press Releases */}
            <div className="space-y-4 pt-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FileText className="h-5 w-5 text-emerald-400" /> {t("pressReleasesTitle")}
              </h2>
              <p className="text-fg-muted text-sm">{t("pressReleasesDesc")}</p>

              <div className="grid grid-cols-1 gap-4">
                {PRESS_RELEASES.map((release) => (
                  <Link
                    key={release.slug}
                    href={`/${locale}/press-kit/releases/${release.slug}`}
                    className="group border-border-subtle/50 bg-bg-primary hover:bg-bg-primary flex flex-col justify-between gap-4 rounded-xl border p-6 transition-all hover:border-emerald-500/30"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-400">
                          {release.date}
                        </span>
                        <div className="flex gap-2">
                          {release.tags[isEn ? "en" : "tr"].slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-fg-muted text-[10px] tracking-wider uppercase"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-lg leading-tight font-bold text-white transition-colors group-hover:text-emerald-400">
                        {release.title[isEn ? "en" : "tr"]}
                      </h3>
                      <p className="text-fg-muted line-clamp-2 text-sm leading-relaxed">
                        {release.spot[isEn ? "en" : "tr"]}
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-bold text-emerald-500">
                      {t("readMore")}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border-subtle/50 bg-bg-navy">
              <CardContent className="space-y-4 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-white">{t("downloadTitle")}</h3>
                <p className="text-fg-muted text-xs">{t("downloadDesc")}</p>
                <a
                  href="/brand-assets.zip"
                  download="alparai-brand-assets.zip"
                  className="block w-full rounded-md bg-emerald-400 px-4 py-2.5 text-xs font-bold text-[#0A1622] shadow-lg shadow-emerald-400/10 transition-colors hover:bg-emerald-300"
                >
                  {t("downloadCta")}
                </a>
              </CardContent>
            </Card>

            <Card className="border-border-subtle/50 bg-bg-navy">
              <CardContent className="space-y-3 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Mail className="h-4 w-4 text-emerald-400" /> {t("mediaContactTitle")}
                </p>
                <p className="text-fg-muted text-xs">{t("mediaContactDesc")}</p>
                <a
                  href="mailto:press@alparai.com"
                  className="border-border-subtle/50 block border-t pt-2 text-sm font-bold text-emerald-400 hover:text-emerald-300"
                >
                  press@alparai.com
                </a>
              </CardContent>
            </Card>

            {/* Developer API */}
            <Card className="bg-bg-navy border-blue-500/20">
              <CardContent className="space-y-3 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Code2 className="h-4 w-4 text-blue-400" />
                  {isEn ? "Developer API" : "Geliştirici API"}
                </p>
                <p className="text-fg-muted text-xs">
                  {isEn
                    ? "Public REST API for researchers and journalists. Rate-limited, CORS-enabled."
                    : "Araştırmacılar ve gazeteciler için açık REST API. Rate-limit ve CORS desteğiyle."}
                </p>
                <Link
                  href="/api-docs"
                  className="border-border-subtle/50 block border-t pt-2 text-sm font-bold text-blue-400 hover:text-blue-300"
                >
                  {isEn ? "View API Docs →" : "API Dokümantasyonu →"}
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
