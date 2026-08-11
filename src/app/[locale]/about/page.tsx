import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="min-h-screen bg-black px-6 pt-24 pb-12 text-white">
      <div className="mx-auto max-w-4xl space-y-24">
        {/* Vision */}
        <section className="space-y-6 text-center">
          <h1 className="bg-gradient-to-br from-white to-white/50 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-7xl">
            {t("title")}
          </h1>
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
            <h2 className="mb-4 text-3xl font-semibold">{t("vision_title")}</h2>
            <p className="text-lg leading-relaxed text-zinc-400">{t("vision_desc")}</p>
          </div>
        </section>

        {/* Advisory Board */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-semibold">{t("advisory_board_title")}</h2>
            <p className="mx-auto max-w-2xl text-zinc-400">{t("advisory_board_desc")}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
              <div className="h-16 w-16 animate-pulse rounded-full border border-white/20 bg-white/10" />
              <div>
                <h3 className="text-xl font-medium">{t("member_1_name")}</h3>
                <p className="text-zinc-400">{t("member_1_role")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
              <div className="h-16 w-16 animate-pulse rounded-full border border-white/20 bg-white/10" />
              <div>
                <h3 className="text-xl font-medium">{t("member_2_name")}</h3>
                <p className="text-zinc-400">{t("member_2_role")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* MOUs */}
        <section className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 text-center backdrop-blur-lg">
          <h2 className="text-3xl font-semibold">{t("mou_title")}</h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-300">{t("mou_desc")}</p>
        </section>
      </div>
    </div>
  );
}
