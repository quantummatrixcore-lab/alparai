import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "academy" });
  return {
    title: `${t("title")} | ALPAR AI`,
    description: t("subtitle"),
  };
}

export default async function AcademyInstructorPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "academy" });

  // 20-30 mock curriculum item indicators to construct a detailed curriculum outline
  const mockCurriculumUnits = Array.from({ length: 5 }, (_, i) => ({
    id: `unit-${i + 1}`,
    title: `Unit ${i + 1}: ${
      [
        "Foundational Model Vulnerabilities & Hallucinations",
        "Prompt Injection & Jailbreaking Taxonomies",
        "Data Exfiltration & Privacy Leak Auditing",
        "Copyright Infringement & Intellectual Property Risk",
        "Algorithmic Bias, Discrimination & EU AI Act Audits",
      ][i]
    }`,
    lessons: Array.from({ length: 4 }, (_, j) => ({
      id: `lesson-${i + 1}-${j + 1}`,
      title: `Lesson ${i + 1}.${j + 1}: ${
        [
          [
            "Analyzing Hallucination Confidences via Wilson Score",
            "Measuring Output Drift Over Time",
            "Mitigation Strategies for RAG-based Systems",
            "Real-world Case Studies: Medical Diagnosis Drift",
          ],
          [
            "Indirect Prompt Injection Vectors",
            "System Prompt Leak Prevention",
            "Defensive Guardrails: Constitutional AI",
            "Jailbreak Audits on Multi-modal Models",
          ],
          [
            "PII Leak Audits & Masking Protocols",
            "Membership Inference Attack Identification",
            "Implementing Guardian-level Filters",
            "Audit Trail Construction & GDPR Compliance",
          ],
          [
            "Training Data Attribution Scans",
            "Fair-Use Defense Metrics",
            "Synthetic Output Plagiarism Auditing",
            "Watermarking & Model Provenance",
          ],
          [
            "EU AI Act Article 52 Obligation Tracking",
            "Audit Checklists for High-risk Systems",
            "Algorithmic Bias Quantification",
            "Peer-review Consensus Arbitration",
          ],
        ][i]?.[j] || "Advanced AI Auditing Concept"
      }`,
    })),
  }));

  return (
    <div className="bg-bg-primary relative min-h-screen overflow-hidden pt-32 pb-24">
      {/* Background glow */}
      <div className="bg-accent-soft/5 pointer-events-none absolute top-0 left-1/3 h-[600px] w-[600px] rounded-full blur-[140px]" />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="border-border-primary/40 mb-12 flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="from-fg-primary via-fg-secondary to-accent mb-3 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              {t("title")}
            </h1>
            <p className="text-fg-secondary max-w-2xl text-sm">{t("subtitle")}</p>
          </div>
          <button className="bg-accent-soft text-bg-primary hover:bg-accent-soft/90 shadow-accent-soft/10 flex items-center space-x-2 rounded-2xl px-6 py-3 font-semibold shadow-md transition-all duration-200">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>{t("export_pdf")}</span>
          </button>
        </div>

        {/* Layout: Curriculum Pack & Lock Panel */}
        <div className="grid items-start gap-8 lg:grid-cols-3">
          {/* Locked Curriculum Outline */}
          <div className="pointer-events-none space-y-6 opacity-45 select-none lg:col-span-2">
            <h2 className="text-fg-primary mb-2 text-xl font-bold">{t("curriculum_title")}</h2>
            <p className="text-fg-secondary mb-6 text-sm">{t("curriculum_desc")}</p>

            {mockCurriculumUnits.map((unit) => (
              <div
                key={unit.id}
                className="bg-bg-secondary/20 border-border-primary/30 rounded-2xl border p-6"
              >
                <h3 className="text-md text-fg-primary mb-4 font-bold">{unit.title}</h3>
                <div className="space-y-3">
                  {unit.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="text-fg-secondary border-border-primary/10 flex items-center space-x-3 border-b py-1 text-sm last:border-0"
                    >
                      <svg
                        className="text-fg-secondary/50 h-4 w-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.232.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span>{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Locked Status Card */}
          <div className="bg-bg-secondary/40 border-border-primary/50 sticky top-36 rounded-3xl border p-8 backdrop-blur-md">
            <div className="bg-accent-soft/10 border-accent-soft/20 mb-6 flex h-14 w-14 items-center justify-center rounded-full border">
              <svg
                className="text-accent-soft h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-fg-primary mb-3 text-lg font-bold">{t("empty_state_title")}</h3>
            <p className="text-fg-secondary mb-6 text-sm leading-relaxed">
              {t("empty_state_desc")}
            </p>
            <div className="bg-border-primary/20 mb-2 h-1.5 w-full overflow-hidden rounded-full">
              <div className="bg-accent-soft h-full w-1/4" />
            </div>
            <span className="text-fg-secondary text-xs">Pending Launch Approval</span>
          </div>
        </div>
      </div>
    </div>
  );
}
