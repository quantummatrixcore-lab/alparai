import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { Download, Mail, FileText, Palette, Type } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PRESS_RELEASES } from "@/lib/constants/press-releases";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "press" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "press" });
  const isEn = locale === "en";

  const brandColors = [
    { name: t("color_brand_primary"), hex: "#6366f1", bgClass: "bg-[#6366f1]" },
    { name: t("color_emerald_success"), hex: "#10b981", bgClass: "bg-[#10b981]" },
    { name: t("color_amber_warning"), hex: "#f59e0b", bgClass: "bg-[#f59e0b]" },
    {
      name: t("color_dark_surface"),
      hex: "#090d16",
      bgClass: "bg-[#090d16] border border-border-subtle",
    },
  ];

  return (
    <Container size="narrow" className="space-y-12 py-16">
      {/* Header */}
      <div className="space-y-4 text-center">
        <span className="bg-brand-500/10 text-brand-400 inline-block rounded-full px-3 py-1 text-xs font-semibold">
          {t("badge")}
        </span>
        <h1 className="text-fg-primary text-4xl font-extrabold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-fg-muted mx-auto max-w-2xl text-base leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Assets & Downloads */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border-subtle bg-bg-surface space-y-4 p-6">
          <div className="text-fg-primary flex items-center gap-3 font-semibold">
            <Download className="text-brand-400 h-5 w-5" />
            <span>{t("logo_assets_title")}</span>
          </div>
          <p className="text-fg-muted text-xs leading-relaxed">{t("logo_assets_desc")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/brand/alpar-logo.svg"
              download="alpar-logo.svg"
              className="bg-brand-500/10 border-brand-500/30 text-brand-400 hover:bg-brand-500/20 flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"
            >
              <Download className="h-4 w-4" />
              <span>{t("download_logo_svg")}</span>
            </a>
            <a
              href="/brand/alpar-logo.png"
              download="alpar-logo.png"
              className="bg-bg-elevated border-border-subtle text-fg-primary hover:bg-bg-secondary flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"
            >
              <Download className="text-fg-muted h-4 w-4" />
              <span>{t("download_logo_png")}</span>
            </a>
            <a
              href="/brand-assets.zip"
              download="alpar-brand-assets.zip"
              className="bg-brand-500/20 border-brand-500/40 text-brand-300 hover:bg-brand-500/30 flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold"
            >
              <Download className="h-4 w-4" />
              <span>{isEn ? "Brand Kit (.ZIP)" : "Marka Paketi (.ZIP)"}</span>
            </a>
          </div>
        </Card>

        {/* Media Contact */}
        <Card className="border-border-subtle bg-bg-surface space-y-4 p-6">
          <div className="text-fg-primary flex items-center gap-3 font-semibold">
            <Mail className="text-brand-400 h-5 w-5" />
            <span>{t("contact_press")}</span>
          </div>
          <p className="text-fg-muted text-xs leading-relaxed">{t("contact_press_desc")}</p>
          <a
            href="mailto:press@alparai.com"
            className="text-brand-400 inline-flex items-center gap-2 text-sm font-bold hover:underline"
          >
            <Mail className="h-4 w-4" />
            <span>press@alparai.com</span>
          </a>
        </Card>
      </div>

      {/* Brand Guidelines */}
      <Card className="border-border-subtle bg-bg-surface space-y-6 p-6">
        <div className="text-fg-primary border-border-subtle flex items-center gap-3 border-b pb-4 text-lg font-semibold">
          <Palette className="text-brand-400 h-5 w-5" />
          <span>{t("brand_guidelines")}</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-fg-primary text-sm font-bold">{t("color_palette")}</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {brandColors.map((color, idx) => (
              <div
                key={idx}
                className="bg-bg-elevated flex flex-col gap-2 rounded-lg p-3 text-center"
              >
                <div className={`h-10 w-full rounded ${color.bgClass}`} />
                <span className="text-fg-primary text-xs font-semibold">{color.name}</span>
                <span className="text-fg-muted font-mono text-[11px]">{color.hex}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border-subtle space-y-2 border-t pt-4">
          <div className="text-fg-primary flex items-center gap-2 text-sm font-semibold">
            <Type className="text-brand-400 h-4 w-4" />
            <span>{t("typography")}</span>
          </div>
          <p className="text-fg-muted text-xs leading-relaxed">{t("typography_desc")}</p>
        </div>
      </Card>

      {/* Press Releases */}
      <div className="space-y-6">
        <div className="text-fg-primary flex items-center gap-3 text-xl font-semibold">
          <FileText className="text-brand-400 h-6 w-6" />
          <span>{t("press_releases")}</span>
        </div>

        <div className="space-y-4">
          {PRESS_RELEASES.slice(0, 4).map((release) => (
            <Card
              key={release.slug}
              className="border-border-subtle bg-bg-surface hover:border-brand-500/40 p-6 transition-all"
            >
              <div className="space-y-2">
                <div className="text-fg-muted flex items-center gap-3 text-xs">
                  <span className="bg-brand-500/10 text-brand-400 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold">
                    {release.date}
                  </span>
                  <span>{release.tags[isEn ? "en" : "tr"].join(" • ")}</span>
                </div>
                <h3 className="text-fg-primary text-lg font-bold">
                  {release.title[isEn ? "en" : "tr"]}
                </h3>
                <p className="text-fg-muted text-xs leading-relaxed">
                  {release.spot[isEn ? "en" : "tr"]}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/press-kit/releases/${release.slug}`}
                    className="text-brand-400 text-xs font-semibold hover:underline"
                  >
                    {t("read_full_release")}
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
