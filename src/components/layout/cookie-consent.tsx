"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Cookie, ShieldCheck, X, ChevronDown, ChevronUp, Check } from "lucide-react";

const CONSENT_STORAGE_KEY = "alpar_cookie_consent_v1";
const LEGACY_STORAGE_KEY = "alpar_cookie_consent";

interface ConsentSettings {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

export function CookieConsent() {
  const locale = useLocale();
  const isTr = locale === "tr";

  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!stored) {
        // Small delay so SSR hydrates smoothly and banner animates in
        const timer = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors (e.g. private browsing restrictions)
    }
  }, []);

  const saveConsent = (settings: ConsentSettings) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(settings));
      localStorage.setItem(
        LEGACY_STORAGE_KEY,
        JSON.stringify({
          consent: { necessary: true, analytics: settings.analytics, marketing: false },
          at: Date.now(),
        })
      );
      window.dispatchEvent(
        new CustomEvent("alpar_cookie_consent_updated", { detail: settings })
      );
    } catch {
      // Ignore write errors
    }
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    saveConsent({
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSavePreferences = () => {
    saveConsent({
      essential: true,
      analytics: analyticsAllowed,
      timestamp: new Date().toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label={isTr ? "Çerez ve Gizlilik Bildirimi" : "Cookie and Privacy Notice"}
      role="region"
      className="fixed bottom-4 right-4 left-4 z-[9999] mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-500 md:left-auto md:w-full"
    >
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-bg-secondary/95 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-6">
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand-500/10 blur-[60px]" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/10 text-brand-400">
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-fg-primary flex items-center gap-2">
                  <span>{isTr ? "KVKK & GDPR Çerez Tercihleri" : "KVKK & GDPR Cookie Preferences"}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{isTr ? "Uyumlu" : "Compliant"}</span>
                  </span>
                </h4>
                <p className="text-xs text-fg-muted mt-0.5">
                  {isTr
                    ? "6698 sayılı KVKK ve AB GDPR standartları uyarınca egemen gizlilik güvencesi."
                    : "Sovereign data governance under EU GDPR and KVKK Law No. 6698 standards."}
                </p>
              </div>
            </div>

            <button
              onClick={handleEssentialOnly}
              className="rounded-lg p-1 text-fg-muted hover:bg-bg-tertiary hover:text-fg-primary transition"
              aria-label={isTr ? "Kapat ve sadece zorunluları kabul et" : "Close and accept essential only"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-fg-secondary">
            {isTr ? (
              <>
                Platformumuzda güvenliği sağlamak, oturum bütünlüğünü korumak ve yapay zeka denetim
                hizmetlerimizi optimize etmek amacıyla çerezler kullanılmaktadır. Detaylı bilgi için{" "}
                <Link
                  href="/legal/cookies"
                  className="font-semibold text-brand-400 underline decoration-brand-500/40 hover:decoration-brand-400 transition"
                >
                  Çerez Politikası
                </Link>
                ,{" "}
                <Link
                  href="/legal/kvkk"
                  className="font-semibold text-brand-400 underline decoration-brand-500/40 hover:decoration-brand-400 transition"
                >
                  KVKK Aydınlatma Metni
                </Link>{" "}
                ve{" "}
                <Link
                  href="/legal/privacy"
                  className="font-semibold text-brand-400 underline decoration-brand-500/40 hover:decoration-brand-400 transition"
                >
                  Gizlilik Sözleşmesi
                </Link>
                'ni inceleyebilirsiniz.
              </>
            ) : (
              <>
                We use strictly necessary and performance cookies to secure transactions, maintain
                session integrity, and optimize our sovereign AI compliance services. Read our{" "}
                <Link
                  href="/legal/cookies"
                  className="font-semibold text-brand-400 underline decoration-brand-500/40 hover:decoration-brand-400 transition"
                >
                  Cookie Policy
                </Link>
                ,{" "}
                <Link
                  href="/legal/kvkk"
                  className="font-semibold text-brand-400 underline decoration-brand-500/40 hover:decoration-brand-400 transition"
                >
                  KVKK Notice
                </Link>
                , and{" "}
                <Link
                  href="/legal/privacy"
                  className="font-semibold text-brand-400 underline decoration-brand-500/40 hover:decoration-brand-400 transition"
                >
                  Privacy Policy
                </Link>
                .
              </>
            )}
          </p>

          {/* Preferences Accordion */}
          {showPreferences && (
            <div className="space-y-3 rounded-xl border border-border-subtle bg-bg-tertiary/50 p-4 text-xs">
              <div className="flex items-center justify-between border-b border-border-subtle/60 pb-3">
                <div className="space-y-0.5 pr-4">
                  <div className="font-semibold text-fg-primary flex items-center gap-1.5">
                    <span>{isTr ? "Zorunlu Çerezler" : "Strictly Necessary"}</span>
                    <span className="text-[10px] text-brand-400 font-mono">({isTr ? "Her Zaman Aktif" : "Always Active"})</span>
                  </div>
                  <p className="text-[11px] text-fg-muted">
                    {isTr
                      ? "Oturum yönetimi, CSRF güvenliği ve temel altyapı işlevleri için gereklidir."
                      : "Required for secure authentication, CSRF defense, and core platform operations."}
                  </p>
                </div>
                <div className="flex h-5 w-5 items-center justify-center rounded bg-brand-500/20 text-brand-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5 pr-4">
                  <div className="font-semibold text-fg-primary">
                    {isTr ? "Anonim Performans & Analitik" : "Anonymous Performance & Analytics"}
                  </div>
                  <p className="text-[11px] text-fg-muted">
                    {isTr
                      ? "Kişisel kimlik verisi toplamadan sistem gecikmesini ve platform performansını ölçer."
                      : "Aggregates non-PII performance metrics to enhance system responsiveness."}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={analyticsAllowed}
                    onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                  />
                  <div className="h-5 w-9 rounded-full bg-bg-secondary peer-checked:bg-brand-500 transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <button
              onClick={() => setShowPreferences((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-fg-muted hover:text-fg-primary transition"
            >
              <span>{isTr ? "Çerezleri Özelleştir" : "Customize"}</span>
              {showPreferences ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {showPreferences ? (
                <button
                  onClick={handleSavePreferences}
                  className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs font-bold text-brand-300 transition hover:bg-brand-500/20 active:scale-98"
                >
                  {isTr ? "Tercihlerimi Kaydet" : "Save Preferences"}
                </button>
              ) : (
                <button
                  onClick={handleEssentialOnly}
                  className="rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-2 text-xs font-semibold text-fg-secondary transition hover:bg-bg-tertiary/80 hover:text-fg-primary active:scale-98"
                >
                  {isTr ? "Sadece Gerekli" : "Essential Only"}
                </button>
              )}

              <button
                onClick={handleAcceptAll}
                className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition hover:from-brand-500 hover:to-brand-400 active:scale-98"
              >
                {isTr ? "Tümünü Kabul Et" : "Accept All"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
