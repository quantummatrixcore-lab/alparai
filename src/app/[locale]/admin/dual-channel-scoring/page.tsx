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
import { DualChannelChart } from "@/components/admin/dual-channel-chart";

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
    <div className="space-y-8 p-6 text-white">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
          <Scale className="h-8 w-8 text-amber-400" />
          {t("dual_channel_model_trust_scoring_archite")}
        </h1>
        <p className="mt-2 text-slate-400">{t("isolated_dual_channel_data_pipeline_with")}</p>
      </div>

      {/* Visual Data Binding for Score Weights */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
          <PieChartIcon className="h-5 w-5 text-emerald-400" />
          {t("scoring_weight_distribution") || "Scoring Weight Distribution"}
        </h2>
        <DualChannelChart wAudit={config.wAudit} wIncident={config.wIncident} />
      </div>

      {/* Architecture Status Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{t("channel_a_cross_audit")}</span>
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-cyan-400">{t("internal_audit_pipeline")}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t("weight")}
            {(config.wAudit * 100).toFixed(0)}
            {t("active")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{t("channel_b_public_incidents")}</span>
            <Database className="h-5 w-5 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-400">{t("user_complaint_pipeline")}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t("weight")}
            {(config.wIncident * 100).toFixed(0)}
            {t("isolated")}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{t("weighted_formula_engine")}</span>
            <Sliders className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {config.isCombinedActive ? "COMBINED MODE" : "ISOLATED DATA COLLECTION"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {config.isCombinedActive
              ? "Dual-channel weight active"
              : "Awaiting data accumulation threshold"}
          </p>
        </div>
      </div>

      {/* Cryptographic Ledger & Security Rules */}
      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Lock className="h-5 w-5 text-amber-400" />
          {t("zero_contamination_hash_signatures")}
        </h2>
        <p className="text-sm text-slate-300">
          {t("channels_a_and_b_are_strictly_isolated_t")}
          <code className="text-amber-400">{t("ai_trust_ledger")}</code>.
        </p>
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-400">
          {t("sha_256_ledger_format_sha256_model_id_au")}
        </div>
      </div>
    </div>
  );
}
