import { createServerClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

interface RelatedIncidentsProps {
  providerId: string;
  currentIncidentId: string;
  locale: string;
}

export async function RelatedIncidents({
  providerId,
  currentIncidentId,
  locale,
}: RelatedIncidentsProps) {
  const supabase = await createServerClient();
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const tFeed = await getTranslations({ locale, namespace: "feed" });

  const { data: relatedRows } = await supabase
    .from("incidents")
    .select(
      "id, title_masked, title_tr, severity, category, incident_date, created_at, cross_audit_truth_score",
    )
    .eq("status", "published")
    .eq("ai_provider_id", providerId)
    .neq("id", currentIncidentId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!relatedRows || relatedRows.length === 0) return null;

  return (
    <section className="mt-16 border-t border-white/5 pt-10">
      <h3 className="text-fg-primary text-xl font-black tracking-tight sm:text-2xl">
        {locale === "tr" ? "Benzer Olay Raporları" : "Related Incident Reports"}
      </h3>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedRows.map(
          (incident: {
            id: string;
            title_masked: string | null;
            title_tr: string | null;
            severity: "low" | "medium" | "high" | "critical";
            category:
              | "other"
              | "hallucination"
              | "bias"
              | "privacy"
              | "security"
              | "misinformation"
              | "harassment"
              | "manipulation"
              | "inaccessibility"
              | "copyright";
            incident_date: string | null;
            created_at: string;
            cross_audit_truth_score: number | null;
          }) => {
            const displayTitle =
              locale === "tr" && incident.title_tr && incident.title_tr.length > 0
                ? incident.title_tr
                : (incident.title_masked ?? "");

            return (
              <Card
                key={incident.id}
                variant="glass"
                className="border-border-subtle group h-full transition-all duration-300 hover:border-white/10"
              >
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase">
                      {tCat(incident.category)}
                    </span>
                    <SeverityBadge severity={incident.severity} />
                  </div>

                  <Link href={`/incidents/${incident.id}`} className="mt-4 flex-1">
                    <h4 className="text-fg-primary group-hover:text-brand-400 line-clamp-2 text-base font-extrabold tracking-tight transition-colors">
                      {displayTitle}
                    </h4>
                  </Link>

                  {incident.cross_audit_truth_score !== null && (
                    <div className="mt-4">
                      <div className="text-fg-secondary flex items-center justify-between text-[10px] font-bold uppercase">
                        <span>{tFeed("truthScore")}</span>
                        <span
                          className={
                            incident.cross_audit_truth_score >= 80
                              ? "text-success-400"
                              : incident.cross_audit_truth_score >= 50
                                ? "text-warning-400"
                                : "text-danger-400"
                          }
                        >
                          {incident.cross_audit_truth_score}/100
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className={
                            incident.cross_audit_truth_score >= 80
                              ? "bg-success-500"
                              : incident.cross_audit_truth_score >= 50
                                ? "bg-warning-500"
                                : "bg-danger-500"
                          }
                          style={{ width: `${incident.cross_audit_truth_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-fg-muted mt-4 flex items-center gap-1.5 border-t border-white/5 pt-3 text-[10px] font-semibold">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDate(
                        new Date(
                          incident.created_at || incident.incident_date || new Date().toISOString(),
                        ),
                        locale,
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>
    </section>
  );
}
