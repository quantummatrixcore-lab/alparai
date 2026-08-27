import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { Cpu, Server } from "lucide-react";
import { createServerClient } from "@/lib/supabase/server";
import { discoverAllModels } from "@/lib/ai/discovery/fetch-models";

interface ProviderRow {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  is_verified: boolean;
}

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
  const { data: rawProviders } = await supabase
    .from("ai_providers")
    .select("id, name, slug, website_url, is_verified")
    .order("name");

  const providers = (rawProviders || []) as ProviderRow[];
  const models = await discoverAllModels();

  return (
    <div className="animate-in fade-in bg-bg-secondary/40 ring-border-subtle space-y-8 rounded-3xl px-3 py-4 shadow-2xl ring-1 backdrop-blur-xl duration-500 sm:px-6 md:p-8">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-white drop-shadow-md">
          <Cpu className="text-brand-400 h-8 w-8" />
          {t("api_mgmt_h1")}
        </h1>
        <p className="text-fg-muted mt-2 text-sm">{t("api_mgmt_subtitle")}</p>
      </div>

      <div className="border-border-subtle bg-bg-secondary rounded-xl border p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">{t("ai_providers_database")}</h2>
        <div className="overflow-x-auto">
          <table className="text-fg-primary w-full text-left text-sm">
            <thead className="bg-bg-secondary text-fg-muted text-xs uppercase">
              <tr>
                <th className="p-3">{String(t("name"))}</th>
                <th className="p-3">{String(t("slug"))}</th>
                <th className="p-3">{String(t("website"))}</th>
                <th className="p-3">{String(t("status"))}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-bg-secondary">
                  <td className="p-3 font-semibold text-white">{provider.name}</td>
                  <td className="text-fg-muted p-3 font-mono">{provider.slug}</td>
                  <td className="p-3 text-cyan-400">
                    {provider.website_url ? (
                      <a
                        href={provider.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
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
                        {String(t("verified"))}
                      </span>
                    ) : (
                      <span className="border-border-strong bg-bg-secondary text-fg-muted inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium">
                        {t("pending")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!providers || providers.length === 0) && (
            <div className="text-fg-muted p-6 text-center">{t("no_ai_providers_found")}</div>
          )}
        </div>
      </div>

      <div className="border-border-subtle bg-bg-secondary rounded-xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Server className="text-brand-400 h-5 w-5" />
            Model Directory
          </h2>
          <span className="text-fg-muted text-xs">Total: {models.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="text-fg-primary w-full text-left text-sm">
            <thead className="bg-bg-secondary text-fg-muted text-xs uppercase">
              <tr>
                <th className="p-3">Model Name</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Context Length</th>
                <th className="p-3">Pricing (Prompt/Completion)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-bg-secondary">
                  <td className="p-3 font-medium text-white">{model.name}</td>
                  <td className="text-fg-muted p-3">{model.provider}</td>
                  <td className="text-fg-muted p-3 font-mono">
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
            <div className="text-fg-muted p-6 text-center">No models discovered</div>
          )}
        </div>
      </div>
    </div>
  );
}
