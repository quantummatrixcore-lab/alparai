"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitVendorResponseAction } from "@/actions/vendor";
import {
  ShieldCheck,
  Building2,
  Lock,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export interface VendorPortalIncidentItem {
  id: string;
  title: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  providerName: string;
  modelName: string;
  description: string;
  createdAt: string;
  vendorResponseText?: string | null;
  vendorResponseAt?: string | null;
}

interface VendorDefensePortalClientProps {
  initialIncidents: VendorPortalIncidentItem[];
}

const VENDOR_COMPANIES = [
  { id: "anthropic", name: "Anthropic PBC", token: "vtr_anthropic_2026", badge: "AAA Tier" },
  { id: "openai", name: "OpenAI LLC", token: "vtr_openai_2026", badge: "AA Tier" },
  { id: "google", name: "Google DeepMind / Vertex", token: "vtr_google_2026", badge: "AAA Tier" },
  { id: "mistral", name: "Mistral AI", token: "vtr_mistral_2026", badge: "AA Tier" },
  { id: "meta", name: "Meta AI", token: "vtr_meta_2026", badge: "AA Tier" },
];

export function VendorDefensePortalClient({ initialIncidents }: VendorDefensePortalClientProps) {
  const t = useTranslations("vendorPortal");

  // Auth / Company Token state
  const [authToken, setAuthToken] = useState("");
  const [authenticatedVendor, setAuthenticatedVendor] = useState<{
    id: string;
    name: string;
    token: string;
    badge: string;
  } | null>(null);
  const [authError, setAuthError] = useState("");

  // Incidents state
  const [incidents, setIncidents] = useState<VendorPortalIncidentItem[]>(initialIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    initialIncidents[0]?.id || null,
  );
  const [filterTab, setFilterTab] = useState<"all" | "needs_response" | "responded">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form Response state
  const [responseText, setResponseText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [formFeedback, setFormFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || null;

  // Handle Auth submission
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const matched = VENDOR_COMPANIES.find(
      (c) => c.token === authToken.trim() || c.id === authToken.trim().toLowerCase(),
    );

    if (matched) {
      setAuthenticatedVendor(matched);
    } else if (authToken.trim().length > 3) {
      // Custom token entry fallback
      setAuthenticatedVendor({
        id: "custom_vendor",
        name: authToken.trim().toUpperCase(),
        token: authToken.trim(),
        badge: t("verified_vendor_badge"),
      });
    } else {
      setAuthError(t("auth_error_invalid_token"));
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelName.toLowerCase().includes(searchQuery.toLowerCase());

    const hasResponse = Boolean(item.vendorResponseText);

    if (filterTab === "needs_response") return matchesSearch && !hasResponse;
    if (filterTab === "responded") return matchesSearch && hasResponse;
    return matchesSearch;
  });

  // Response Submit Handler
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setFormFeedback(null);

    startTransition(async () => {
      const res = await submitVendorResponseAction(selectedIncident.id, responseText);
      if (res.ok && res.maskedText && res.vendorResponseAt) {
        setFormFeedback({ type: "success", msg: t("success_message") });
        // Update local incidents list
        setIncidents((prev) =>
          prev.map((item) =>
            item.id === selectedIncident.id
              ? {
                  ...item,
                  vendorResponseText: res.maskedText,
                  vendorResponseAt: res.vendorResponseAt,
                }
              : item,
          ),
        );
      } else {
        setFormFeedback({ type: "error", msg: res.error || t("error_message") });
      }
    });
  };

  // If not authenticated, render dark glass login screen
  if (!authenticatedVendor) {
    return (
      <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden p-4 sm:p-6">
        {/* Ambient Dark Glows */}
        <div className="bg-success-500/10 pointer-events-none absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]" />
        <div className="bg-accent-500/10 pointer-events-none absolute right-10 bottom-10 h-[400px] w-[400px] rounded-full blur-[120px]" />

        <div className="border-border-subtle/80 bg-bg-elevated/80 text-fg-primary relative w-full max-w-lg rounded-3xl border p-8 shadow-2xl backdrop-blur-2xl sm:p-10">
          <div className="mb-6 flex items-center justify-center">
            <div className="border-success-500/30 from-success-500/20 text-success-400 shadow-success-500/10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-to-br to-cyan-500/20 shadow-lg">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <span className="border-success-500/20 bg-success-500/10 text-success-400 mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              {t("login_badge")}
            </span>
            <h1 className="text-2xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text font-bold tracking-tight text-transparent sm:text-3xl">
              {t("login_title")}
            </h1>
            <p className="text-fg-muted mt-2 text-sm leading-relaxed">{t("login_desc")}</p>
          </div>

          <form onSubmit={handleAuthenticate} className="space-y-5">
            <div>
              <label
                htmlFor="vendorToken"
                className="text-fg-secondary mb-2 block text-xs font-medium"
              >
                {t("corporate_vendor_token")}
              </label>
              <div className="relative">
                <Lock className="text-fg-disabled absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <input
                  id="vendorToken"
                  type="text"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder={t("token_placeholder")}
                  className="border-border-subtle bg-bg-tertiary/70 focus:border-success-500/60 focus:ring-success-500/60 w-full rounded-xl border py-3 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition-all focus:ring-1 focus:outline-none"
                  required
                />
              </div>
              {authError && <p className="text-danger-400 mt-2 text-xs">{authError}</p>}
            </div>

            <button
              type="submit"
              className="group from-success-500 shadow-success-500/20 hover:from-success-400 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r to-teal-600 px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-lg transition-all hover:to-teal-500"
            >
              <span>{t("login_btn")}</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="border-border-subtle/80 mt-8 border-t pt-6">
            <p className="text-fg-disabled mb-3 text-center text-xs">{t("quick_demo_preset")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {VENDOR_COMPANIES.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => {
                    setAuthToken(company.token);
                    setAuthenticatedVendor(company);
                  }}
                  className="border-border-strong/60 text-fg-secondary hover:border-success-500/40 bg-bg-secondary flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all hover:text-white"
                >
                  <Building2 className="text-success-400 h-3 w-3" />
                  {company.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const needsResponseCount = incidents.filter((i) => !i.vendorResponseText).length;
  const respondedCount = incidents.filter((i) => Boolean(i.vendorResponseText)).length;

  return (
    <div className="text-fg-primary mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header Bar */}
      <div className="border-border-subtle/80 bg-bg-elevated/60 relative overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="bg-success-500/10 pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="border-success-500/30 from-success-500/20 text-success-400 shadow-success-500/10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-to-br to-teal-500/20 shadow-xl">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {authenticatedVendor.name}
                </h1>
                <span className="border-success-500/20 bg-success-500/10 text-success-400 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  {authenticatedVendor.badge}
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-sm">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
            <button
              onClick={() => setAuthenticatedVendor(null)}
              className="border-border-strong/60 text-fg-secondary bg-bg-secondary hover:bg-bg-secondary flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("logout_btn")}
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="border-border-subtle/60 mt-6 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-3">
          <div className="border-border-subtle/50 bg-bg-tertiary/40 rounded-2xl border p-4">
            <p className="text-fg-muted text-xs font-medium">{t("total_incidents_stat")}</p>
            <p className="text-2xl mt-1 font-bold text-white">{incidents.length}</p>
          </div>
          <div className="border-warning-800/30 rounded-2xl border bg-amber-950/20 p-4">
            <p className="text-warning-300/80 text-xs font-medium">{t("pending_response_stat")}</p>
            <p className="text-warning-400 text-2xl mt-1 font-bold">
              {needsResponseCount}
            </p>
          </div>
          <div className="border-success-800/30 col-span-2 rounded-2xl border bg-emerald-950/20 p-4 sm:col-span-1">
            <p className="text-success-300/80 text-xs font-medium">
              {t("defense_statements_stat")}
            </p>
            <p className="text-success-400 text-2xl mt-1 font-bold">{respondedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Workspace: Incidents List & Defense Editor */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Incidents List (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="border-border-subtle/80 bg-bg-elevated/60 space-y-4 rounded-2xl border p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <ShieldAlert className="text-success-400 h-4 w-4" />
                {t("incidents_title")}
              </h2>
              <span className="text-fg-muted text-xs">
                {t("items_count", { count: filteredIncidents.length })}
              </span>
            </div>

            {/* Search and Tabs */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="text-fg-disabled absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_placeholder_input")}
                  className="border-border-subtle bg-bg-tertiary/60 focus:border-success-500/50 w-full rounded-xl border py-2 pr-3 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="border-border-subtle/80 bg-bg-tertiary/60 flex items-center gap-1 rounded-xl border p-1 text-xs">
                <button
                  onClick={() => setFilterTab("all")}
                  className={`flex-1 rounded-lg py-1.5 font-medium transition-all ${
                    filterTab === "all"
                      ? "bg-bg-secondary text-white shadow-sm"
                      : "text-fg-muted hover:text-fg-primary"
                  }`}
                >
                  {t("status_all")}
                </button>
                <button
                  onClick={() => setFilterTab("needs_response")}
                  className={`flex-1 rounded-lg py-1.5 font-medium transition-all ${
                    filterTab === "needs_response"
                      ? "text-warning-300 bg-bg-secondary shadow-sm"
                      : "text-fg-muted hover:text-fg-primary"
                  }`}
                >
                  {t("status_needs_response")} ({needsResponseCount})
                </button>
                <button
                  onClick={() => setFilterTab("responded")}
                  className={`flex-1 rounded-lg py-1.5 font-medium transition-all ${
                    filterTab === "responded"
                      ? "text-success-300 bg-bg-secondary shadow-sm"
                      : "text-fg-muted hover:text-fg-primary"
                  }`}
                >
                  {t("status_responded")}
                </button>
              </div>
            </div>

            {/* Incidents Scrollable List */}
            <div className="custom-scrollbar max-h-[550px] space-y-3 overflow-y-auto pr-1">
              {filteredIncidents.length === 0 ? (
                <div className="text-fg-disabled py-10 text-center text-xs">
                  <Filter className="mx-auto mb-2 h-6 w-6 opacity-50" />
                  {t("no_incidents")}
                </div>
              ) : (
                filteredIncidents.map((incident) => {
                  const isSelected = incident.id === selectedIncidentId;
                  const isResponded = Boolean(incident.vendorResponseText);

                  return (
                    <button
                      key={incident.id}
                      onClick={() => {
                        setSelectedIncidentId(incident.id);
                        setResponseText(incident.vendorResponseText || "");
                        setFormFeedback(null);
                      }}
                      className={`w-full space-y-2.5 rounded-xl border p-4 text-left text-xs transition-all ${
                        isSelected
                          ? "border-success-500/50 shadow-success-500/5 ring-success-500/20 bg-bg-secondary shadow-lg ring-1"
                          : "border-border-subtle/60 bg-bg-tertiary/40 hover:border-border-strong/60 hover:bg-bg-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-fg-primary truncate font-semibold">
                          {incident.modelName}
                        </span>
                        {isResponded ? (
                          <span className="border-success-500/20 bg-success-500/10 text-success-400 flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            {t("status_responded_badge")}
                          </span>
                        ) : (
                          <span className="border-warning-500/20 bg-warning-500/10 text-warning-400 flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium">
                            <Clock className="h-3 w-3" />
                            {t("status_pending_badge")}
                          </span>
                        )}
                      </div>

                      <p className="text-fg-secondary line-clamp-2 leading-relaxed font-medium">
                        {incident.title}
                      </p>

                      <div className="border-border-subtle/40 text-fg-muted flex items-center justify-between border-t pt-1 text-[10px]">
                        <span className="text-fg-muted capitalize">{incident.category}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 font-semibold uppercase ${
                            incident.severity === "critical"
                              ? "bg-danger-500/10 text-danger-400"
                              : incident.severity === "high"
                                ? "bg-warning-500/10 text-warning-400"
                                : "text-fg-muted bg-bg-secondary"
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Defense Form & Incident Detail (7 cols) */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="border-border-subtle/80 bg-bg-elevated/60 space-y-6 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
              {/* Incident Header */}
              <div className="border-border-subtle/80 space-y-3 border-b pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="border-border-strong text-success-400 bg-bg-secondary rounded-lg border px-2.5 py-1 text-xs font-semibold">
                      {selectedIncident.modelName}
                    </span>
                    <span className="text-fg-muted text-xs">
                      {t("id_prefix")}: {selectedIncident.id.slice(0, 8)}...
                    </span>
                  </div>

                  <span className="text-fg-muted text-xs">
                    {new Date(selectedIncident.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="text-xl leading-tight font-bold text-white">
                  {selectedIncident.title}
                </h2>
                <p className="border-border-subtle/60 bg-bg-tertiary/60 text-fg-secondary rounded-xl border p-4 text-xs leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Vendor Defense Statement Form */}
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="text-success-400 h-4 w-4" />
                    <h3 className="text-sm font-semibold text-white">
                      {t("official_response_title")}
                    </h3>
                  </div>
                  <span className="text-fg-muted text-[11px]">{t("pii_guardian_active")}</span>
                </div>

                <p className="text-fg-muted text-xs">{t("official_response_desc")}</p>

                <div className="relative">
                  <textarea
                    rows={6}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder={t("response_placeholder")}
                    className="border-border-subtle bg-bg-tertiary/80 focus:border-success-500/60 focus:ring-success-500/60 w-full resize-y rounded-xl border p-4 text-xs leading-relaxed text-white placeholder-slate-500 transition-all focus:ring-1 focus:outline-none"
                    required
                  />
                </div>

                <div className="border-border-subtle/40 bg-bg-tertiary/40 text-fg-muted flex items-center justify-between rounded-xl border p-3 text-[11px]">
                  <span className="text-fg-muted flex items-center gap-1.5">
                    <AlertTriangle className="text-success-400 h-3.5 w-3.5 shrink-0" />
                    {t("pii_warning")}
                  </span>
                  <span>{responseText.length} / 5000</span>
                </div>

                {formFeedback && (
                  <div
                    className={`flex items-center gap-2 rounded-xl border p-3.5 text-xs font-medium ${
                      formFeedback.type === "success"
                        ? "border-success-800/60 text-success-300 bg-emerald-950/40"
                        : "border-danger-800/60 text-danger-300 bg-rose-950/40"
                    }`}
                  >
                    {formFeedback.type === "success" ? (
                      <CheckCircle2 className="text-success-400 h-4 w-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="text-danger-400 h-4 w-4 shrink-0" />
                    )}
                    <span>{formFeedback.msg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isPending || responseText.trim().length < 10}
                    className="from-success-500 shadow-success-500/10 hover:from-success-400 flex items-center gap-2 rounded-xl bg-gradient-to-r to-teal-600 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-lg transition-all hover:to-teal-500 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isPending ? t("submitting") : t("submit_response")}</span>
                  </button>
                </div>
              </form>

              {/* Published Response Preview */}
              {selectedIncident.vendorResponseText && (
                <div className="border-border-subtle/80 mt-6 space-y-3 border-t pt-5">
                  <div className="text-success-400 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("published_official_statement")}
                    </span>
                    {selectedIncident.vendorResponseAt && (
                      <span className="text-fg-muted text-[11px]">
                        {t("response_submitted_at")}{" "}
                        {new Date(selectedIncident.vendorResponseAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="border-success-500/20 text-fg-primary rounded-xl border bg-emerald-950/10 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {selectedIncident.vendorResponseText}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-border-subtle/80 bg-bg-elevated/60 text-fg-muted rounded-2xl border p-12 text-center text-xs backdrop-blur-xl">
              <MessageSquare className="text-fg-secondary mx-auto mb-3 h-10 w-10" />
              {t("select_incident")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
