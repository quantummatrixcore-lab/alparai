import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, PlayCircle } from "lucide-react";
import { generateQuestionsFromIncidents, runBatchEvaluations } from "@/actions/admin-question-bank";

interface Question {
  id: string;
  incident_id: string;
  test_prompt: string;
  expected_behavior: string;
  status: string;
}

export const metadata = {
  title: "Question Bank | Admin",
};

export default async function AdminQuestionBankPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin_question_bank" });
  const supabase = await createClient();

  // Fetch Questions
  const { data: questions } = (await supabase
    .from("k_benchmark_question_bank" as unknown as "users") // Supabase any hack to bypass TS issues if types are not generated
    .select("id, incident_id, test_prompt, expected_behavior, status")
    .order("created_at", { ascending: false })
    .limit(50)) as unknown as { data: Question[] | null };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
          <p className="text-text-secondary mt-2 max-w-2xl">{t("subtitle")}</p>
        </div>
        <div className="flex gap-4">
          <form
            action={async () => {
              "use server";
              await generateQuestionsFromIncidents(10);
            }}
          >
            <Button type="submit" variant="outline" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t("generate_prompts")}
            </Button>
          </form>

          <form
            action={async () => {
              "use server";
              await runBatchEvaluations(5);
            }}
          >
            <Button type="submit" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              {t("run_evaluations")}
            </Button>
          </form>
        </div>
      </div>

      <Card className="border-border-subtle bg-bg-surface/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-surface border-border-subtle text-text-secondary border-b text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">{t("table_id")}</th>
                <th className="px-6 py-4 font-medium">{t("table_prompt")}</th>
                <th className="px-6 py-4 font-medium">{t("table_expected")}</th>
                <th className="px-6 py-4 font-medium">{t("table_status")}</th>
              </tr>
            </thead>
            <tbody>
              {questions && questions.length > 0 ? (
                questions.map((q) => (
                  <tr
                    key={q.id}
                    className="border-border-subtle/50 hover:bg-bg-surface/30 border-b"
                  >
                    <td className="text-text-secondary px-6 py-4 font-mono text-xs">
                      ...{q.id.slice(-6)}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4" title={q.test_prompt}>
                      {q.test_prompt}
                    </td>
                    <td
                      className="text-text-secondary max-w-xs truncate px-6 py-4"
                      title={q.expected_behavior}
                    >
                      {q.expected_behavior}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={q.status === "active" ? "default" : "outline"}>
                        {q.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-text-secondary px-6 py-8 text-center">
                    {t("no_questions")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
