import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { Key, ShieldCheck } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: `${t("api_keys_h1")} | ALPAR AI Admin` };
}

export default async function ApiKeysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-white drop-shadow-md">
          <Key className="text-brand-400 h-8 w-8" />
          {t("api_keys_h1")}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{t("api_mgmt_subtitle")}</p>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-6">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="h-24 w-24 text-emerald-400" />
        </div>
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-emerald-900/50 p-3 ring-1 ring-emerald-500/30">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-bold text-emerald-400">{t("api_keys_sec_title")}</h2>
            <p className="max-w-2xl leading-relaxed text-emerald-100/70">
              {t("api_keys_sec_desc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
