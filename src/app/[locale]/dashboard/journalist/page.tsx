import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return {
    title: `${t("journalist_title")} | ALPAR AI`,
    description: t("journalist_desc"),
  };
}

export default async function JournalistDashboard({
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
            {t("journalist_title")}
          </h1>
          <p className="text-fg-secondary text-sm">{t("journalist_desc")}</p>
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2m2 2a2 2 0 11-4 0m4 0a2 2 0 01-2 2m0 0V12m0 0h2"
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
