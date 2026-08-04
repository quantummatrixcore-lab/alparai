import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return {
    title: `${t("safety_title")} | ALPAR AI`,
    description: t("safety_desc"),
  };
}

export default async function SafetyDashboard({
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
            {t("safety_title")}
          </h1>
          <p className="text-fg-secondary text-sm">{t("safety_desc")}</p>
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
