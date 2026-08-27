import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Container } from "@/components/ui/layout";
import { PRESS_RELEASES } from "@/lib/constants/press-releases";
import { ArrowLeft, Mail, Calendar, Share2, Twitter, Linkedin } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const release = PRESS_RELEASES.find((r) => r.slug === slug);

  if (!release) return {};

  const isEn = locale === "en";

  return {
    title: `${release.title[isEn ? "en" : "tr"]} — ALPAR AI Press`,
    description: release.spot[isEn ? "en" : "tr"],
  };
}

export default async function PressReleasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pressKit" });

  const release = PRESS_RELEASES.find((r) => r.slug === slug);
  if (!release) {
    notFound();
    return null;
  }

  const isEn = locale === "en";
  const title = release.title[isEn ? "en" : "tr"];
  const content = release.content[isEn ? "en" : "tr"];
  const tags = release.tags[isEn ? "en" : "tr"];

  const contentParagraphs = content.split("\\n\\n").filter(Boolean);

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="border-border-subtle/50 bg-bg-navy border-b py-8">
        <Container>
          <Link
            href={`/${locale}/press-kit`}
            className="text-fg-muted mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToPressKit")}
          </Link>

          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="border-success-500/20 flex items-center gap-1.5 rounded-full border bg-emerald-500/10 px-3 py-1 text-xs font-bold tracking-wider text-emerald-400">
                <Calendar className="h-3.5 w-3.5" />
                {release.date}
              </span>
              <div className="flex gap-2">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-fg-muted text-[10px] tracking-wider uppercase">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-white md:text-5xl">
              {title}
            </h1>

            <p className="text-fg-primary text-xl leading-relaxed font-medium">
              {release.spot[isEn ? "en" : "tr"]}
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-invert prose-emerald prose-p:leading-relaxed prose-headings:text-white prose-a:text-emerald-400 max-w-none">
            {contentParagraphs.map((p, i) => {
              if (p.toUpperCase() === p && p.length > 10 && !p.includes("*")) {
                return (
                  <h2 key={i} className="mt-10 mb-4 text-xl font-bold">
                    {p}
                  </h2>
                );
              }
              if (p.startsWith("*") && p.endsWith("*")) {
                return (
                  <p
                    key={i}
                    className="border-border-subtle/50 text-fg-muted mt-8 border-t pt-6 italic"
                  >
                    {p.replace(/\\*/g, "")}
                  </p>
                );
              }
              return (
                <p key={i} className="text-fg-primary text-lg">
                  {p}
                </p>
              );
            })}
          </div>

          <div className="border-border-subtle/50 mt-16 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm font-bold text-white">
                <Share2 className="text-fg-muted h-4 w-4" /> Share:
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(`https://alparai.com/${locale}/press-kit/releases/${slug}?ref=alparai_platform`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-fg-muted transition-colors hover:text-[#1DA1F2]"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://alparai.com/${locale}/press-kit/releases/${slug}?ref=alparai_platform`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-fg-muted transition-colors hover:text-[#0A66C2]"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>

            <a
              href="mailto:press@alparai.com"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              <Mail className="h-4 w-4" />
              {t("contactMediaTeam")}
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
