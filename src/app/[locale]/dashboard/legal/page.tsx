import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return {
    title: `${t("legal_title")} | ALPAR AI`,
    description: t("legal_desc"),
  };
}

export default async function LegalDashboard({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-32 pb-24">
      {/* Decorative gradients */}
      <div className="bg-accent-soft/10 pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="border-border-primary/40 mb-12 border-b pb-8">
          <h1 className="from-fg-primary to-fg-secondary mb-2 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
            {t("legal_title")}
          </h1>
          <p className="text-fg-secondary text-sm">{t("legal_desc")}</p>
        </div>

        {/* Skeleton Grid */}
        <div className="pointer-events-none mb-12 grid gap-6 opacity-50 select-none md:grid-cols-3">
          <div className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6">
            <div className="bg-fg-secondary/20 mb-4 h-2 w-12 rounded" />
            <div className="bg-fg-primary/20 h-6 w-24 rounded" />
          </div>
          <div className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6">
            <div className="bg-fg-secondary/20 mb-4 h-2 w-12 rounded" />
            <div className="bg-fg-primary/20 h-6 w-24 rounded" />
          </div>
          <div className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6">
            <div className="bg-fg-secondary/20 mb-4 h-2 w-12 rounded" />
            <div className="bg-fg-primary/20 h-6 w-24 rounded" />
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-bg-secondary/30 border-border-primary/40 mx-auto max-w-xl rounded-3xl border p-10 text-center shadow-sm backdrop-blur-md md:p-12">
          <div className="bg-accent-soft/10 border-accent-soft/20 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border">
            <svg
              className="text-accent-soft h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.571V9a7.5 7.5 0 00-6-2.29m15 0a7.5 7.5 0 00-6 2.29v2.571c0 1.956.366 3.827 1.029 5.54M7.5 13.5L9 15l3-3m-6 3h12m-6-12a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
          </div>
          <h3 className="text-fg-primary mb-3 text-xl font-bold">{t("empty_state_title")}</h3>
          <p className="text-fg-secondary text-sm leading-relaxed">{t("empty_state_desc")}</p>
        </div>
      </div>
    </div>
  );
}
