import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");
  const tCommittee = useTranslations("about_methodology_committee");
  const tBlog = useTranslations("blog");

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

        {/* Governance */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-semibold">{tBlog("tags.governance")}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/about/advisory-board"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
            >
              <div>
                <h3 className="text-xl font-medium">{t("advisory_board_title")}</h3>
                <p className="text-zinc-400">{t("advisory_board_desc")}</p>
              </div>
              <ArrowUpRight className="h-6 w-6 shrink-0 text-zinc-500 transition-colors group-hover:text-white" />
            </Link>
            <Link
              href="/about/methodology-committee"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
            >
              <div>
                <h3 className="text-xl font-medium">{tCommittee("title")}</h3>
                <p className="text-zinc-400">{tCommittee("description")}</p>
              </div>
              <ArrowUpRight className="h-6 w-6 shrink-0 text-zinc-500 transition-colors group-hover:text-white" />
            </Link>
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
