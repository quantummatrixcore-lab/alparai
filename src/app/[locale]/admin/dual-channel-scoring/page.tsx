import dynamic from "next/dynamic";
import { requireAdmin } from "@/lib/auth/session";
import { getScoringConfigAction } from "@/actions/admin/dual-channel-scoring";
import {
  ShieldCheck,
  Scale,
  Lock,
  Sliders,
  Database,
  PieChart as PieChartIcon,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
const DualChannelChart = dynamic(() =>
  import("@/components/admin/dual-channel-chart").then((m) => m.DualChannelChart),
);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: t("dual_channel_scoring_title", { defaultValue: "Çift Kanal Skorlama · ALPAR AI" }),
  };
}

export default async function DualChannelScoringAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations("admin");
  const config = await getScoringConfigAction();
  return (
    <div className="bg-bg-secondary/40 ring-border-subtle space-y-8 rounded-3xl px-3 py-4 text-white shadow-2xl ring-1 backdrop-blur-xl sm:px-6 md:p-8">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
          <Scale className="h-8 w-8 text-amber-400" />
          {t("dual_channel_model_trust_scoring_archite")}
        </h1>
        <p className="text-fg-muted mt-2">{t("isolated_dual_channel_data_pipeline_with")}</p>
      </div>

      {/* Visual Data Binding for Score Weights */}
      <div className="border-border-subtle bg-bg-secondary rounded-xl border p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <PieChartIcon className="h-5 w-5 text-emerald-400" />
          {t("scoring_weight_distribution") || "Scoring Weight Distribution"}
        </h2>
        <DualChannelChart wAudit={config.wAudit} wIncident={config.wIncident} />
      </div>

      {/* Architecture Status Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border-border-subtle bg-bg-secondary rounded-xl border p-6">
          <div className="text-fg-muted flex items-center justify-between text-sm">
            <span>{t("channel_a_cross_audit")}</span>
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-fg-secondaryxl mt-2 font-bold text-cyan-400">
            {t("internal_audit_pipeline")}
          </p>
          <p className="text-fg-muted mt-1 text-xs">
            {t("weight")}
            {(config.wAudit * 100).toFixed(0)}
            {t("active")}
          </p>
        </div>

        <div className="border-border-subtle bg-bg-secondary rounded-xl border p-6">
          <div className="text-fg-muted flex items-center justify-between text-sm">
            <span>{t("channel_b_public_incidents")}</span>
            <Database className="h-5 w-5 text-rose-400" />
          </div>
          <p className="text-fg-secondaryxl mt-2 font-bold text-rose-400">
            {t("user_complaint_pipeline")}
          </p>
          <p className="text-fg-muted mt-1 text-xs">
            {t("weight")}
            {(config.wIncident * 100).toFixed(0)}
            {t("isolated")}
          </p>
        </div>

        <div className="border-border-subtle bg-bg-secondary rounded-xl border p-6">
          <div className="text-fg-muted flex items-center justify-between text-sm">
            <span>{t("weighted_formula_engine")}</span>
            <Sliders className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-fg-secondaryxl mt-2 font-bold text-emerald-400">
            {config.isCombinedActive ? "COMBINED MODE" : "ISOLATED DATA COLLECTION"}
          </p>
          <p className="text-fg-muted mt-1 text-xs">
            {config.isCombinedActive
              ? "Dual-channel weight active"
              : "Awaiting data accumulation threshold"}
          </p>
        </div>
      </div>

      {/* Cryptographic Ledger & Security Rules */}
      <div className="border-border-subtle bg-bg-secondary space-y-4 rounded-xl border p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Lock className="h-5 w-5 text-amber-400" />
          {t("zero_contamination_hash_signatures")}
        </h2>
        <p className="text-fg-primary text-sm">
          {t("channels_a_and_b_are_strictly_isolated_t")}
          <code className="text-amber-400">{t("ai_trust_ledger")}</code>.
        </p>
        <div className="border-border-subtle bg-bg-secondary text-fg-muted rounded-lg border p-4 font-mono text-xs">
          {t("sha_256_ledger_format_sha256_model_id_au")}
        </div>
      </div>
    </div>
  );
}
