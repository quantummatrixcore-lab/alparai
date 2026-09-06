"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const COOKIE_KEY = "alpar_cookie_consent";

type ConsentLevels = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const ALL_CONSENT: ConsentLevels = { necessary: true, analytics: true, marketing: true };
const ESSENTIAL_CONSENT: ConsentLevels = { necessary: true, analytics: false, marketing: false };

export function CookieBanner() {
  const t = useTranslations("legal");
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<ConsentLevels>(ESSENTIAL_CONSENT);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  const save = useCallback(async (levels: ConsentLevels) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ consent: levels, at: Date.now() }));
    setVisible(false);
    if (levels.analytics) {
      try {
        await import("@/actions/cookie-consent").then((mod) => mod.logCookieConsent("analytics"));
      } catch (e) {
        console.error("Ignored error:", e);
      }
    }
  }, []);

  const acceptAll = useCallback(() => save(ALL_CONSENT), [save]);
  const acceptEssential = useCallback(() => save(ESSENTIAL_CONSENT), [save]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") acceptEssential();
    };
    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, acceptEssential]);

  if (!visible) return null;
  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="border-border-subtle bg-bg-elevated fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-xl rounded-xl border p-5 shadow-2xl sm:right-6 sm:bottom-6 sm:left-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-3 text-sm">
          <p className="text-fg-primary font-semibold">{t("cookieTitle")}</p>
          <p className="text-fg-muted">{t("cookieBody")}</p>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={consent.necessary}
                disabled
                className="border-border-subtle h-4 w-4 rounded"
              />
              <span>
                <span className="font-medium">{t("cookieNecessary")}</span>
                <span className="text-fg-muted ml-1 text-xs">{t("cookieNecessaryDesc")}</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={consent.analytics}
                onChange={(e) => setConsent((c) => ({ ...c, analytics: e.target.checked }))}
                className="border-border-subtle h-4 w-4 rounded"
              />
              <span>
                <span className="font-medium">{t("cookieAnalytics")}</span>
                <span className="text-fg-muted ml-1 text-xs">{t("cookieAnalyticsDesc")}</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={consent.marketing}
                onChange={(e) => setConsent((c) => ({ ...c, marketing: e.target.checked }))}
                className="border-border-subtle h-4 w-4 rounded"
              />
              <span>
                <span className="font-medium">{t("cookieMarketing")}</span>
                <span className="text-fg-muted ml-1 text-xs">{t("cookieMarketingDesc")}</span>
              </span>
            </label>
          </div>
          <p className="text-fg-muted text-xs">
            <Link href="/legal/privacy" className="text-brand-400 hover:underline">
              {t("cookieLearnMore")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button onClick={acceptAll} size="sm">
            {t("cookieAccept")}
          </Button>
          <Button onClick={acceptEssential} variant="outline" size="sm">
            {t("cookieEssential")}
          </Button>
        </div>
        <button
          onClick={acceptEssential}
          className="text-fg-muted hover:text-fg-primary"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
