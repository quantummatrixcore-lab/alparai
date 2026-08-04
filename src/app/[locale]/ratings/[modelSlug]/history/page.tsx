import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { createServerClient } from "@/lib/supabase/server";
import { ScoreHistoryChart } from "./chart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; modelSlug: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ratings" });
  return { title: t("historyTitle"), description: t("historyDesc") };
}

export default async function ModelHistoryPage({
  params,
}: {
  params: Promise<{ locale: string; modelSlug: string }>;
}) {
  const { locale, modelSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ratings" });

  const supabase = await createServerClient();
  const { data: model } = await supabase
    .from("ai_models")
    .select("id, name")
    .eq("id", modelSlug)
    .single();

  if (!model) notFound();

  const { data: scores } = await supabase
    .from("k_model_scores")
    .select("category_id, score, wilson_lower, wilson_upper, sample_size, last_audited_at")
    .eq("model_id", model.id);

  return (
    <Container className="py-12">
      <h1 className="text-fg-primary mb-2 text-3xl font-bold">
        {t("historyFor", { name: model.name })}
      </h1>
      <p className="text-fg-muted mb-8">{t("historyDesc")}</p>

      <div className="grid gap-6 md:grid-cols-2">
        {(scores ?? []).map((s) => (
          <div key={s.category_id} className="border-border-subtle rounded-lg border p-4">
            <h3 className="text-fg-primary mb-3 font-semibold">{t(`cat_${s.category_id}`)}</h3>
            <ScoreHistoryChart
              score={s.score ?? 0}
              lower={s.wilson_lower ?? 0}
              upper={s.wilson_upper ?? 0}
            />
            <div className="text-fg-muted mt-2 flex justify-between text-xs">
              <span>
                {t("score")}: {Math.round((s.score ?? 0) * 100)}
              </span>
              <span>
                {t("samples")}: {s.sample_size ?? 0}
              </span>
              <span>
                {t("range")}: {Math.round((s.wilson_lower ?? 0) * 100)}–
                {Math.round((s.wilson_upper ?? 0) * 100)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {(!scores || scores.length === 0) && (
        <p className="text-fg-muted py-12 text-center">{t("noData")}</p>
      )}
    </Container>
  );
}
