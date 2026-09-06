export const revalidate = 3600;

import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/layout";
import { IncidentDetailView } from "@/components/incidents/incident-detail";
import type { IncidentComment } from "@/components/incidents/comment-section";
import { IncidentJsonLd } from "@/components/seo/json-ld";
import { APP_URL } from "@/lib/constants";
import type { IncidentDetail, ProviderResponse, EvidenceItem } from "@/types";
import { RelatedIncidents } from "@/components/incidents/related-incidents";
import { StatusBanner } from "@/components/incidents/status-banner";
import { ProvenanceTrail } from "@/components/incidents/provenance-trail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;

  const supabase = await createServerClient();
  const { data } = await supabase
    .from("incidents")
    .select("title_masked, title_tr, description_masked, description_tr, severity, category")
    .eq("id", id)
    .maybeSingle();
  const row = data as Record<string, unknown> | null;
  const title =
    locale === "tr" && row?.title_tr ? (row.title_tr as string) : (row?.title_masked as string);
  const description =
    locale === "tr" && row?.description_tr
      ? (row.description_tr as string)
      : (row?.description_masked as string);
  const pageUrl = `${APP_URL}/${locale}/incidents/${id}`;

  return {
    title: title ? `${title} | ALPAR AI` : "AI Incident Audit | ALPAR AI",
    description: description ? description.slice(0, 160) : undefined,
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${APP_URL}/en/incidents/${id}`,
        tr: `${APP_URL}/tr/incidents/${id}`,
      },
    },
    openGraph: {
      title: title ?? "AI Incident Report",
      description: description ?? "Independent AI Incident & Safety Audit",
      url: pageUrl,
      type: "article",
      images: [
        {
          url: `${APP_URL}/${locale}/incidents/${id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title ?? "AI Incident Audit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? "AI Incident Report",
      description: description ?? "Independent AI Incident & Safety Audit",
      images: [`${APP_URL}/${locale}/incidents/${id}/opengraph-image`],
    },
  };
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const tCommon = await getTranslations({ locale, namespace: "common" });
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  const isAdminOrModerator =
    user?.role === "admin" || user?.role === "ceo" || user?.role === "moderator";

  let query = supabase.from("incidents").select("*").eq("id", id);
  if (!isAdminOrModerator) {
    query = query.eq("status", "published");
  }
  const { data: incidentRow } = await query.maybeSingle();
  if (!incidentRow) notFound();

  const providerId = (incidentRow as Record<string, unknown>)["ai_provider_id"] as string | null;
  const modelId = (incidentRow as Record<string, unknown>)["ai_model_id"] as string | null;

  const [providerRes, modelRes, evidenceRes, responseRes, commentsRes] = await Promise.all([
    providerId
      ? supabase.from("ai_providers").select("name, slug").eq("id", providerId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    modelId
      ? supabase.from("ai_models").select("name, version").eq("id", modelId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("evidence").select("id, file_name, file_path, mime_type").eq("incident_id", id),
    supabase
      .from("ai_provider_responses")
      .select("id, response_text, is_official, is_published, created_at, ai_provider_id")
      .eq("incident_id", id)
      .eq("is_published", true)
      .maybeSingle(),
    supabase
      .from("incident_comments")
      .select(
        "id, comment_text, created_at, user_id, users(id, full_name, username, avatar_url, role)",
      )
      .eq("incident_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const providerData = providerRes.data as { name: string; slug: string } | null;
  const modelData = modelRes.data as { name: string; version: string | null } | null;
  const responseRow = responseRes.data as {
    id: string;
    response_text: string;
    is_official: boolean;
    created_at: string;
    ai_provider_id: string;
  } | null;
  let providerResponse: ProviderResponse | null = null;
  if (responseRow && providerData) {
    providerResponse = {
      id: responseRow.id,
      response: responseRow.response_text,
      verified: responseRow.is_official,
      created_at: responseRow.created_at,
      provider_name: providerData.name,
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://auth.alparai.com";
  const evidence: EvidenceItem[] = ((evidenceRes.data as Array<Record<string, unknown>>) ?? []).map(
    (e) => {
      const pathStr = e["file_path"] as string;
      const fileUrl = pathStr.startsWith("http")
        ? pathStr
        : `${supabaseUrl}/storage/v1/object/public/evidence/${pathStr}`;
      return {
        id: e["id"] as string,
        file_name: e["file_name"] as string,
        file_url: fileUrl,
        file_type: (e["mime_type"] as string) ?? "application/octet-stream",
      };
    },
  );

  const r = incidentRow as Record<string, unknown>;
  const incident: IncidentDetail = {
    id: r["id"] as string,
    title_masked: (r["title_masked"] as string) ?? (r["title"] as string) ?? "",
    description_masked: (r["description_masked"] as string) ?? (r["description"] as string) ?? "",
    title_tr: (r["title_tr"] as string | null) ?? null,
    description_tr: (r["description_tr"] as string | null) ?? null,
    severity: r["severity"] as IncidentDetail["severity"],
    status: r["status"] as IncidentDetail["status"],
    category: r["category"] as IncidentDetail["category"],
    is_anonymous: (r["is_anonymous"] as boolean) ?? false,
    incident_date: (r["incident_date"] as string) ?? (r["created_at"] as string),
    created_at: (r["created_at"] as string) ?? "",
    view_count: (r["views_count"] as number) ?? 0,
    upvotes: (r["upvotes_count"] as number) ?? 0,
    downvotes: 0,
    affected_count: (r["affected_users_count"] as number) ?? 0,
    author_name: null,
    provider_name: providerData?.name ?? tCommon("unknown"),
    provider_slug: providerData?.slug ?? "",
    model_name: modelData?.name ?? null,
    language: (r["language"] as string) ?? "en",
    cross_audit_truth_score: (r["cross_audit_truth_score"] as number | null) ?? null,
    cross_audit_confidence: (r["cross_audit_confidence"] as number | null) ?? null,
    cross_audit_reasoning: (r["cross_audit_reasoning"] as string | null) ?? null,
    cross_audit_model: (r["cross_audit_model"] as string | null) ?? null,
    incident_source: (r["incident_source"] as string | null) ?? undefined,
    import_external_id: (r["import_external_id"] as string | null) ?? null,
    import_attribution: (r["import_attribution"] as string | null) ?? null,
    eu_act_risk_category: (r["eu_act_risk_category"] as string | null) ?? null,
    eu_act_serious_incident_class: (r["eu_act_serious_incident_class"] as string | null) ?? null,
    eu_act_high_risk_system_category:
      (r["eu_act_high_risk_system_category"] as string | null) ?? null,
    eu_act_reporting_deadline_days: (r["eu_act_reporting_deadline_days"] as number | null) ?? null,
    is_expert: (r["is_expert"] as boolean | null) ?? false,
    expert_fix: (r["expert_fix"] as string | null) ?? null,
  };

  let userVote: -1 | 0 | 1 = 0;
  if (user) {
    const { data: vote } = await supabase
      .from("incident_votes")
      .select("value")
      .eq("incident_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (vote) userVote = (vote as { value: -1 | 0 | 1 }).value;
  }

  let userAffected = false;
  if (user) {
    const { data: affected } = await supabase
      .from("incident_affected_users")
      .select("incident_id")
      .eq("incident_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (affected) userAffected = true;
  }

  const comments = (commentsRes.data ?? []) as unknown as IncidentComment[];

  return (
    <Container className="py-10">
      <IncidentJsonLd
        title={locale === "tr" && incident.title_tr ? incident.title_tr : incident.title_masked}
        description={
          locale === "tr" && incident.description_tr
            ? incident.description_tr
            : incident.description_masked
        }
        dateOccurred={incident.incident_date || incident.created_at}
        dateModified={incident.created_at || incident.incident_date}
        url={`${APP_URL}/${locale}/incidents/${id}`}
        severity={incident.severity}
        provider={incident.provider_name}
        modelName={incident.model_name}
        category={incident.category}
        locale={locale}
        images={[
          `${APP_URL}/${locale}/incidents/${id}/opengraph-image`,
          ...evidence
            .filter((e) => e.file_type.startsWith("image/"))
            .map((e) => e.file_url),
        ]}
        authorName={incident.is_anonymous ? null : incident.author_name}
        truthScore={incident.cross_audit_truth_score}
        upvotes={incident.upvotes}
        downvotes={incident.downvotes}
        affectedCount={incident.affected_count}
      />
      {isAdminOrModerator && <StatusBanner status={incident.status} />}
      <IncidentDetailView
        incident={incident}
        evidence={evidence}
        providerResponse={providerResponse}
        userVote={userVote}
        isAuthenticated={!!user}
        comments={comments}
        userAffected={userAffected}
        currentUserId={user?.id ?? null}
        isModerator={isAdminOrModerator}
        providerId={providerId ?? undefined}
      />
      <div className="border-brand-500/30 from-brand-500/10 my-8 rounded-xl border bg-gradient-to-r via-purple-500/10 to-transparent p-6 text-center shadow-lg">
        <h3 className="mb-2 text-lg font-bold text-white">
          {locale === "tr"
            ? "Benzer Bir Yapay Zeka Hatası mı Yaşadınız?"
            : "Experienced a Similar AI Failure?"}
        </h3>
        <p className="text-fg-muted mx-auto mb-4 max-w-xl text-sm">
          {locale === "tr"
            ? "ALPAR AI hesap verebilirlik platformuna yeni bir olay bildirerek topluluğu koruyun."
            : "Protect the community by reporting a new incident to the ALPAR AI accountability platform."}
        </p>
        <a
          href={`/${locale}/submit`}
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition"
        >
          {locale === "tr" ? "Olay Bildir (Report an Incident)" : "Report an Incident"}
        </a>
      </div>
      <ProvenanceTrail
        incidentId={id}
        createdAt={incident.incident_date}
        sourceUrl={
          incidentRow
            ? ((incidentRow as Record<string, unknown>)["source_url"] as string | null)
            : null
        }
        providerName={incident.provider_name}
      />
      <RelatedIncidents
        providerId={(incidentRow as Record<string, unknown>)["ai_provider_id"] as string}
        currentIncidentId={id}
        locale={locale}
      />
    </Container>
  );
}
