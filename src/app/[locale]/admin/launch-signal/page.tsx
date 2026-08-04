import { setRequestLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import {
  Activity,
  Rocket,
  Globe,
  Database,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: `${t("launch_signal_title")} | ALPAR AI Admin`,
  };
}

export default async function LaunchSignalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "admin" });

  const supabase = await createServerClient();

  const { count: totalIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true });

  const { count: userSubmitted } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("incident_source", "user_submitted");

  const { count: pendingIncidents } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_review");

  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
            <Rocket className="text-brand-400 h-6 w-6" />
            {t("launch_signal_title")}
          </h1>
          <p className="text-fg-muted mt-1">{t("launch_signal_subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-400">{t("launch_signal_live")}</span>
        </div>
      </div>

      <div className="border-brand-500/20 bg-brand-500/10 text-brand-300 rounded-lg border p-4 text-xs">
        <p className="mb-1 flex items-center gap-2 text-sm font-bold">
          {t("launch_freeze_signal_lansman_dondurma_si")}
        </p>
        <p className="text-[11px] leading-relaxed">
          {t("bu_panel_alpar_ai_platformunun_hacker_ne")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="bg-brand-500/10 text-brand-400 flex h-12 w-12 items-center justify-center rounded-lg">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-fg-muted text-sm font-medium">
                {t("launch_signal_total_incidents")}
              </p>
              <h3 className="text-2xl font-bold text-white">{totalIncidents || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-fg-muted text-sm font-medium">
                {t("launch_signal_user_submitted")}
              </p>
              <h3 className="text-2xl font-bold text-white">{userSubmitted || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-fg-muted text-sm font-medium">
                {t("launch_signal_pending_review")}
              </p>
              <h3 className="text-2xl font-bold text-white">{pendingIncidents || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-fg-muted text-sm font-medium">
                {t("launch_signal_registered_users")}
              </p>
              <h3 className="text-2xl font-bold text-white">{totalUsers || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Globe className="text-fg-muted h-5 w-5" />
            {t("launch_signal_platforms")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="font-medium text-white">{t("launch_signal_hn")}</p>
                <p className="text-fg-muted text-xs">{t("launch_signal_hn_rank")}</p>
              </div>
              <div className="text-right">
                <p className="text-brand-400 text-lg font-bold">{t("launch_signal_tba")}</p>
                <a href="#" className="text-brand-400/80 text-xs hover:underline">
                  {t("launch_signal_view_post")}
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="font-medium text-white">{t("launch_signal_ph")}</p>
                <p className="text-fg-muted text-xs">{t("launch_signal_ph_rank")}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-rose-400">{t("launch_signal_tba")}</p>
                <a href="#" className="text-xs text-rose-400/80 hover:underline">
                  {t("launch_signal_view_launch")}
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{t("launch_signal_twitter")}</p>
                <p className="text-fg-muted text-xs">{t("launch_signal_twitter_views")}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-400">{t("launch_signal_tba")}</p>
                <a href="#" className="text-xs text-blue-400/80 hover:underline">
                  {t("launch_signal_view_thread")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-secondary border-border-subtle rounded-xl border p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <AlertTriangle className="text-fg-muted h-5 w-5" />
            {t("launch_signal_system_status")}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-medium text-emerald-400">{t("launch_signal_web")}</span>
              </div>
              <span className="text-sm text-emerald-400/80">{t("launch_signal_operational")}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-medium text-emerald-400">{t("launch_signal_db")}</span>
              </div>
              <span className="text-sm text-emerald-400/80">{t("launch_signal_operational")}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-medium text-emerald-400">{t("launch_signal_edge")}</span>
              </div>
              <span className="text-sm text-emerald-400/80">{t("launch_signal_operational")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
