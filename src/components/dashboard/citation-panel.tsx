"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Quote } from "lucide-react";
import { toast } from "sonner";

export interface JournalistCitation {
  id: string;
  title: string;
  provider: string;
  incidentDate: string;
  statusLabel: string;
  url: string;
  retrievedDate: string;
  citationText: string;
}

export function CitationPanel({ citation }: { citation: JournalistCitation | null }) {
  const t = useTranslations("dashboard");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!citation) return;
    try {
      await navigator.clipboard.writeText(citation.citationText);
      setCopied(true);
      toast.success(t("journalist_citation_copied"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("journalist_citation_copy_failed"));
    }
  };

  return (
    <Card variant="glass" className="border-brand-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="text-brand-400 h-5 w-5" aria-hidden="true" />
          {t("journalist_citation_title")}
        </CardTitle>
        <p className="text-fg-muted text-sm">{t("journalist_citation_desc")}</p>
      </CardHeader>
      <CardContent>
        {citation ? (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("journalist_citation_field_provider")}
                </dt>
                <dd className="text-fg-primary font-medium">{citation.provider}</dd>
              </div>
              <div>
                <dt className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("journalist_citation_field_date")}
                </dt>
                <dd className="text-fg-primary font-medium">{citation.incidentDate}</dd>
              </div>
              <div>
                <dt className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("journalist_citation_field_status")}
                </dt>
                <dd className="text-fg-primary font-medium">{citation.statusLabel}</dd>
              </div>
              <div>
                <dt className="text-fg-muted text-[10px] font-bold tracking-wider uppercase">
                  {t("journalist_citation_field_id")}
                </dt>
                <dd className="text-fg-primary font-mono text-xs break-all">{citation.id}</dd>
              </div>
            </dl>
            <div>
              <label
                htmlFor="citation-text"
                className="text-fg-muted mb-1.5 block text-[10px] font-bold tracking-wider uppercase"
              >
                {t("journalist_citation_field_url")}
              </label>
              <textarea
                id="citation-text"
                readOnly
                value={citation.citationText}
                rows={7}
                onFocus={(e) => e.currentTarget.select()}
                className="border-border-subtle bg-bg-primary text-fg-secondary w-full resize-none rounded-lg border p-3 font-mono text-xs leading-relaxed focus:outline-none"
              />
            </div>
            <Button
              onClick={handleCopy}
              leftIcon={
                copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" aria-label="Approve" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )
              }
              variant={copied ? "success" : "primary"}
              size="sm"
            >
              {copied ? t("journalist_citation_copied") : t("journalist_citation_copy")}
            </Button>
          </div>
        ) : (
          <p className="text-fg-muted text-sm">{t("journalist_citation_empty")}</p>
        )}
      </CardContent>
    </Card>
  );
}
