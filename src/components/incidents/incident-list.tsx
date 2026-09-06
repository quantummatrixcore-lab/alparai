import { IncidentCard } from "./incident-card";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { useTranslations } from "next-intl";
import { AlertCircle, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import type { IncidentListItem } from "@/types";

export function IncidentList({
  incidents,
  isLoading = false,
  error = null,
}: {
  incidents: IncidentListItem[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const t = useTranslations("incident");

  if (error) {
    return (
      <div
        className="border-danger-500/30 bg-danger-500/5 text-danger-400 rounded-md border p-4 text-sm"
        role="alert"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }
  if (!incidents.length) {
    return (
      <EmptyState
        title={t("no_incidents")}
        description={t("no_incidents_desc")}
        action={
          <Link
            href="/submit"
            className="bg-danger-500 hover:bg-danger-600 focus-visible:ring-danger-500 inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold text-white shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            {t("report_incident_cta")}
          </Link>
        }
      />
    );
  }
  return (
    <div className="space-y-3">
      {incidents.map((inc) => (
        <IncidentCard key={inc.id} incident={inc} />
      ))}
    </div>
  );
}
