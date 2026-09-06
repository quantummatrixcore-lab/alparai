"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { IncidentList } from "@/components/incidents/incident-list";
import type { IncidentListItem } from "@/types";

export function LiveFeed({ incidents }: { incidents: IncidentListItem[] }) {
  const t = useTranslations("hero");
  const tIncident = useTranslations("incident");
  const hasIncidents = incidents.length > 0;

  return (
    <Card
      variant="gradient"
      className="hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="bg-danger-500 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-danger-500 relative inline-flex h-2.5 w-2.5 rounded-full" />
          </span>
          <Activity className="text-danger-400 h-4 w-4" />
          {t("live_feed")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasIncidents ? (
          <IncidentList incidents={incidents.slice(0, 5)} />
        ) : (
          <div className="py-8 text-center">
            <p className="text-fg-secondary mb-4 text-sm">{tIncident("no_incidents")}</p>
            <Link
              href="/submit"
              className="bg-danger-500 hover:bg-danger-600 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-all"
            >
              <Plus className="h-4 w-4" />
              {t("cta_primary")}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
