import { getTranslations } from "next-intl/server";
import FellowshipForm from "./FellowshipForm";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "academy" });
  return {
    title: `${t("fellowship_title")} | ALPAR AI`,
    description: t("fellowship_subtitle"),
  };
}

export default async function AcademyFellowshipPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "academy" });

  return (
    <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-32 pb-24">
      {/* Background gradients */}
      <div className="bg-accent-soft/10 pointer-events-none absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
      <div className="bg-accent-glow/5 pointer-events-none absolute bottom-10 left-1/4 h-[400px] w-[400px] rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="from-fg-primary via-fg-secondary to-accent mb-6 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl">
            {t("fellowship_title")}
          </h1>
          <p className="text-fg-secondary mx-auto max-w-2xl text-lg leading-relaxed">
            {t("fellowship_subtitle")}
          </p>
        </div>

        {/* Info Grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <div className="bg-bg-secondary/30 border-border-primary/40 rounded-2xl border p-6 backdrop-blur-sm">
            <div className="bg-accent-soft/10 border-accent-soft/20 text-accent-soft mb-4 flex h-10 w-10 items-center justify-center rounded-full border font-bold">
              1
            </div>
            <h4 className="text-fg-primary mb-2 font-bold">Research Grants</h4>
            <p className="text-fg-secondary text-sm leading-relaxed">
              Receive direct funding to support peer-reviewed empirical studies on AI safety.
            </p>
          </div>
          <div className="bg-bg-secondary/30 border-border-primary/40 rounded-2xl border p-6 backdrop-blur-sm">
            <div className="bg-accent-soft/10 border-accent-soft/20 text-accent-soft mb-4 flex h-10 w-10 items-center justify-center rounded-full border font-bold">
              2
            </div>
            <h4 className="text-fg-primary mb-2 font-bold">Compute Credits</h4>
            <p className="text-fg-secondary text-sm leading-relaxed">
              Access high-performance GPU clusters to benchmark models under extreme prompt
              payloads.
            </p>
          </div>
          <div className="bg-bg-secondary/30 border-border-primary/40 rounded-2xl border p-6 backdrop-blur-sm">
            <div className="bg-accent-soft/10 border-accent-soft/20 text-accent-soft mb-4 flex h-10 w-10 items-center justify-center rounded-full border font-bold">
              3
            </div>
            <h4 className="text-fg-primary mb-2 font-bold">Consensus Panels</h4>
            <p className="text-fg-secondary text-sm leading-relaxed">
              Join the academic peer-review pipeline to arbitrate multi-provider safety ratings.
            </p>
          </div>
        </div>

        {/* Application Form Component */}
        <div className="bg-bg-secondary/20 border-border-primary/30 mx-auto max-w-2xl rounded-3xl border p-8 shadow-lg backdrop-blur-md md:p-10">
          <h3 className="text-fg-primary border-border-primary/20 mb-8 border-b pb-4 text-center text-2xl font-bold">
            {t("fellowship_form_title")}
          </h3>
          <FellowshipForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
