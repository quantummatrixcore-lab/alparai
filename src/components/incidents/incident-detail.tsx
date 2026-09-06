"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  FileText,
  Clock,
  Eye,
  Globe,
  Tag,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { formatDate, formatRelativeTime, cn } from "@/lib/utils";
import { VoteButtons } from "./vote-buttons";
import { ProviderResponseCard } from "./provider-response-card";
import { ShareButtons } from "./share-buttons";
import { PIIBanner } from "./pii-banner";
import { Badge as UIBadge } from "@/components/ui/badge";
import type { IncidentDetail, ProviderResponse } from "@/types";
import { Link } from "@/i18n/routing";
import { TakedownButton } from "./takedown-button";
import { PassportButton } from "./passport-button";
import { PublicStatementModal } from "./public-statement-modal";
import Image from "next/image";
import { ViewTracker } from "./view-tracker";
import { AffectedButton } from "./affected-button";
import { CommentSection, type IncidentComment } from "./comment-section";
import { EvidenceTimeline, type TimelineEvent } from "./evidence-timeline";

export function IncidentDetailView({
  incident,
  evidence,
  providerResponse,
  userVote,
  isAuthenticated,
  comments,
  userAffected,
  currentUserId,
  isModerator,
  providerId,
}: {
  incident: IncidentDetail;
  evidence: Array<{ id: string; file_name: string; file_url: string; file_type: string }>;
  providerResponse: ProviderResponse | null;
  userVote: -1 | 0 | 1;
  isAuthenticated: boolean;
  comments: IncidentComment[];
  userAffected: boolean;
  currentUserId: string | null;
  isModerator?: boolean;
  providerId?: string;
}) {
  const t = useTranslations("incident");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [trTitle, setTrTitle] = React.useState<string | null>(incident.title_tr || null);
  const [trDesc, setTrDesc] = React.useState<string | null>(incident.description_tr || null);
  const [isTranslating, setIsTranslating] = React.useState(false);

  const displayTitle =
    locale === "tr" && trTitle && trTitle.length > 0
      ? trTitle
      : incident.title_masked;
  const displayDesc =
    locale === "tr" && trDesc && trDesc.length > 0
      ? trDesc
      : incident.description_masked;

  const timelineEvents: TimelineEvent[] = [
    {
      id: "event-created",
      type: "system",
      title: locale === "tr" ? "Kayıt Açıldı" : "Record Opened",
      description:
        locale === "tr"
          ? "Kullanıcı tarafından olay sisteme işlendi ve şifrelendi."
          : "Incident recorded and encrypted by user.",
      timestamp: incident.created_at,
      status: "success",
    },
  ];

  if (evidence.length > 0) {
    timelineEvents.push({
      id: "event-evidence",
      type: "user",
      title: locale === "tr" ? "Kanıt Yüklendi" : "Evidence Uploaded",
      description:
        locale === "tr"
          ? `${evidence.length} adet dijital kanıt sisteme eklendi.`
          : `${evidence.length} digital evidence files attached.`,
      timestamp: incident.created_at, // Assume same time for simplicity
      status: "success",
    });
  }

  if (incident.cross_audit_truth_score !== null) {
    timelineEvents.push({
      id: "event-verified",
      type: "verification",
      title: locale === "tr" ? "Çapraz Denetim (Cross-Audit)" : "Cross-Audit Complete",
      description:
        locale === "tr"
          ? `Yapay zeka modelleri tarafından doğruluk puanı ${incident.cross_audit_truth_score}/100 olarak belirlendi.`
          : `Truth score computed as ${incident.cross_audit_truth_score}/100 by independent AI models.`,
      timestamp: incident.created_at, // Mock timestamp
      status: "success",
    });
  }

  if (providerResponse) {
    if (providerResponse.response_type === "public_statement") {
      timelineEvents.push({
        id: "event-response",
        type: "ai",
        title: locale === "tr" ? "Muhatap Açıklaması" : "Public Statement",
        description: providerResponse.response.substring(0, 100) + "...",
        timestamp: providerResponse.created_at,
        status: "success",
      });
    } else {
      timelineEvents.push({
        id: "event-response",
        type: "ai",
        title: locale === "tr" ? "Muhatap Yanıtı" : "Defendant Response",
        description: providerResponse.response.substring(0, 100) + "...",
        timestamp: providerResponse.created_at,
        status: providerResponse.verified ? "success" : "warning",
      });
    }
  } else {
    timelineEvents.push({
      id: "event-pending",
      type: "ai",
      title: locale === "tr" ? "Muhatap Yanıtı Bekleniyor" : "Awaiting Defendant Response",
      description:
        locale === "tr"
          ? "İlgili yapay zeka şirketi platforma davet edildi, henüz resmi bir savunma yapılmadı."
          : "The AI company was notified and we are awaiting an official response.",
      timestamp: new Date().toISOString(),
      status: "pending",
    });
  }

  return (
    <article className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      <ViewTracker incidentId={incident.id} />
      <div className="space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <UIBadge
              variant={
                incident.severity === "critical" || incident.severity === "high"
                  ? "danger"
                  : incident.severity === "medium"
                    ? "warning"
                    : "success"
              }
              dot
            >
              {incident.severity}
            </UIBadge>
            <UIBadge variant="outline">{tCat(incident.category)}</UIBadge>
            {incident.cross_audit_truth_score !== null && (
              <UIBadge
                variant={
                  incident.cross_audit_truth_score >= 80
                    ? "success"
                    : incident.cross_audit_truth_score >= 50
                      ? "warning"
                      : "danger"
                }
                className="font-bold"
              >
                {t("truthScore")} {incident.cross_audit_truth_score}%
              </UIBadge>
            )}
            <UIBadge variant="muted">
              <Building2 className="h-3 w-3" /> {incident.provider_name}
            </UIBadge>
            {(() => {
              const source = incident.incident_source || "user_submitted";
              const isUserSubmitted = source === "user_submitted";
              return (
                <UIBadge
                  variant={isUserSubmitted ? "default" : "muted"}
                  className={cn(
                    "cursor-help transition-all duration-200",
                    isUserSubmitted
                      ? "border-emerald-accent/20 bg-emerald-accent/10 text-emerald-accent font-bold"
                      : "border-border-subtle bg-bg-tertiary text-fg-muted",
                  )}
                  title={t(`source_tooltip_${source}`)}
                >
                  {t(`source_${source}`)}
                </UIBadge>
              );
            })()}
            {incident.is_expert && (
              <UIBadge
                variant="success"
                className="border-success-500/20 bg-success-500/10 text-success-400 font-bold"
              >
                <CheckCircle2 className="text-success-400 mr-1 h-3 w-3" aria-hidden="true" />
                {t("expert_verified", { defaultValue: "Expert Verified" })}
              </UIBadge>
            )}
            {incident.model_name && <UIBadge variant="muted">{incident.model_name}</UIBadge>}
            {incident.is_anonymous && (
              <UIBadge variant="muted" size="sm">
                {t("anonymous")}
              </UIBadge>
            )}
            {incident.eu_act_risk_category && (
              <UIBadge variant="brand" className="border-brand-500/30 bg-brand-500/10 font-bold">
                EU AI Act: {incident.eu_act_risk_category}
              </UIBadge>
            )}
            {incident.eu_act_serious_incident_class && (
              <UIBadge variant="danger" className="font-bold">
                Art. 73: {incident.eu_act_serious_incident_class}
              </UIBadge>
            )}
            {locale === "tr" && incident.language === "en" && incident.title_tr && (
              <UIBadge
                variant="brand"
                className="border-brand-500/20 bg-brand-500/10 text-brand-400 font-bold"
                title="This content was automatically translated by AI. (Makine çevirisi)"
              >
                {tCommon("machine_translated", { defaultValue: "Makine çevirisi" })}
              </UIBadge>
            )}
          </div>
           <h1 className="text-fg-primary text-3xl leading-tight font-bold tracking-tight">
            {displayTitle}
          </h1>
          {locale === "tr" && !trTitle && (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  setIsTranslating(true);
                  const { getOrTranslateIncidentTR } = await import("@/actions/translations");
                  const result = await getOrTranslateIncidentTR(incident.id);
                  if (result) {
                    setTrTitle(result.title_tr);
                    setTrDesc(result.description_tr);
                    toast.success("Vaka başarıyla Türkçeye çevrildi! ✓");
                  } else {
                    toast.error("Çeviri başarısız oldu.");
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Bağlantı hatası.");
                } finally {
                  setIsTranslating(false);
                }
              }}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 text-brand-400 text-xs font-bold hover:bg-brand-500/10 active:scale-95 transition-all w-fit cursor-pointer disabled:opacity-50 mt-2 mb-1"
            >
              <Globe className={cn("h-3.5 w-3.5", isTranslating && "animate-spin")} />
              {isTranslating ? "Türkçeye Çevriliyor..." : "🌐 Yapay Zeka ile Türkçeye Çevir"}
            </button>
          )}
          <div className="text-fg-muted flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {t("by")} {incident.author_name ?? t("anonymous")} ·{" "}
              {formatRelativeTime(new Date(incident.created_at), locale)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {tCommon("viewCount", { defaultValue: "viewed" })} {incident.view_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {incident.language ?? "—"}
            </span>
          </div>
        </header>

        <PIIBanner />

        {["High-Risk", "Unacceptable-Risk"].includes(incident.eu_act_risk_category || "") && (
          <div className="border-warning-500/30 bg-warning-500/5 text-warning-400 flex items-start gap-2.5 rounded-lg border p-4 text-xs leading-relaxed">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>{t("risk_disclaimer", { risk: incident.eu_act_risk_category || "" })}</div>
          </div>
        )}

        <Card>
          <CardContent className="prose prose-invert text-fg-primary max-w-none whitespace-pre-wrap">
            {displayDesc}
          </CardContent>
        </Card>

        {incident.import_attribution && (
          <Card className="border-brand-500/10 bg-bg-secondary/40">
            <CardContent className="flex gap-4 p-5 text-sm">
              <Globe className="text-brand-400 mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-fg-primary font-bold">
                  {t("imported_incident_attribution_title")}
                </h4>
                <p className="text-fg-secondary text-xs">
                  {t("imported_incident_attribution_desc")}
                </p>
                <div className="bg-bg-tertiary/60 border-border-subtle text-brand-300 mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs">
                  <Shield className="h-3.5 w-3.5" />
                  {incident.import_attribution}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {incident.cross_audit_truth_score !== null && (
          <Card className="border-brand-500/20 bg-brand-500/5 border shadow-[0_0_30px_rgba(168,85,247,0.05)]">
            <CardHeader className="border-border-subtle border-b pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-brand-400 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("cross_audit_report_title", {
                    defaultValue: "Autonomous AI Cross-Audit Report",
                  })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-fg-muted text-xs">{t("confidence")}</span>
                  <UIBadge variant="brand" className="font-mono">
                    {Math.round((incident.cross_audit_confidence ?? 0) * 100)}%
                  </UIBadge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-bg-secondary/40 border-border-subtle/50 flex flex-col justify-between gap-4 rounded-xl border p-5 sm:flex-row sm:items-center">
                <div>
                  <h4 className="text-fg-primary text-base font-bold">
                    {t("truth_score", { defaultValue: "TruthScore" })}
                  </h4>
                  <p className="text-fg-muted mt-1 text-xs">{t("calculatedUsing")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={cn(
                        "font-mono text-3xl font-black",
                        incident.cross_audit_truth_score >= 80
                          ? "text-success-400"
                          : incident.cross_audit_truth_score >= 50
                            ? "text-warning-400"
                            : "text-danger-400",
                      )}
                    >
                      {incident.cross_audit_truth_score}/100
                    </span>
                  </div>
                </div>
              </div>
              {incident.cross_audit_reasoning && (
                <div className="space-y-2">
                  <h4 className="text-fg-primary text-sm font-bold">
                    {t("cross_audit_reasoning", { defaultValue: "Adjudication Reasoning" })}
                  </h4>
                  <p className="text-fg-secondary bg-bg-secondary/20 border-border-subtle/50 rounded-lg border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {incident.cross_audit_reasoning}
                  </p>
                </div>
              )}
              {incident.cross_audit_model && (
                <div className="text-fg-muted border-border-subtle/50 flex items-center justify-between border-t pt-2 text-[11px]">
                  <span>{t("auditorEngine")}</span>
                  <span className="font-mono font-bold">{incident.cross_audit_model}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {evidence.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t("evidence")} ({evidence.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {evidence.map((e) =>
                e.file_type.startsWith("image/") ? (
                  <a
                    key={e.id}
                    href={e.file_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="border-border-subtle relative block h-48 w-full overflow-hidden rounded-md border"
                    aria-label="Image"
                  >
                    <Image
                      src={e.file_url}
                      alt={e.file_name}
                      fill
                      unoptimized
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </a>
                ) : (
                  <a
                    key={e.id}
                    href={e.file_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="border-border-subtle bg-bg-tertiary hover:border-brand-500 flex items-center gap-2 rounded-md border p-3 text-sm"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{e.file_name}</span>
                  </a>
                ),
              )}
            </CardContent>
          </Card>
        )}

        <div className="my-10">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-black text-white">
            <Clock className="text-brand-400 h-5 w-5" />
            {locale === "tr" ? "Kanıt Zinciri" : "Chain of Evidence"}
          </h3>
          <EvidenceTimeline events={timelineEvents} />
        </div>

        {providerResponse ? (
          <div className="space-y-4">
            <ProviderResponseCard
              providerName={providerResponse.provider_name}
              response={providerResponse.response}
              createdAt={providerResponse.created_at}
              verified={providerResponse.verified}
              responseType={providerResponse.response_type}
              sourceUrl={providerResponse.source_url}
            />
            {isModerator && providerId && providerResponse.response_type !== "public_statement" && (
              <div className="flex justify-end">
                <PublicStatementModal incidentId={incident.id} providerId={providerId} />
              </div>
            )}
          </div>
        ) : (
          <Card variant="default" className="border-dashed">
            <CardContent className="flex items-center justify-between gap-3 py-6">
              <div>
                <p className="text-fg-primary text-sm font-medium">{t("ai_response_pending")}</p>
                <p className="text-fg-muted text-xs">{tCommon("aiResponseDesc")}</p>
              </div>
              {isModerator && providerId && (
                <PublicStatementModal incidentId={incident.id} providerId={providerId} />
              )}
            </CardContent>
          </Card>
        )}

        <div className="border-border-subtle/50 mt-8 border-t pt-8">
          <CommentSection
            incidentId={incident.id}
            comments={comments}
            currentUserId={currentUserId}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <aside className="space-y-4">
        <div className="flex items-start gap-3">
          <VoteButtons
            incidentId={incident.id}
            initialUpvotes={incident.upvotes}
            initialDownvotes={incident.downvotes}
            initialUserVote={userVote}
            disabled={!isAuthenticated}
          />
          <div className="flex-1">
            <ShareButtons url={`/incidents/${incident.id}`} title={displayTitle} />
          </div>
        </div>
        <div id="affected">
          <AffectedButton
            incidentId={incident.id}
            initialAffectedCount={incident.affected_count ?? 0}
            initialUserAffected={userAffected}
            disabled={!isAuthenticated}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{tCommon("details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              icon={<Building2 className="h-3.5 w-3.5" />}
              label={tCommon("provider")}
              value={
                <Link
                  href={`/press-kit/${incident.provider_slug}`}
                  className="text-brand-400 hover:underline"
                >
                  {incident.provider_name}
                </Link>
              }
            />
            <Row
              icon={<Tag className="h-3.5 w-3.5" />}
              label={t("category")}
              value={tCat(incident.category)}
            />
            <Row
              icon={<Clock className="h-3.5 w-3.5" />}
              label={t("incident_date")}
              value={formatDate(new Date(incident.incident_date), locale)}
            />
            <Row
              icon={<Globe className="h-3.5 w-3.5" />}
              label={t("language")}
              value={incident.language ?? "—"}
            />
          </CardContent>
        </Card>
        <PassportButton incidentId={incident.id} />
        <TakedownButton incidentId={incident.id} />
      </aside>
    </article>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-fg-muted inline-flex items-center gap-1.5 text-xs">
        {icon}
        {label}
      </span>
      <span className="text-fg-primary text-right text-sm">{value}</span>
    </div>
  );
}
