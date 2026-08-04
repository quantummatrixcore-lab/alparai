import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "transparency" });
  return {
    title: `${t("title")} | ALPAR AI`,
    description: t("subtitle"),
  };
}

export default async function Art73TrackerPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "transparency" });

  return (
    <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-32 pb-24">
      {/* Decorative background glow */}
      <div className="bg-accent-soft/10 pointer-events-none absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
      <div className="bg-accent-glow/5 pointer-events-none absolute bottom-10 left-1/4 h-[400px] w-[400px] rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="border-border-primary/40 mb-12 border-b pb-8">
          <h1 className="from-fg-primary via-fg-secondary to-accent mb-3 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
            {t("title")}
          </h1>
          <p className="text-fg-secondary max-w-3xl text-sm leading-relaxed">{t("subtitle")}</p>
        </div>

        {/* Audit Queue Scaffold (Table Skeleton) */}
        <div className="bg-bg-secondary/10 border-border-primary/30 pointer-events-none mb-12 overflow-hidden rounded-3xl border opacity-40 select-none">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border-primary/30 bg-bg-secondary/20 border-b">
                <th className="text-fg-secondary p-5 text-xs font-bold tracking-wider uppercase">
                  {t("obligation_header")}
                </th>
                <th className="text-fg-secondary p-5 text-xs font-bold tracking-wider uppercase">
                  {t("status_header")}
                </th>
                <th className="text-fg-secondary p-5 text-xs font-bold tracking-wider uppercase">
                  {t("verified_header")}
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-border-primary/10 border-b last:border-0">
                  <td className="p-5">
                    <div className="bg-fg-primary/20 mb-2 h-3 w-48 rounded" />
                    <div className="bg-fg-secondary/20 h-2 w-32 rounded" />
                  </td>
                  <td className="p-5">
                    <div className="bg-fg-secondary/20 h-6 w-20 rounded-full" />
                  </td>
                  <td className="p-5">
                    <div className="bg-fg-secondary/20 h-2 w-24 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        <div className="bg-bg-secondary/20 border-border-primary/30 mx-auto max-w-xl rounded-3xl border p-10 text-center shadow-sm backdrop-blur-md md:p-12">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
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
