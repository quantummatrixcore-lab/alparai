"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Server,
  Save,
  CheckCircle2,
  Zap,
  KeyRound,
  AlertTriangle,
  Globe,
  Sliders,
  RefreshCw,
  Radio,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/logo";

export function SettingsDashboardClient() {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<"security" | "api" | "performance" | "emergency">(
    "security",
  );
  const [settings, setSettings] = useState({
    piiGuardian: true,
    strictSsr: true,
    rateLimitRequestsPerMin: 60,
    maintenanceMode: false,
    publicApiEnabled: true,
    autoAuditIngestion: true,
    telemetryConsent: true,
    corsRestricted: true,
    maxPayloadMb: 10,
    sessionTimeoutMins: 30,
  });

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-8" data-testid="settings-dashboard">
      {/* Top Hero Card with ALPAR AI Brand Logo */}
      <div className="from-bg-secondary via-bg-tertiary to-bg-elevated relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r p-6 shadow-2xl backdrop-blur-xl">
        <div className="bg-brand-500/10 absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full blur-3xl" />
        <div className="bg-accent-500/10 absolute bottom-0 left-1/3 -mb-8 h-48 w-48 rounded-full blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="border-brand-500/30 bg-brand-500/10 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-[0_0_25px_rgba(168,85,247,0.25)]">
              <Logo className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  ALPAR AI System Governance
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Operational
                </span>
              </div>
              <p className="text-fg-muted mt-1 text-xs">
                Platform security, PII guardian policies, API limits, and architecture control plane
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/5 bg-black/30 p-3">
            <div className="px-2 text-center">
              <span className="text-fg-muted block text-[10px] font-bold tracking-wider uppercase">
                PII Guard
              </span>
              <span className="text-sm font-extrabold text-emerald-400">Active</span>
            </div>
            <div className="border-x border-white/10 px-3 text-center">
              <span className="text-fg-muted block text-[10px] font-bold tracking-wider uppercase">
                SSRF Policy
              </span>
              <span className="text-sm font-extrabold text-cyan-400">Strict</span>
            </div>
            <div className="px-2 text-center">
              <span className="text-fg-muted block text-[10px] font-bold tracking-wider uppercase">
                Rate Ceiling
              </span>
              <span className="text-brand-400 text-sm font-extrabold">
                {settings.rateLimitRequestsPerMin} RPM
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              activeTab === "security"
                ? "bg-brand-500 shadow-brand-500/25 border-brand-400/30 border text-white shadow-lg"
                : "text-fg-muted bg-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Security & PII Guardian
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("api")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              activeTab === "api"
                ? "bg-brand-500 shadow-brand-500/25 border-brand-400/30 border text-white shadow-lg"
                : "text-fg-muted bg-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Globe className="h-4 w-4 text-cyan-400" /> Public API & Gateway
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("performance")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              activeTab === "performance"
                ? "bg-brand-500 shadow-brand-500/25 border-brand-400/30 border text-white shadow-lg"
                : "text-fg-muted bg-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Zap className="h-4 w-4 text-amber-400" /> Rate Limits & Ceilings
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("emergency")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              activeTab === "emergency"
                ? "bg-danger-500 shadow-danger-500/25 border-danger-400/30 border text-white shadow-lg"
                : "text-fg-muted bg-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            <AlertTriangle className="text-danger-400 h-4 w-4" /> Emergency & Maintenance
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* TAB 1: SECURITY & PII GUARDIAN */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* PII Guardian Widget */}
            <div className="from-bg-secondary via-bg-tertiary relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br to-emerald-950/20 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t("pii_guardian_sanitization")}
                    </h3>
                    <p className="text-fg-muted text-xs">
                      Automatic regex scrubbing prior to DB write
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.piiGuardian}
                    onChange={(e) => setSettings({ ...settings, piiGuardian: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-white/10 peer-checked:bg-emerald-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-white/5 bg-black/40 p-4 text-xs">
                <p className="text-fg-secondary">{t("mask_emails_phone_numbers_and_tc_identit")}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                    Emails (HASH)
                  </span>
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                    TCKN / SSN
                  </span>
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                    Phone Numbers
                  </span>
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                    API Tokens
                  </span>
                </div>
              </div>
            </div>

            {/* SSRF Policy Guard Widget */}
            <div className="from-bg-secondary via-bg-tertiary relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br to-cyan-950/20 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t("ssrf_policy_strict_allowlist")}
                    </h3>
                    <p className="text-fg-muted text-xs">Outbound connector host isolation</p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.strictSsr}
                    onChange={(e) => setSettings({ ...settings, strictSsr: e.target.checked })}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-white/10 peer-checked:bg-cyan-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-white/5 bg-black/40 p-4 text-xs">
                <p className="text-fg-secondary">{t("enforce_https_only_and_block_internal_ip")}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                    HTTPS Only
                  </span>
                  <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                    No Private IPs (10/8, 127/8)
                  </span>
                </div>
              </div>
            </div>

            {/* Session & Auth Guard Widget */}
            <div className="from-bg-secondary via-bg-tertiary relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br to-purple-950/20 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-purple-400">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Session Security & Expiry</h3>
                    <p className="text-fg-muted text-xs">Admin JWT lifetime & cookie security</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-fg-muted mb-1 flex items-center justify-between text-xs">
                    <span>Admin Inactivity Timeout</span>
                    <span className="font-mono font-bold text-purple-300">
                      {settings.sessionTimeoutMins} minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={settings.sessionTimeoutMins}
                    onChange={(e) =>
                      setSettings({ ...settings, sessionTimeoutMins: Number(e.target.value) })
                    }
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-fg-secondary text-xs">CORS Domain Isolation</span>
                  <input
                    type="checkbox"
                    checked={settings.corsRestricted}
                    onChange={(e) => setSettings({ ...settings, corsRestricted: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-black/40 text-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Audit Auto-Ingestion Widget */}
            <div className="from-bg-secondary via-bg-tertiary relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br to-pink-950/20 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 text-pink-400">
                    <Radio className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Autonomous Incident Ingestion
                    </h3>
                    <p className="text-fg-muted text-xs">RSS, GitHub, and News connectors cron</p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoAuditIngestion}
                    onChange={(e) =>
                      setSettings({ ...settings, autoAuditIngestion: e.target.checked })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-white/10 peer-checked:bg-pink-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>

              <div className="text-fg-secondary mt-4 rounded-xl border border-white/5 bg-black/40 p-4 text-xs">
                Ingests public AI incidents into moderate queue every 24h via Vercel Cron.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PUBLIC API & GATEWAY */}
        {activeTab === "api" && (
          <div className="space-y-6">
            <div className="from-bg-secondary via-bg-tertiary to-bg-elevated relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400">
                    <Server className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t("public_read_only_incidents_api")}
                    </h3>
                    <p className="text-fg-muted text-xs">
                      /api/incidents/public JSON endpoint access
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.publicApiEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, publicApiEnabled: e.target.checked })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-white/10 peer-checked:bg-cyan-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <span className="text-fg-muted block text-[10px] font-bold tracking-wider uppercase">
                    API Version
                  </span>
                  <span className="mt-1 block font-mono text-sm font-bold text-cyan-300">
                    v1.1 (REST + JSON-LD)
                  </span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <span className="text-fg-muted block text-[10px] font-bold tracking-wider uppercase">
                    Max Payload Size
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white">
                      {settings.maxPayloadMb} MB
                    </span>
                    <input
                      type="number"
                      value={settings.maxPayloadMb}
                      onChange={(e) =>
                        setSettings({ ...settings, maxPayloadMb: Number(e.target.value) })
                      }
                      className="w-16 rounded border border-white/10 bg-black/60 px-2 py-0.5 text-right font-mono text-xs text-cyan-400"
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <span className="text-fg-muted block text-[10px] font-bold tracking-wider uppercase">
                    Gateway Providers
                  </span>
                  <span className="mt-1 block font-mono text-sm font-bold text-emerald-400">
                    9 Active Adapters
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RATE LIMITS & CEILINGS */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <div className="from-bg-secondary via-bg-tertiary relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br to-amber-950/20 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
                  <Sliders className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {t("rate_limiting_operational_ceilings")}
                  </h3>
                  <p className="text-fg-muted text-xs">
                    DDoS mitigation & Redis sliding window ceiling
                  </p>
                </div>
              </div>

              <div className="space-y-6 rounded-xl border border-white/10 bg-black/40 p-6">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <label className="font-bold text-white">
                      {t("global_rate_limit_requests_minute_ip")}
                    </label>
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-sm font-extrabold text-amber-400">
                      {settings.rateLimitRequestsPerMin} RPM / IP
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={settings.rateLimitRequestsPerMin}
                    onChange={(e) =>
                      setSettings({ ...settings, rateLimitRequestsPerMin: Number(e.target.value) })
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-amber-500"
                  />
                  <div className="text-fg-muted mt-1 flex justify-between font-mono text-[10px]">
                    <span>10 RPM (Strict)</span>
                    <span>60 RPM (Default)</span>
                    <span>300 RPM (High Capacity)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EMERGENCY & MAINTENANCE */}
        {activeTab === "emergency" && (
          <div className="space-y-6">
            <div className="border-danger-500/30 from-bg-secondary via-bg-tertiary to-danger-950/30 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="border-danger-500/40 bg-danger-500/20 text-danger-400 rounded-xl border p-3 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Maintenance Mode & System Circuit Breaker
                    </h3>
                    <p className="text-danger-300 text-xs">
                      High-stakes emergency kill switch for public app router
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({ ...settings, maintenanceMode: e.target.checked })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer peer-checked:bg-danger-500 h-6 w-11 rounded-full bg-white/10 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>

              <div className="border-danger-500/20 bg-danger-500/10 text-danger-200 mt-4 rounded-xl border p-4 text-xs">
                ⚠️ Enabling Maintenance Mode returns HTTP 503 Maintenance to all non-admin public
                traffic immediately.
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="bg-bg-secondary/90 flex items-center justify-between rounded-2xl border border-white/10 p-4 shadow-xl backdrop-blur-xl">
          <button
            type="submit"
            disabled={isSaving}
            className="from-brand-500 to-accent-500 shadow-brand-500/25 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-bold text-white shadow-lg transition duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving System Configuration..." : t("save_system_settings")}
          </button>

          {saved && (
            <span className="animate-in fade-in slide-in-from-bottom-2 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> {t("system_settings_updated_successfully")}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
