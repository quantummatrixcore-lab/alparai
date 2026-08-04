import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";
import { useLocale } from "next-intl";

export interface ProviderResponseCardProps {
  providerName: string;
  response: string;
  createdAt: string;
  verified: boolean;
}

export function ProviderResponseCard({
  providerName,
  response,
  createdAt,
  verified,
}: ProviderResponseCardProps) {
  const t = useTranslations("incident");
  const locale = useLocale();
  return (
    <Card variant="gradient" padding="md" className="border-brand-500/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="text-brand-400 h-4 w-4" aria-hidden="true" />
          <span className="text-fg-primary font-semibold">{providerName}</span>
          <Badge variant="brand" size="sm">
            {t("aiResponse")}
          </Badge>
        </div>
        {verified ? (
          <Badge variant="success" size="sm" dot>
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            {t("verified")}
          </Badge>
        ) : (
          <Badge variant="muted" size="sm">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {t("ai_response_pending")}
          </Badge>
        )}
      </div>
      <CardContent className="text-fg-primary text-sm whitespace-pre-wrap">{response}</CardContent>
      <p className="text-fg-muted mt-3 text-xs">{formatDate(new Date(createdAt), locale)}</p>
    </Card>
  );
}
