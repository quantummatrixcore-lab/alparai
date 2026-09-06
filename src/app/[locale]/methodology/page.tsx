import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import {
  Scale,
  Calculator,
  History,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  FileCode2,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "methodology" });
  return {
    title: `${t("title")} — ALPAR AI`,
    description: t("subtitle"),
  };
}

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "methodology" });

  return (
    <div className="bg-bg-primary text-fg-primary min-h-screen pt-4 pb-16 md:pt-8 md:pb-20">
      <Container className="space-y-16">
        {/* Hero Section */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="border-brand-500/30 bg-brand-500/10 text-brand-400 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
            <ShieldCheck className="h-4 w-4" />
            <span>K-BENCHMARK & AI-ISS STANDARDI</span>
          </div>
          <h1 className="text-fg-primary text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="text-fg-secondary mt-4 text-base leading-relaxed sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* 4 Core Mathematical Pillars */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Dual Channel Scoring */}
          <Card className="border-border-subtle bg-bg-secondary/60 hover:border-brand-500/40 relative flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="bg-brand-500/10 pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl" />
            <CardHeader className="pb-4">
              <div className="border-brand-500/20 bg-brand-500/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border">
                <Scale className="text-brand-400 h-6 w-6" />
              </div>
              <CardTitle className="text-fg-primary text-xl font-bold">
                {t("scoring_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-fg-secondary space-y-4 text-sm leading-relaxed">
              <p>{t("scoring_desc")}</p>
              <div className="border-border-subtle/60 bg-bg-primary/70 text-brand-300 rounded-lg border p-3 font-mono text-xs">
                Score = 0.5 × Benchmark_Acc + 0.5 × Debate_Consensus
              </div>
            </CardContent>
          </Card>

          {/* Wilson Score Interval */}
          <Card className="border-border-subtle bg-bg-secondary/60 hover:border-success-500/40 relative flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="bg-success-500/10 pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl" />
            <CardHeader className="pb-4">
              <div className="border-success-500/20 bg-success-500/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border">
                <Calculator className="text-success-400 h-6 w-6" />
              </div>
              <CardTitle className="text-fg-primary text-xl font-bold">
                {t("wilson_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-fg-secondary space-y-4 text-sm leading-relaxed">
              <p>{t("wilson_desc")}</p>
              <div className="border-border-subtle/60 bg-bg-primary/70 text-success-300 rounded-lg border p-3 font-mono text-xs">
                W_Lower = (p̂ + z²/2n - z√(p̂(1-p̂)/n + z²/4n²)) / (1 + z²/n)
              </div>
            </CardContent>
          </Card>

          {/* Provider TrustScore */}
          <Card className="border-border-subtle bg-bg-secondary/60 hover:border-purple-500/40 relative flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="bg-purple-500/10 pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl" />
            <CardHeader className="pb-4">
              <div className="border-purple-500/20 bg-purple-500/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border">
                <ShieldCheck className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-fg-primary text-xl font-bold">
                {t("trustscore_title", { defaultValue: "Provider TrustScore™" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-fg-secondary space-y-4 text-sm leading-relaxed">
              <p>{t("trustscore_desc", { defaultValue: "Actuarial accountability index: Dynamic Bayesian prior (75-90 base), severity weighting (Critical: 15, High: 8, Med: 4), 120-day exponential half-life decay, and up to 60% MTTR remediation rebate." })}</p>
              <div className="border-border-subtle/60 bg-bg-primary/70 rounded-lg border p-3 font-mono text-xs text-purple-300">
                Score = Base(P) - Σ [Weight(Sev) × e^(-Δt/120) × Rebate(MTTR)] + Resp + Gov
              </div>
            </CardContent>
          </Card>

          {/* Version History & Corrections */}
          <Card className="border-border-subtle bg-bg-secondary/60 hover:border-accent-500/40 relative flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="bg-accent-500/10 pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl" />
            <CardHeader className="pb-4">
              <div className="border-accent-500/20 bg-accent-500/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border">
                <History className="text-accent-400 h-6 w-6" />
              </div>
              <CardTitle className="text-fg-primary text-xl font-bold">
                {t("corrections_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-fg-secondary space-y-4 text-sm leading-relaxed">
              <p>{t("corrections_desc")}</p>
              <div className="border-border-subtle/60 bg-bg-primary/70 text-accent-300 rounded-lg border p-3 font-mono text-xs">
                Git SHA-256 Verified · Immutable Audit Trail
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deep Dive Sub-Modules */}
        <div className="space-y-6">
          <div className="border-border-subtle/50 border-b pb-4">
            <h2 className="text-fg-primary text-2xl font-bold tracking-tight">
              Metodolojik Detaylar & Teknik Çerçeveler
            </h2>
            <p className="text-fg-muted mt-1 text-sm">
              ALPAR AI bağımsız denetim altyapısını oluşturan açık kaynaklı alt standartlar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/methodology/ai-iss"
              className="border-border-subtle bg-bg-secondary/40 hover:border-brand-500/40 group flex flex-col justify-between rounded-2xl border p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="border-brand-500/20 bg-brand-500/10 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border">
                  <Zap className="text-brand-400 h-5 w-5" />
                </div>
                <h3 className="text-fg-primary group-hover:text-brand-400 text-lg font-bold transition-colors">
                  {t("aiIssTitle")}
                </h3>
                <p className="text-fg-muted mt-2 text-xs leading-relaxed">{t("aiIssDesc")}</p>
              </div>
              <div className="text-brand-400 mt-6 inline-flex items-center gap-1 text-xs font-semibold">
                <span>İncele</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/methodology/k-benchmark"
              className="border-border-subtle bg-bg-secondary/40 hover:border-success-500/40 group flex flex-col justify-between rounded-2xl border p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="border-success-500/20 bg-success-500/10 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border">
                  <Layers className="text-success-400 h-5 w-5" />
                </div>
                <h3 className="text-fg-primary group-hover:text-success-400 text-lg font-bold transition-colors">
                  {t("kBenchmarkTitle")}
                </h3>
                <p className="text-fg-muted mt-2 text-xs leading-relaxed">{t("kBenchmarkDesc")}</p>
              </div>
              <div className="text-success-400 mt-6 inline-flex items-center gap-1 text-xs font-semibold">
                <span>İncele</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/methodology/benchmarks"
              className="border-border-subtle bg-bg-secondary/40 group flex flex-col justify-between rounded-2xl border p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40"
            >
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10">
                  <FileCode2 className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-fg-primary text-lg font-bold transition-colors group-hover:text-purple-400">
                  {t("benchmarksTitle")}
                </h3>
                <p className="text-fg-muted mt-2 text-xs leading-relaxed">{t("benchmarksDesc")}</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-purple-400">
                <span>İncele</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/methodology/corrections"
              className="border-border-subtle bg-bg-secondary/40 group flex flex-col justify-between rounded-2xl border p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40"
            >
              <div>
                <div className="border-warning-500/20 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-amber-500/10">
                  <History className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-fg-primary text-lg font-bold transition-colors group-hover:text-amber-400">
                  {t("corrections_title")}
                </h3>
                <p className="text-fg-muted mt-2 text-xs leading-relaxed">
                  {t("corrections_subtitle")}
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                <span>İncele</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
