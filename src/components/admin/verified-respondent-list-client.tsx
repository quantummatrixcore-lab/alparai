"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerifiedRespondentToggle } from "./verified-respondent-toggle";
import { ShieldCheck, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProviderRow {
  id: string;
  name: string;
  slug: string;
  is_verified_respondent: boolean | null;
  respondent_contact_email: string | null;
  verified_respondent_at: string | null;
}

interface Props {
  providers: ProviderRow[];
}

export function VerifiedRespondentListClient({ providers = [] }: Props) {
  const t = useTranslations("admin");
  return (
    <Card className="border-white/10 bg-[#0F1E2E]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          {t("verified_respondent_badge_management")}
        </CardTitle>
        <p className="text-xs text-slate-400">{t("grant_official_verified_respondent_badge")}</p>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-white/5 rounded-lg border border-white/5 bg-[#08121C]">
          {providers.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {t("no_ai_providers_tracked_yet")}
            </div>
          ) : (
            providers.map((p) => {
              const isVerified = Boolean(p.is_verified_respondent);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{p.name}</span>
                        <span className="font-mono text-xs text-slate-500">({p.slug})</span>
                        {isVerified && (
                          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400">
                            {t("verified_respondent")}
                          </Badge>
                        )}
                      </div>
                      {p.respondent_contact_email && (
                        <div className="mt-0.5 text-xs text-slate-400">
                          {t("contact")}{" "}
                          <span className="font-mono text-slate-300">
                            {p.respondent_contact_email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <VerifiedRespondentToggle
                    providerId={p.id}
                    isVerified={isVerified}
                    contactEmail={p.respondent_contact_email}
                    providerName={p.name}
                  />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
