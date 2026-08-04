"use client";

import * as React from "react";
import { useActionState } from "react";
import { useState, useEffect, useCallback, useMemo, useDeferredValue } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ProviderCombobox, type ComboboxOption } from "@/components/ui/provider-combobox";
import { ModelAutocomplete, type ModelOption } from "@/components/ui/model-autocomplete";
import { EvidenceUploader, SubmitButton } from "./evidence-uploader";
import { PIIBanner } from "./pii-banner";
import { Shield, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { submitIncident, type SubmitIncidentState } from "@/actions/incidents";
import { useFormAutosave, clearDraft } from "@/hooks/use-form-autosave";
import { GoogleSignInButton } from "@/components/auth/auth-buttons";
import { Link, useRouter } from "@/i18n/routing";
import type { AIProvider, AIModel, IncidentCategory, IncidentSeverity } from "@/types";
import { trackEvent } from "@/lib/analytics";
import { logger } from "@/lib/utils/logger";
import { getFingerprint } from "@/lib/utils/fingerprint";
import { incidentSubmissionSchema } from "@/lib/validation/schemas";

type ClientErrors = Record<string, string[]>;
const initialState: SubmitIncidentState = { ok: false };

export function IncidentForm({
  providers,
  models,
  isLoggedIn = false,
  totalIncidents,
}: {
  providers: AIProvider[];
  models: AIModel[];
  isLoggedIn?: boolean;
  totalIncidents?: number;
}) {
  const t = useTranslations("incident");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [state, formAction] = useActionState(submitIncident, initialState);
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [piiDetected, setPiiDetected] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [customProviderName, setCustomProviderName] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [customModelName, setCustomModelName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousEmail, setAnonymousEmail] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("medium");
  const [isExpert, setIsExpert] = useState(false);
  const [expertFix, setExpertFix] = useState("");
  const [consents, setConsents] = useState({
    truth: false,
    age: false,
    terms: false,
    coppa: false,
    ukOsa: false,
  });
  const allConsents =
    consents.truth && consents.age && consents.terms && consents.coppa && consents.ukOsa;

  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const KNOWN_SHARE_DOMAINS = [
    "chatgpt.com",
    "openai.com",
    "claude.ai",
    "grok.com",
    "x.com",
    "gemini.google.com",
  ];

  const isValidShareUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return KNOWN_SHARE_DOMAINS.some((d) => parsed.hostname.includes(d));
    } catch {
      return false;
    }
  };

  const handleImportUrl = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    if (!isValidShareUrl(importUrl)) {
      setImportError(
        t("import_invalid_domain", {
          defaultValue: "Only ChatGPT, Claude, Grok, and Gemini share links are supported.",
        }),
      );
      trackEvent("submit_funnel_import_fail", { error: "invalid_domain", url: importUrl });
      return;
    }

    setIsImporting(true);
    setImportError("");
    trackEvent("submit_funnel_import_attempt", { url: importUrl });
    try {
      const res = await fetch("/api/v1/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to extract");

      setTitle(data.title || "");
      setDescription(data.description || "");
      if (data.providerId) {
        setSelectedProvider(data.providerId);
        setCustomProviderName("");
      }
      trackEvent("submit_funnel_import_success", { providerId: data.providerId });
      toast.success(t("import_success", { defaultValue: "Imported successfully!" }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setImportError(message);
      trackEvent("submit_funnel_import_fail", { error: message });
      toast.error(t("import_error", { defaultValue: "Could not import data from this URL." }));
    } finally {
      setIsImporting(false);
    }
  };

  const DRAFT_KEY = "alpar_incident_draft";

  type IncidentDraft = {
    title: string;
    description: string;
    selectedProvider: string;
    customProviderName: string;
    selectedModel: string;
    customModelName: string;
    isAnonymous: boolean;
    severity: IncidentSeverity;
    isExpert: boolean;
    expertFix: string;
    anonymousEmail: string;
  };

  const deferredTitle = useDeferredValue(title);
  const deferredDescription = useDeferredValue(description);

  const draftValues = useMemo<IncidentDraft>(
    () => ({
      title,
      description,
      selectedProvider,
      customProviderName,
      selectedModel,
      customModelName,
      isAnonymous,
      anonymousEmail,
      severity,
      isExpert,
      expertFix,
    }),
    [
      title,
      description,
      selectedProvider,
      customProviderName,
      selectedModel,
      customModelName,
      isAnonymous,
      anonymousEmail,
      severity,
      isExpert,
      expertFix,
    ],
  );

  const handleRestore = useCallback((saved: IncidentDraft) => {
    setTitle(saved.title);
    setDescription(saved.description);
    setSelectedProvider(saved.selectedProvider);
    setCustomProviderName(saved.customProviderName);
    setSelectedModel(saved.selectedModel);
    setCustomModelName(saved.customModelName);
    setIsAnonymous(saved.isAnonymous);
    setAnonymousEmail(saved.anonymousEmail ?? "");
    setSeverity(saved.severity ?? "medium");
    setIsExpert(saved.isExpert ?? false);
    setExpertFix(saved.expertFix ?? "");
  }, []);

  const handleRestoreNotify = useCallback(() => {
    toast.info(t("draft_restored"));
  }, [t]);

  useFormAutosave<IncidentDraft>({
    key: DRAFT_KEY,
    values: draftValues,
    onRestore: handleRestore,
    onRestoreNotify: handleRestoreNotify,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
      const val = params.get(key);
      if (val) utm[key] = val;
    });
    trackEvent("submit_start", utm);

    // Load fingerprint
    getFingerprint().then(setVisitorId).catch(console.error);
  }, []);

  useEffect(() => {
    if (state.ok) {
      clearDraft(DRAFT_KEY);
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
        const val = params.get(key);
        if (val) utm[key] = val;
      });
      trackEvent("submit_complete", utm);
      toast.success(t("submitted"));

      if (state.incidentId) {
        setProcessingStage("queued");

        const eventSource = new EventSource(`/api/incidents/${state.incidentId}/status`);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const stage = data.stage;
            if (stage === "complete") {
              setProcessingStage("complete");
              eventSource.close();
              router.push(`/incidents/${state.incidentId}`);
            } else if (stage === "failed" || stage === "not_found") {
              setProcessingStage(null);
              eventSource.close();
            } else {
              setProcessingStage(stage);
            }
          } catch (err) {
            logger.error("SSE parse error", undefined, err instanceof Error ? err : undefined);
          }
        };

        const handlePollFallback = () => {
          eventSource.close();
          let attempts = 0;
          const interval = setInterval(async () => {
            attempts++;
            if (attempts > 18) {
              // 90 seconds max
              clearInterval(interval);
              setProcessingStage(null);
              toast.error(
                t("processing_timeout", {
                  defaultValue:
                    "Analysis is taking longer than expected. You will receive an email once complete.",
                }),
              );
              return;
            }

            try {
              const res = await fetch(`/api/v1/incidents/${state.incidentId}`);
              if (res.ok) {
                const data = await res.json();
                if (data.incident && data.incident.status !== "pending_review") {
                  clearInterval(interval);
                  setProcessingStage("complete");
                  router.push(`/incidents/${state.incidentId}`);
                }
              }
            } catch {
              // Ignore fetch errors during polling
            }
          }, 5000);
          return interval;
        };

        let pollInterval: NodeJS.Timeout | null = null;
        eventSource.onerror = () => {
          if (!pollInterval) {
            pollInterval = handlePollFallback();
          }
        };

        return () => {
          eventSource.close();
          if (pollInterval) {
            clearInterval(pollInterval);
          }
        };
      }
    } else if (state.error) {
      trackEvent("submit_funnel_error", { error: state.error });
      toast.error(state.error);
    }
  }, [state, t, router]);

  useEffect(() => {
    if (isExpert) {
      trackEvent("submit_funnel_expert_checked");
    }
  }, [isExpert]);

  useEffect(() => {
    if (allConsents) {
      trackEvent("submit_funnel_consents_accepted");
    }
  }, [allConsents]);

  useEffect(() => {
    let active = true;
    const checkPII = async () => {
      const text = `${deferredTitle} ${deferredDescription}`;
      if (!text.trim()) {
        if (active) setPiiDetected(false);
        return;
      }
      const { hasPII } = await import("@/lib/pii/guardian");
      const has = hasPII(text);
      if (active) setPiiDetected(has);
    };
    checkPII();
    return () => {
      active = false;
    };
  }, [deferredTitle, deferredDescription]);

  if (state.ok) {
    if (processingStage) {
      const stages = ["queued", "analyzing", "scoring", "complete"];
      const currentIdx = stages.indexOf(processingStage);

      return (
        <div className="mx-auto max-w-md space-y-8 px-4 py-16 text-center">
          <div className="space-y-3">
            <h2 className="text-fg-primary text-2xl font-bold tracking-tight">
              {t("processing_title", { defaultValue: "Raporunuz Analiz Ediliyor" })}
            </h2>
            <p className="text-fg-muted text-sm">
              {t("processing", { defaultValue: "Raporunuz işleniyor…" })}
            </p>
          </div>

          {/* Progress Card */}
          <div className="border-brand-500/20 rounded-2xl border bg-[#0A1622]/40 p-6 shadow-2xl backdrop-blur-md">
            <div className="space-y-6 text-left">
              {stages.map((stage, idx) => {
                const isPast = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                let icon = null;
                if (isPast) {
                  icon = (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00FF88]/20">
                      <CheckCircle2 className="h-4 w-4 text-[#00FF88]" />
                    </div>
                  );
                } else if (isCurrent) {
                  icon = (
                    <div className="flex h-6 w-6 items-center justify-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00FF88] border-t-transparent" />
                    </div>
                  );
                } else {
                  icon = <div className="border-fg-muted/20 h-6 w-6 rounded-full border-2" />;
                }

                const labelKey = `processing_${stage}`;
                let defaultLabel = "";
                if (stage === "queued") defaultLabel = "Report queued...";
                if (stage === "analyzing") defaultLabel = "Checking content...";
                if (stage === "scoring") defaultLabel = "Calculating score...";
                if (stage === "complete") defaultLabel = "Analysis complete!";

                return (
                  <div
                    key={stage}
                    className={`flex items-center gap-4 transition-all duration-300 ${
                      isCurrent ? "scale-[1.02] opacity-100" : isPast ? "opacity-75" : "opacity-40"
                    }`}
                  >
                    {icon}
                    <span
                      className={`text-sm font-medium ${
                        isCurrent
                          ? "text-[#00FF88] shadow-sm drop-shadow-[0_0_8px_rgba(0,255,136,0.3)]"
                          : "text-fg-primary"
                      }`}
                    >
                      {t(labelKey, { defaultValue: defaultLabel })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 px-4 py-12 text-center">
        <div className="bg-success-500/10 border-success-500/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full border">
          <CheckCircle2 className="text-success-500 h-10 w-10 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-fg-primary text-3xl font-extrabold tracking-tight">
            {t("submit_success_headline")}
          </h2>
          <p className="text-fg-muted mx-auto max-w-md text-sm leading-relaxed">
            {t("submit_success_body")}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
          <Button onClick={() => window.location.reload()} variant="primary">
            {t("submit_success_cta_another")}
          </Button>
          <Link href="/incidents">
            <Button variant="outline" className="w-full sm:w-auto">
              {t("submit_success_cta_published")}
            </Button>
          </Link>
        </div>

        {!isLoggedIn && (
          <div className="border-brand-500/20 bg-brand-500/5 mx-auto max-w-md space-y-4 rounded-xl border p-6">
            <h3 className="text-fg-primary text-sm font-semibold">
              {t("claim_badge_title", { defaultValue: "Claim Your Whistleblower Badge" })}
            </h3>
            <p className="text-fg-muted text-xs leading-relaxed">
              {t("claim_badge_desc", {
                defaultValue:
                  "Complete your account with Google in one click to track your incident, receive real-time status updates, and earn the exclusive Reporter badge.",
              })}
            </p>
            <div className="flex justify-center pt-2">
              <GoogleSignInButton next={`/my-incidents`} className="w-full justify-center" />
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button variant="outline" onClick={() => (window.location.href = "/incidents")}>
            {t("view_all_incidents", { defaultValue: "View All Incidents" })}
          </Button>
        </div>
      </div>
    );
  }

  const categoryOptions = (
    Object.keys({
      hallucination: 0,
      bias: 0,
      privacy: 0,
      security: 0,
      misinformation: 0,
      harassment: 0,
      manipulation: 0,
      inaccessibility: 0,
      copyright: 0,
      non_consensual_intimate_imagery_csam: 0,
      other: 0,
    }) as IncidentCategory[]
  ).map((c) => ({ value: c, label: tCat(c) }));

  const severityOptions: Array<{ value: IncidentSeverity; label: string }> = [
    { value: "low", label: t("severity_low") },
    { value: "medium", label: t("severity_medium") },
    { value: "high", label: t("severity_high") },
    { value: "critical", label: t("severity_critical") },
  ];

  const providerOptions: ComboboxOption[] = [
    ...providers.map((p) => ({
      value: p.id,
      label: p.name,
      hint: p.is_verified ? "✓" : undefined,
    })),
    {
      value: "custom:other",
      label: t("other_provider", { defaultValue: "Diğer (Kendi yazmak istiyorum)" }),
    },
  ];

  const modelOptions: ModelOption[] = [
    ...models
      .filter((m) => m.provider_id === selectedProvider && !selectedProvider.startsWith("custom:"))
      .map((m) => ({
        value: m.id,
        label: m.version ? `${m.name} (${m.version})` : m.name,
        hint: m.released_at ? new Date(m.released_at).getFullYear().toString() : undefined,
      })),
    {
      value: "custom:other",
      label: t("other_model", { defaultValue: "Diğer (Kendi yazmak istiyorum)" }),
    },
  ];

  const handleProviderChange = (value: string, customName?: string) => {
    setSelectedProvider(value);
    setSelectedModel("");
    if (customName && value !== "custom:other") setCustomProviderName(customName);
    else if (value !== "custom:other") setCustomProviderName("");
    trackEvent("submit_funnel_provider_selected", { provider: value });
  };

  const handleModelChange = (value: string, isCustom: boolean) => {
    setSelectedModel(value);
    if (isCustom && value !== "custom:other") setCustomModelName(value);
    else if (value !== "custom:other") setCustomModelName("");
  };

  const canSubmit = allConsents && selectedProvider && title.trim() && description.trim();

  const handleClientAction = (formData: FormData) => {
    const isUuid = (v: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

    const provider_id = String(formData.get("provider_id") ?? "");
    const model_id = String(formData.get("model_id") ?? "");

    const input = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      category: String(formData.get("category") ?? "") as IncidentCategory,
      severity: String(formData.get("severity") ?? "") as IncidentSeverity,
      aiProviderId: provider_id && isUuid(provider_id) ? provider_id : null,
      aiModelId: model_id && isUuid(model_id) ? model_id : null,
      incidentDate: String(formData.get("incident_date") ?? "") || "2024-01-01", // Default for validation
      language: "en" as const,
      isAnonymous: formData.get("is_anonymous") === "on",
      isExpert: formData.get("is_expert") === "on",
      expertFix: String(formData.get("expert_fix") ?? "") || null,
      sourceUrl: String(formData.get("source_url") ?? "") || undefined,
      consent: {
        truthfulness: true as const,
        anonymousPublication: true as const,
        age18Plus: true as const,
        termsOfService: true as const,
      },
    };

    const parsed = incidentSubmissionSchema.safeParse(input);
    if (!parsed.success) {
      setClientErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    if (provider_id === "custom:other" && !formData.get("provider_custom")) {
      setClientErrors({
        provider_id: [
          t("custom_provider_required", { defaultValue: "Lütfen sağlayıcı adını yazın." }),
        ],
      });
      return;
    }

    setClientErrors({});
    formAction(formData);
  };

  if (processingStage) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-16 text-center">
        <div className="relative flex items-center justify-center">
          <div className="border-brand-500/20 border-t-brand-500 h-20 w-20 animate-spin rounded-full border-4"></div>
          <Shield className="text-brand-400 absolute h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-fg-primary text-xl font-semibold">
            {t("processing_title", { defaultValue: "Raporunuz Analiz Ediliyor" })}
          </h2>
          <p className="text-fg-muted max-w-sm text-sm">
            {processingStage === "queued" &&
              t("processing_queued", {
                defaultValue: "🔍 Rapor sıraya alındı, analiz başlatılıyor...",
              })}
            {processingStage === "analyzing" &&
              t("processing_analyzing", {
                defaultValue: "🛡️ Güvenlik, uyumluluk ve içerik moderasyonu denetleniyor...",
              })}
            {processingStage === "scoring" &&
              t("processing_scoring", {
                defaultValue: "⚖️ Yapay zeka etki ve TruthScore analizleri yapılıyor...",
              })}
            {processingStage === "complete" &&
              t("processing_complete", {
                defaultValue: "✅ Analiz tamamlandı! Yönlendiriliyorsunuz...",
              })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={handleClientAction} className="space-y-6">
      {totalIncidents !== undefined && (
        <div className="bg-bg-secondary/40 border-border-subtle text-fg-secondary rounded-lg border p-3 text-center text-sm font-semibold">
          {t("submit_live_counter", { count: totalIncidents, verified: totalIncidents })}
        </div>
      )}

      {/* Premium Privacy Banner */}
      <div className="bg-bg-secondary/40 border-border-subtle/50 relative overflow-hidden rounded-xl border p-4 backdrop-blur-md">
        <div className="flex gap-3">
          <div className="bg-brand-500/10 border-brand-500/20 text-brand-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-left">
            <h4 className="text-fg-primary flex items-center gap-1.5 text-sm font-bold">
              <span>{t("privacy_banner_title")}</span>
              <span className="bg-brand-500/15 text-brand-400 rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase">
                🔒 KVKK/GDPR SAFE
              </span>
            </h4>
            <p className="text-fg-muted text-xs leading-relaxed">{t("privacy_banner_desc")}</p>
          </div>
        </div>
      </div>

      {piiDetected && <PIIBanner />}
      {state.formError && (
        <div
          className="border-danger-500/30 bg-danger-500/5 text-danger-400 rounded-md border p-3 text-sm"
          role="alert"
        >
          {state.formError}
        </div>
      )}

      {/* URL Import Section */}
      <div className="border-brand-500/20 bg-brand-500/5 space-y-3 rounded-lg border p-4">
        <h3 className="text-fg-primary flex items-center gap-2 text-sm font-semibold">
          <LinkIcon className="h-4 w-4" />
          {t("import_url_title", { defaultValue: "Paste Chat Link (1-Click Fill)" })}
        </h3>
        <p className="text-fg-muted text-xs">
          {t("import_url_desc", {
            defaultValue:
              "Paste a shared link from ChatGPT, Claude, or Grok to automatically fill out this form.",
          })}
        </p>
        <div className="flex gap-2">
          <Input
            name="import_url"
            placeholder="https://chatgpt.com/share/..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleImportUrl}
            disabled={isImporting || !importUrl}
          >
            {isImporting
              ? tCommon("loading", { defaultValue: "Loading..." })
              : t("import_btn", { defaultValue: "Import" })}
          </Button>
        </div>
        {importError && <p className="text-danger-400 text-xs">{importError}</p>}
      </div>

      <Input
        name="title"
        label={t("title_placeholder")}
        required
        maxLength={200}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        hint={`${title.length}/200`}
        error={clientErrors.title?.[0] || state.fieldErrors?.title?.[0]}
      />

      <Textarea
        name="description"
        label={t("description_placeholder")}
        required
        rows={8}
        maxLength={5000}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        hint={`${description.length}/5000`}
        error={clientErrors.description?.[0] || state.fieldErrors?.description?.[0]}
      />

      <div className="border-border-subtle bg-bg-secondary/30 space-y-4 rounded-md border p-4">
        <h3 className="text-fg-primary flex items-center gap-2 text-sm font-semibold">
          <Shield className="text-brand-400 h-4 w-4" />
          {t("incident_classification")}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <ProviderCombobox
              name="provider_id"
              label={tCommon("provider") ?? "AI Provider"}
              required
              value={selectedProvider}
              onChange={handleProviderChange}
              options={providerOptions}
              placeholder={t("select_provider")}
              error={clientErrors.provider_id?.[0] || state.fieldErrors?.provider_id?.[0]}
            />
            {selectedProvider === "custom:other" && (
              <Input
                name="provider_custom"
                placeholder={t("custom_provider_name", {
                  defaultValue: "Şirket/Sağlayıcı Adını Yazın",
                })}
                value={customProviderName}
                onChange={(e) => setCustomProviderName(e.target.value)}
                required
              />
            )}
            {selectedProvider !== "custom:other" && (
              <input type="hidden" name="provider_custom" value={customProviderName} />
            )}
          </div>

          <div className="space-y-3">
            <ModelAutocomplete
              name="model_id"
              label={tCommon("model") ?? "Model"}
              required
              value={selectedModel}
              onChange={handleModelChange}
              options={modelOptions}
              placeholder={t("select_model")}
              error={clientErrors.model_id?.[0] || state.fieldErrors?.model_id?.[0]}
              disabled={!selectedProvider}
            />
            {selectedModel === "custom:other" && (
              <Input
                name="model_custom"
                placeholder={t("custom_model_name", { defaultValue: "Model Adını Yazın" })}
                value={customModelName}
                onChange={(e) => setCustomModelName(e.target.value)}
                required
              />
            )}
            {selectedModel !== "custom:other" && (
              <input
                type="hidden"
                name="model_custom"
                value={selectedModel.startsWith("custom:") ? selectedModel.slice(7) : ""}
              />
            )}
          </div>
        </div>

        <div className="border-border-subtle/50 grid grid-cols-1 gap-4 border-t pt-2 sm:grid-cols-2">
          <Select
            name="category"
            label={t("category")}
            required
            placeholder="—"
            options={categoryOptions}
            error={clientErrors.category?.[0] || state.fieldErrors?.category?.[0]}
          />
          <Input
            name="incident_date"
            type="datetime-local"
            label={t("incident_date")}
            required
            error={clientErrors.incident_date?.[0] || state.fieldErrors?.incident_date?.[0]}
          />
        </div>

        {/* Severity Radio Group Segment */}
        <div className="border-border-subtle/50 space-y-1.5 border-t pt-4 text-left">
          <label className="text-fg-primary block text-sm font-medium">{t("severity")}</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {severityOptions.map((opt) => {
              const isActive = severity === opt.value;
              const borderColors = {
                low: isActive
                  ? "border-brand-500/80 bg-brand-500/10 text-brand-400 font-bold"
                  : "border-border-subtle bg-bg-secondary/20 hover:border-white/20 text-fg-secondary",
                medium: isActive
                  ? "border-success-500/80 bg-success-500/10 text-success-400 font-bold"
                  : "border-border-subtle bg-bg-secondary/20 hover:border-white/20 text-fg-secondary",
                high: isActive
                  ? "border-warning-500/80 bg-warning-500/10 text-warning-400 font-bold"
                  : "border-border-subtle bg-bg-secondary/20 hover:border-white/20 text-fg-secondary",
                critical: isActive
                  ? "border-danger-500/80 bg-danger-500/10 text-danger-400 font-bold"
                  : "border-border-subtle bg-bg-secondary/20 hover:border-white/20 text-fg-secondary",
              };
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSeverity(opt.value)}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border px-3 py-2.5 text-center transition-all ${borderColors[opt.value]}`}
                >
                  <span className="text-xs font-bold tracking-wider uppercase">{opt.label}</span>
                </button>
              );
            })}
          </div>
          <input type="hidden" name="severity" value={severity} />
          {importUrl && <input type="hidden" name="source_url" value={importUrl} />}
          {(clientErrors.severity?.[0] || state.fieldErrors?.severity?.[0]) && (
            <p className="text-danger-400 mt-1 text-xs">
              {clientErrors.severity?.[0] || state.fieldErrors?.severity?.[0]}
            </p>
          )}
        </div>
      </div>

      {/* Expert Section */}
      <div className="border-border-subtle bg-bg-secondary/30 space-y-4 rounded-md border p-4 text-left">
        <Checkbox
          name="is_expert"
          label={t("is_expert")}
          description={t("is_expert_hint")}
          checked={isExpert}
          onChange={(e) => setIsExpert(e.target.checked)}
        />
        {isExpert && (
          <div className="animate-in fade-in slide-in-from-top-1 space-y-1.5 pl-7 duration-200">
            <Textarea
              name="expert_fix"
              label={t("expert_fix")}
              placeholder={t("expert_fix_placeholder")}
              rows={4}
              maxLength={5000}
              value={expertFix}
              onChange={(e) => setExpertFix(e.target.value)}
              hint={`${expertFix.length}/5000`}
              error={clientErrors.expertFix?.[0] || state.fieldErrors?.expertFix?.[0]}
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-fg-primary mb-1.5 block text-sm font-medium">{t("evidence")}</label>
        <EvidenceUploader name="evidence" />
      </div>

      <fieldset className="border-border-subtle bg-bg-secondary/40 space-y-3 rounded-md border p-4">
        <legend className="text-fg-primary inline-flex items-center gap-1.5 px-2 text-sm font-semibold">
          <Shield className="text-brand-400 h-4 w-4" />
          {t("consent_required", { defaultValue: "Required consents" })}
        </legend>
        <Checkbox
          name="consent_truth"
          label={t("consent_truth")}
          required
          checked={consents.truth}
          onChange={(e) => setConsents((c) => ({ ...c, truth: e.target.checked }))}
        />
        <Checkbox
          name="consent_age"
          label={t("consent_age")}
          required
          checked={consents.age}
          onChange={(e) => setConsents((c) => ({ ...c, age: e.target.checked }))}
        />
        <Checkbox
          name="consent_terms"
          label={t("consent_terms")}
          required
          checked={consents.terms}
          onChange={(e) => setConsents((c) => ({ ...c, terms: e.target.checked }))}
        />
        <Checkbox
          name="consent_coppa"
          label={t("consent_coppa")}
          required
          checked={consents.coppa}
          onChange={(e) => setConsents((c) => ({ ...c, coppa: e.target.checked }))}
        />
        <Checkbox
          name="consent_uk_osa"
          label={t("consent_uk_osa")}
          required
          checked={consents.ukOsa}
          onChange={(e) => setConsents((c) => ({ ...c, ukOsa: e.target.checked }))}
        />
        <div>
          <Checkbox
            name="is_anonymous"
            label={t("anonymous")}
            description={t("anonymous_hint")}
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          {isAnonymous && (
            <>
              <p className="text-warning-400 mt-1.5 ml-7 text-xs leading-relaxed font-medium">
                {t("whistleblower_encryption_notice")}
              </p>
              <div className="mt-2 ml-7">
                <Input
                  name="anonymous_email"
                  type="email"
                  label={t("anonymous_email_label")}
                  placeholder="anon@example.com"
                  hint={t("anonymous_email_hint")}
                  value={anonymousEmail}
                  onChange={(e) => setAnonymousEmail(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </fieldset>

      {allConsents && (
        <p className="text-success-500 inline-flex items-center gap-1.5 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {tCommon("allSet", { defaultValue: "All consents accepted" })}
        </p>
      )}

      <input type="hidden" name="fingerprint" value={visitorId} />

      <SubmitButton className="w-full" disabled={!canSubmit}>
        {t("submit")}
      </SubmitButton>
    </form>
  );
}
