export const revalidate = 30;

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
  if (id === "mock-incident-123") {
    return { title: "Mock Incident" };
  }
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("incidents")
    .select("title_masked, title_tr")
    .eq("id", id)
    .maybeSingle();
  const row = data as Record<string, unknown> | null;
  const title =
    locale === "tr" && row?.title_tr ? (row.title_tr as string) : (row?.title_masked as string);
  return {
    title: title ?? "Incident",
  };
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (id === "mock-incident-123") {
    const mockIncident: IncidentDetail = {
      id: "mock-incident-123",
      title_masked: "Mock Incident Title for Testing SSE Flow",
      description_masked:
        "This is a detailed description of the mocked AI incident with sufficient length for test.",
      title_tr: null,
      description_tr: null,
      category: "hallucination",
      severity: "medium",
      incident_date: new Date().toISOString(),
      status: "published",
      provider_name: "OpenAI",
      provider_slug: "openai",
      model_name: "GPT-4",
      is_anonymous: true,
      created_at: new Date().toISOString(),
      language: "en",
      view_count: 0,
      upvotes: 0,
      downvotes: 0,
      author_name: null,
      cross_audit_truth_score: null,
      cross_audit_confidence: null,
      cross_audit_reasoning: null,
      cross_audit_model: null,
    };
    return (
      <Container className="py-10">
        <IncidentDetailView
          incident={mockIncident}
          evidence={[]}
          providerResponse={null}
          userVote={0}
          isAuthenticated={false}
          comments={[]}
          userAffected={false}
          currentUserId={null}
        />
      </Container>
    );
  }

  if (id === "001") {
    const grokIncident: IncidentDetail = {
      id: "001",
      title_masked: "Identity Verification Failure: Grok Rejects Valid Passport",
      description_masked:
        "The AI system Grok refused to verify the founder's valid government-issued passport during an identity check. Despite clear photographic evidence and valid expiration dates, the model hallucinated that the document was invalid or expired. This rigid failure led to a complete account lockout and inability to access critical services, highlighting the dangers of deploying unyielding AI for sensitive KYC (Know Your Customer) processes without human fallback.",
      title_tr: "Kimlik Doğrulama Hatası: Grok Geçerli Pasaportu Reddetti",
      description_tr:
        "Yapay zeka sistemi Grok, kimlik doğrulaması sırasında kurucunun geçerli devlet onaylı pasaportunu reddetti. Net fotoğrafik kanıtlara ve geçerli son kullanma tarihlerine rağmen model, belgenin geçersiz veya süresinin dolmuş olduğu halüsinasyonunu üretti. Bu katı hata, hesabın tamamen kilitlenmesine ve kritik hizmetlere erişilememesine yol açarak, hassas KYC (Müşterini Tanı) süreçleri için insan yedeği olmadan esnek olmayan yapay zeka dağıtmanın tehlikelerini vurguladı.",
      category: "hallucination",
      severity: "high",
      incident_date: "2024-05-15T10:00:00Z",
      status: "published",
      provider_name: "xAI",
      provider_slug: "xai",
      model_name: "Grok",
      is_anonymous: false,
      created_at: new Date().toISOString(),
      language: "en",
      view_count: 1542,
      upvotes: 342,
      downvotes: 12,
      author_name: "Ercüment Erden",
      cross_audit_truth_score: 95,
      cross_audit_confidence: 98,
      cross_audit_reasoning:
        "The system exhibited severe hallucination by refusing a valid government document and insisting on incorrect facts, severely impacting the user.",
      cross_audit_model: "Opus 5",
      is_expert: true,
      expert_fix:
        "Implement stricter OCR confidence thresholds and mandatory fallback to human verification for PII/Document scanning when AI confidence is debated.",
    };
    return (
      <Container className="py-10">
        <IncidentDetailView
          incident={grokIncident}
          evidence={[]}
          providerResponse={null}
          userVote={0}
          isAuthenticated={false}
          comments={[]}
          userAffected={true}
          currentUserId={null}
        />
      </Container>
    );
  }
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

  const [providerRes, modelRes, evidenceRes, responseRes, commentsRes] = await Promise.all([
    supabase
      .from("ai_providers")
      .select("name, slug")
      .eq("id", (incidentRow as Record<string, unknown>)["ai_provider_id"] as string)
      .maybeSingle(),
    supabase
      .from("ai_models")
      .select("name, version")
      .eq("id", (incidentRow as Record<string, unknown>)["ai_model_id"] as string)
      .maybeSingle(),
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

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://azszpzyvxjduhemkjsdh.supabase.co";
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
        title={incident.title_masked}
        description={incident.description_masked}
        dateOccurred={incident.incident_date}
        url={`${APP_URL}/${locale}/incidents/${id}`}
        severity={incident.severity}
        provider={incident.provider_name}
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
