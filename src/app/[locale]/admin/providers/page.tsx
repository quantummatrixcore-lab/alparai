import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { Cpu, Server } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { discoverAllModels } from "@/lib/ai/discovery/fetch-models";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("api_mgmt_meta_title")} | ALPAR AI Admin` };
}

export default async function ProvidersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = await createServerClient();
  const { data: providers } = await supabase
    .from("ai_providers" as never)
    .select("*")
    .order("name");

  const models = await discoverAllModels();

  return (
    <div className="animate-in fade-in space-y-8 p-6 duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-white drop-shadow-md">
          <Cpu className="text-brand-400 h-8 w-8" />
          {t("api_mgmt_h1")}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{t("api_mgmt_subtitle")}</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">{t("ai_providers_database")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
              <tr>
                <th className="p-3">{t("name")}</th>
                <th className="p-3">{t("slug")}</th>
                <th className="p-3">{t("website")}</th>
                <th className="p-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {((providers as any[]) || []).map((provider: any) => (
                <tr key={provider.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">{provider.name}</td>
                  <td className="p-3 font-mono text-slate-400">{provider.slug}</td>
                  <td className="p-3 text-cyan-400">
                    {provider.website_url ? (
                      <a
                        href={provider.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {new URL(provider.website_url).hostname.replace("www.", "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    {provider.is_verified ? (
                      <span className="inline-flex items-center rounded border border-emerald-800 bg-emerald-950 px-2 py-0.5 text-xs font-medium text-emerald-400">
                        {t("verified")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400">
                        {t("pending")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!providers || providers.length === 0) && (
            <div className="p-6 text-center text-slate-500">{t("no_ai_providers_found")}</div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Server className="text-brand-400 h-5 w-5" />
            Model Directory
          </h2>
          <span className="text-xs text-slate-400">Total: {models.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
              <tr>
                <th className="p-3">Model Name</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Context Length</th>
                <th className="p-3">Pricing (Prompt/Completion)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-medium text-white">{model.name}</td>
                  <td className="p-3 text-slate-400">{model.provider}</td>
                  <td className="p-3 font-mono text-slate-400">
                    {(model.context_length / 1000).toFixed(0)}k
                  </td>
                  <td className="p-3 font-mono text-emerald-400">
                    ${model.pricing_prompt.toFixed(6)} / ${model.pricing_completion.toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!models || models.length === 0) && (
            <div className="p-6 text-center text-slate-500">No models discovered</div>
          )}
        </div>
      </div>
    </div>
  );
}
