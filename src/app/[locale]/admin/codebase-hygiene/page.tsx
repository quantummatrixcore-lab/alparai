import { requireAdmin } from "@/lib/auth/session";
import { getCodebaseHygieneAction } from "@/actions/admin/codebase-hygiene";
import { Sparkles, FileCode, FileText, Share2, CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function CodebaseHygieneAdminPage() {
  const t = await getTranslations("admin");
  const report = await getCodebaseHygieneAction();

  await requireAdmin();
  return (
    <div className="space-y-8 p-6 text-white">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
          <Sparkles className="h-8 w-8 text-emerald-400" />
          {t("codebase_hygiene_context_pruning")}
        </h1>
        <p className="mt-2 text-slate-400">{t("zero_junk_engineering_protocol_real_time")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-xs tracking-wider uppercase">
              {t("context_status")}
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{report.contextStatus}</p>
          <p className="text-xs text-slate-400">{t("0_orphaned_files_detected")}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-xs tracking-wider uppercase">{t("source_files")}</span>
            <FileCode className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{report.totalSrcFiles}</p>
          <p className="text-xs text-slate-400">{t("active_typescript_react_components")}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-xs tracking-wider uppercase">{t("docs_files")}</span>
            <FileText className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{report.totalDocsFiles}</p>
          <p className="text-xs text-slate-400">{t("governance_proposal_specs")}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-mono text-xs tracking-wider uppercase">
              {t("graphify_nodes")}
            </span>
            <Share2 className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{report.graphifyNodeCount}</p>
          <p className="text-xs text-slate-400">{t("live_ast_knowledge_graph")}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-semibold text-white">{t("hygiene_context_protocols")}</h2>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="font-bold text-emerald-400">{t("a_dead_code_elimination")}</h3>
            <p className="text-xs text-slate-300">
              {t("unused_components_orphaned_routes_and_de")}
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="font-bold text-cyan-400">{t("b_context_economy")}</h3>
            <p className="text-xs text-slate-300">
              {t("ajan_boot_dok_manlar_docs_bootstrap_md_5")}
            </p>
          </div>
          <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="font-bold text-purple-400">{t("c_graphify_ast_sync")}</h3>
            <p className="text-xs text-slate-300">
              {t("pre_commit_hook_u_ile_6_100_d_ml_ast_mim")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
