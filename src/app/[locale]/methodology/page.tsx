import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-8 text-4xl font-bold">{t("title")}</h1>
      <section className="prose prose-invert max-w-none">
        <h2>{t("scoring_title")}</h2>
        <p>{t("scoring_desc")}</p>
        <h2>{t("wilson_title")}</h2>
        <p>{t("wilson_desc")}</p>
        <h2>{t("corrections_title")}</h2>
        <p>{t("corrections_desc")}</p>
      </section>
      <section className="not-prose mt-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/methodology/ai-iss"
          className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/40 block rounded-xl border p-6 transition-colors"
        >
          <h3 className="text-fg-primary mb-2 text-lg font-semibold">{t("aiIssTitle")}</h3>
          <p className="text-fg-muted text-sm leading-relaxed">{t("aiIssDesc")}</p>
        </Link>
        <Link
          href="/methodology/corrections"
          className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/40 block rounded-xl border p-6 transition-colors"
        >
          <h3 className="text-fg-primary mb-2 text-lg font-semibold">{t("corrections_title")}</h3>
          <p className="text-fg-muted text-sm leading-relaxed">{t("corrections_subtitle")}</p>
        </Link>
      </section>
    </main>
  );
}

export const metadata = {
  title: "ALPAR AI",
  description: "The trust infrastructure for AI accountability.",
};
