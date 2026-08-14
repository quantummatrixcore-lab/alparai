export const revalidate = 60; // 1 min ISR

import { setRequestLocale, getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  FileWarning,
  Scale,
  AlertTriangle,
  Lock,
  Building2,
  Eye,
  Radio,
} from "lucide-react";

interface ProviderRelation {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface CeaseAndDesistLogRow {
  id: string;
  provider_id: string | null;
  threat_level: "low" | "medium" | "high" | "critical" | "existential";
  legal_text: string;
  our_response: string;
  published_at: string;
  created_at: string;
  ai_providers: ProviderRelation | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "transparency" });
  return {
    title: t("cease_desist_title"),
    description: t("cease_desist_subtitle"),
  };
}

const threatBadge = (level: CeaseAndDesistLogRow["threat_level"], t: (key: string) => string) => {
  switch (level) {
    case "existential":
    case "critical":
      return (
        <Badge variant="danger" className="animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]">
          <AlertTriangle className="mr-1 h-3 w-3" />
          {t(`threat_${level}`)}
        </Badge>
      );
    case "high":
      return (
        <Badge variant="warning">
          <ShieldAlert className="mr-1 h-3 w-3" />
          {t(`threat_${level}`)}
        </Badge>
      );
    case "medium":
      return <Badge variant="warning">{t(`threat_${level}`)}</Badge>;
    case "low":
    default:
      return <Badge variant="muted">{t(`threat_${level}`)}</Badge>;
  }
};

export default async function CeaseDesistArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "transparency" });
  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("cease_and_desist_logs")
    .select("*, ai_providers (id, name, slug, logo_url)")
    .order("published_at", { ascending: false })
    .limit(100);

  const logs: CeaseAndDesistLogRow[] = (data as unknown as CeaseAndDesistLogRow[]) ?? [];

  return (
    <Container className="py-12">
      {/* Spatial Glassmorphism Hero Section (Red/Warning Theme) */}
      <div className="to-bg-secondary/40 relative mb-12 overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-b from-red-950/40 via-red-900/10 p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-2xl md:p-12">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-red-900/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/60 px-3.5 py-1 font-mono text-xs font-medium tracking-widest text-red-400 uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Radio className="h-3.5 w-3.5 animate-pulse text-red-400" />
            {t("cease_desist_badge")}
          </div>

          <h1 className="text-fg-primary text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            {t("cease_desist_title")}
          </h1>

          <p className="text-sm leading-relaxed text-red-200/80 sm:text-base">
            {t("cease_desist_subtitle")}
          </p>

          <div className="text-fg-muted flex flex-wrap gap-4 border-t border-red-500/20 pt-4 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-red-400" />
              <span>{t("publishRate")}: 100% Public</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-red-400" />
              <span>Zero-Redaction Immunity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-red-400" />
              <span>DSA Art. 17 & KVKK Exempt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Feed or Empty State */}
      {logs.length === 0 ? (
        <div className="to-bg-secondary/30 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/20 p-12 text-center backdrop-blur-md">
          <FileWarning className="mx-auto h-12 w-12 text-red-400/60" />
          <h3 className="text-fg-primary mt-4 text-base font-semibold">
            {t("cease_desist_empty")}
          </h3>
        </div>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => {
            const providerName = log.ai_providers?.name ?? "External Legal Counsel / Provider";

            return (
              <div
                key={log.id}
                className="group via-bg-secondary/40 to-bg-tertiary/20 relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/25 p-6 backdrop-blur-md transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_0_35px_rgba(239,68,68,0.2)] md:p-8"
              >
                <div className="absolute top-0 right-0 h-1 w-32 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />

                {/* Card Top Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-red-500/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-950/50 text-red-400 shadow-inner">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-mono text-xs tracking-wider text-red-300/70 uppercase">
                        {t("cease_desist_provider")}
                      </span>
                      <h2 className="text-fg-primary text-base font-bold">{providerName}</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {threatBadge(log.threat_level, t)}
                    <span className="text-fg-muted font-mono text-xs">
                      {formatDate(log.published_at, locale)}
                    </span>
                  </div>
                </div>

                {/* Main Content Grid: Legal Demand vs Shield Response */}
                <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Incoming Demand Box */}
                  <div className="rounded-xl border border-red-900/50 bg-black/50 p-5 backdrop-blur-sm">
                    <div className="mb-3 flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-red-400 uppercase">
                      <FileWarning className="h-4 w-4" />
                      {t("cease_desist_legal_text")}
                    </div>
                    <p className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-red-200/90">
                      {log.legal_text}
                    </p>
                  </div>

                  {/* ALPAR AI Streisand Shield Response Box */}
                  <div className="border-brand-500/30 bg-brand-950/20 rounded-xl border p-5 backdrop-blur-sm">
                    <div className="text-brand-300 mb-3 flex items-center gap-2 font-mono text-xs font-bold tracking-wider uppercase">
                      <ShieldCheck className="h-4 w-4" />
                      {t("cease_desist_our_response")}
                    </div>
                    <p className="text-fg-primary text-xs leading-relaxed whitespace-pre-wrap">
                      {log.our_response}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}
