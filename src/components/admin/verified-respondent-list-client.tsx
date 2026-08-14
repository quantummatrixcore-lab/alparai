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
    <Card className="border-border-subtle bg-bg-secondary shadow-sm">
      <CardHeader>
        <CardTitle className="text-fg-primary flex items-center gap-2 text-base font-bold">
          <ShieldCheck className="text-success-400 h-5 w-5" />
          {t("verified_respondent_badge_management")}
        </CardTitle>
        <p className="text-fg-muted text-xs">{t("grant_official_verified_respondent_badge")}</p>
      </CardHeader>

      <CardContent>
        <div className="divide-border-subtle border-border-subtle bg-bg-tertiary divide-y rounded-xl border">
          {providers.length === 0 ? (
            <div className="text-fg-muted p-6 text-center text-xs">
              {t("no_ai_providers_tracked_yet")}
            </div>
          ) : (
            providers.map((p) => {
              const isVerified = Boolean(p.is_verified_respondent);
              return (
                <div
                  key={p.id}
                  className="hover:bg-bg-tertiary/60 flex items-center justify-between p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="border-border-subtle bg-bg-secondary text-fg-muted flex h-9 w-9 items-center justify-center rounded-lg border">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-fg-primary text-sm font-semibold">{p.name}</span>
                        <span className="text-fg-muted font-mono text-xs">({p.slug})</span>
                        {isVerified && (
                          <Badge className="border-success-500/30 bg-success-500/10 text-success-400 text-[10px]">
                            {t("verified_respondent")}
                          </Badge>
                        )}
                      </div>
                      {p.respondent_contact_email && (
                        <div className="text-fg-muted mt-0.5 text-xs">
                          {t("contact")}{" "}
                          <span className="text-fg-primary font-mono">
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
