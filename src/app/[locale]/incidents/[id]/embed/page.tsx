import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SeverityBadge } from "@/components/ui/badge";
import { Clock, ExternalLink } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { APP_URL } from "@/lib/constants";

interface EmbedPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: EmbedPageProps) {
  const { id, locale } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("incidents")
    .select("title_masked, title_tr")
    .eq("id", id)
    .maybeSingle();

  const incidentData = data as { title_masked: string | null; title_tr: string | null } | null;
  const title =
    locale === "tr" && incidentData?.title_tr ? incidentData.title_tr : incidentData?.title_masked;
  return {
    title: `Embed: ${title ?? "Incident Report"} | ALPAR AI`,
  };
}

export default async function IncidentEmbedPage({ params }: EmbedPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const tFeed = await getTranslations({ locale, namespace: "feed" });
  const supabase = await createServerClient();

  // Fetch incident row
  const { data: incident } = await supabase
    .from("incidents")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!incident) notFound();

  // Fetch provider & model details
  const [providerRes, modelRes] = await Promise.all([
    incident.ai_provider_id
      ? supabase
          .from("ai_providers")
          .select("name, slug")
          .eq("id", incident.ai_provider_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    incident.ai_model_id
      ? supabase
          .from("ai_models")
          .select("name, version")
          .eq("id", incident.ai_model_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const providerData = providerRes.data as { name: string; slug: string } | null;
  const modelData = modelRes.data as { name: string; version: string | null } | null;

  const truthScore = incident.cross_audit_truth_score ?? null;
  const displayTitle =
    locale === "tr" && incident.title_tr && incident.title_tr.length > 0
      ? incident.title_tr
      : incident.title_masked;

  const targetUrl = `${APP_URL}/${locale}/incidents/${id}`;

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
      <div className="border-border-subtle bg-bg-secondary/40 w-full max-w-md rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-brand-500 h-2 w-2 animate-pulse rounded-full" />
            <span className="text-fg-secondary text-[10px] font-black tracking-widest uppercase">
              {tCommon("monitor", { defaultValue: "ALPAR AI • MONITOR" })}
            </span>
          </div>
          <span className="text-fg-muted rounded border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase">
            {tCat(incident.category)}
          </span>
        </div>

        {/* Content */}
        <div className="mt-4">
          <h2 className="text-fg-primary hover:text-brand-400 line-clamp-2 text-base leading-snug font-extrabold tracking-tight transition-colors">
            <a href={targetUrl} target="_blank" rel="noopener noreferrer">
              {displayTitle}
            </a>
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="text-fg-secondary font-bold">
              {providerData?.name ?? tCommon("unknown")}
            </span>
            {modelData && (
              <>
                <span className="text-fg-muted font-bold">•</span>
                <span className="text-fg-muted font-medium">
                  {modelData.name} {modelData.version && `v${modelData.version}`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Truth Score (if available) */}
        {truthScore !== null && (
          <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-3">
            <div className="text-fg-secondary flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase">
              <span>{tFeed("truthScore")}</span>
              <span
                className={
                  truthScore >= 80
                    ? "text-success-400"
                    : truthScore >= 50
                      ? "text-warning-400"
                      : "text-danger-400"
                }
              >
                {truthScore}/100
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={
                  truthScore >= 80
                    ? "bg-success-500"
                    : truthScore >= 50
                      ? "bg-warning-500"
                      : "bg-danger-500"
                }
                style={{ width: `${truthScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
          <div className="text-fg-muted flex items-center gap-1.5 text-[10px] font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {formatDate(
                new Date(incident.created_at || incident.incident_date || new Date().toISOString()),
                locale,
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-tight text-white transition-colors duration-200"
            >
              <span>{tCommon("viewReport", { defaultValue: "View Report" })}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
