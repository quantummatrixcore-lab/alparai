"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { VerifiedRespondentListClient } from "@/components/admin/verified-respondent-list-client";
import { AdminSubNav, type SubNavItem } from "@/components/admin/admin-design-kit";
import { ShieldCheck, Flag, Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IncidentListItem } from "@/types";

interface ProviderRow {
  id: string;
  name: string;
  slug: string;
  is_verified_respondent: boolean | null;
  respondent_contact_email: string | null;
  verified_respondent_at: string | null;
}

interface ModerationClientProps {
  items: IncidentListItem[];
  providers: ProviderRow[];
}

export function ModerationClient({ items, providers }: ModerationClientProps) {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<string>("all");

  const subNavItems: SubNavItem[] = [
    { id: "all", label: "Overview", icon: Inbox, badge: items.length + providers.length },
    {
      id: "incidents",
      label: t("pending_review") || "Pending Incidents",
      icon: Flag,
      badge: items.length,
    },
    {
      id: "respondents",
      label: t("verified_respondent_badge_moderation") || "Verified Respondents",
      icon: ShieldCheck,
      badge: providers.length,
    },
  ];

  const showIncidents = activeTab === "all" || activeTab === "incidents";
  const showRespondents = activeTab === "all" || activeTab === "respondents";

  return (
    <div className="space-y-6">
      <AdminSubNav items={subNavItems} activeId={activeTab} onChange={setActiveTab} />

      {/* Section 1: Pending Incident Moderation Queue */}
      {showIncidents && (
        <div className="space-y-4">
          <h2 className="text-fg-primary flex items-center gap-2 px-1 text-lg font-bold">
            <Flag className="text-success-400 h-5 w-5" />
            <span>{t("pending_review")}</span>
            <span className="bg-bg-tertiary text-fg-muted rounded-full px-2.5 py-0.5 font-mono text-xs">
              {items.length}
            </span>
          </h2>
          <Card className="border-border-subtle bg-bg-secondary shadow-sm">
            <CardContent className="pt-6">
              <ModerationQueue incidents={items} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section 2: Verified Respondent Badge Moderation */}
      {showRespondents && (
        <div className="space-y-4">
          <h2 className="text-fg-primary flex items-center gap-2 px-1 text-lg font-bold">
            <ShieldCheck className="text-success-400 h-5 w-5" />
            <span>{t("verified_respondent_badge_moderation")}</span>
          </h2>
          <VerifiedRespondentListClient providers={providers} />
        </div>
      )}
    </div>
  );
}
