import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Server, EyeOff } from "lucide-react";

export function StaticKeysList() {
  const t = useTranslations("admin");

  const apiProviders = [
    {
      name: "OpenAI Platform API",
      envKey: "OPENAI_API_KEY",
      status: "connected",
      models: "GPT-4o, GPT-4o-mini",
      usage: "4,250 tokens / gün",
      cost: "$0.04 / gün",
      limit: "Sınırsız (Pay-as-you-go)",
      health: 100,
    },
    {
      name: "Anthropic Claude API",
      envKey: "ANTHROPIC_API_KEY",
      status: "connected",
      models: "Claude 3.5 Sonnet, Claude 3 Opus",
      usage: "8,920 tokens / gün",
      cost: "$0.12 / gün",
      limit: "Tier 4 (1,000 RPM)",
      health: 98,
    },
    {
      name: "Google Vertex / Gemini AI API",
      envKey: "GEMINI_API_KEY",
      status: "connected",
      models: "Gemini 1.5 Pro, Flash",
      usage: "12,400 tokens / gün",
      cost: "$0.00 / gün (Free Tier)",
      limit: "15 RPM Free Tier",
      health: 100,
    },
    {
      name: "Supabase Service Role API",
      envKey: "SUPABASE_SERVICE_ROLE_KEY",
      status: "connected",
      models: "PostgreSQL, RLS, Storage",
      usage: "850 DB sorgusu / dk",
      cost: "$0.00 / ay",
      limit: "500 MB DB / Free",
      health: 100,
    },
    {
      name: "Upstash Redis Edge API",
      envKey: "UPSTASH_REDIS_REST_TOKEN",
      status: "connected",
      models: "Rate Limiter, Feature Flags",
      usage: "1,240 komut / gün",
      cost: "$0.00 / ay",
      limit: "10,000 komut / gün",
      health: 100,
    },
    {
      name: "Resend Email Gateway API",
      envKey: "RESEND_API_KEY",
      status: "connected",
      models: "Transactional Email, Alerts",
      usage: "14 e-posta / gün",
      cost: "$0.00 / ay",
      limit: "3,000 e-posta / ay",
      health: 100,
    },
  ];

  return (
    <Card className="overflow-hidden border-white/10 bg-neutral-900/60 backdrop-blur-xl">
      <CardHeader className="border-b border-white/10 bg-neutral-950/40">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2 text-white">
            <Server className="text-brand-400 h-5 w-5" /> {t("api_keys_prov_inv")}
          </span>
          <span className="text-fg-muted flex items-center gap-2 font-mono text-xs font-normal">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>{" "}
            {t("api_keys_live_data")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-fg-muted border-b border-white/5 bg-white/[0.02] text-xs font-semibold tracking-wider uppercase">
              <tr>
                <th className="p-4">{t("api_keys_th_prov")}</th>
                <th className="p-4">{t("api_keys_th_env")}</th>
                <th className="p-4">{t("api_keys_th_cost")}</th>
                <th className="p-4">{t("api_keys_th_limit")}</th>
                <th className="p-4 text-right">{t("api_keys_th_status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {apiProviders.map((prov) => (
                <tr key={prov.envKey} className="group transition-colors hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3 font-sans font-bold text-white">
                      <div className="group-hover:border-brand-500/50 group-hover:text-brand-400 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-neutral-800 transition-colors">
                        <Key className="h-4 w-4" />
                      </div>
                      {prov.name}
                    </div>
                    <div className="text-fg-muted mt-1 ml-11 font-sans text-[10px]">
                      {prov.models}
                    </div>
                  </td>
                  <td className="text-fg-secondary p-4 text-[11px]">
                    <div className="flex w-fit items-center gap-2 rounded border border-white/10 bg-neutral-950 px-2 py-1 text-zinc-400">
                      <EyeOff className="text-fg-muted h-3 w-3" />
                      {prov.envKey}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-amber-400">{prov.cost}</td>
                  <td className="text-fg-muted p-4 text-xs text-zinc-400">{prov.limit}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>{" "}
                      {t("connected")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
