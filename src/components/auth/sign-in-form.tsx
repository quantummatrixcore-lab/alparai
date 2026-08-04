"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { GoogleSignInButton, EmailMagicLinkForm } from "./auth-buttons";
import { CheckCircle2, Shield, Lock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function SignInForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  // Default to true for seamless 1-click UX, visible & toggleable right at the top
  const [agreed, setAgreed] = React.useState(true);

  return (
    <div className="space-y-6">
      {/* 1. Legal & Consent Checkbox — Positioned FIRST at the top for zero-scroll 1-click auth */}
      <label
        htmlFor="auth-consent"
        className={cn(
          "group flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-300 select-none",
          agreed
            ? "border-brand-500/30 bg-brand-500/[0.04] shadow-[0_0_15px_rgba(168,85,247,0.08)]"
            : "border-amber-500/40 bg-amber-500/[0.03]",
        )}
      >
        <input
          id="auth-consent"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="text-brand-500 focus:ring-brand-500 focus:ring-offset-bg-primary mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-transparent transition-colors focus:ring-2 focus:ring-offset-1"
          aria-describedby="auth-consent-text"
        />
        <span id="auth-consent-text" className="text-fg-muted text-xs leading-relaxed">
          {t("consent_prefix")}{" "}
          <Link
            href="/legal/terms"
            className="text-brand-400 font-semibold hover:underline"
            target="_blank"
          >
            {t("terms_service")}
          </Link>{" "}
          {t("consent_and")}{" "}
          <Link
            href="/legal/privacy"
            className="text-brand-400 font-semibold hover:underline"
            target="_blank"
          >
            {t("terms_privacy")}
          </Link>
        </span>
      </label>

      {/* 2. Primary: Google Sign In (Immediate 1-click action) */}
      <div className="space-y-2">
        <GoogleSignInButton next={`/${locale}/profile`} className="w-full" disabled={!agreed} />
      </div>

      {/* 3. Divider with label */}
      <div className="relative py-1" role="separator" aria-orientation="horizontal">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center">
          <span className="text-fg-muted bg-[#0B0F1C] px-3.5 text-[10px] font-extrabold tracking-[0.2em] text-zinc-400 uppercase">
            {t("or_continue_email")}
          </span>
        </div>
      </div>

      {/* 4. Secondary: Email Magic Link */}
      <EmailMagicLinkForm disabled={!agreed} />

      {/* 5. DORA Elite Trust Signals */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 text-[11px]">
        <div className="flex flex-col items-center justify-center text-center">
          <Shield className="mb-1 h-4 w-4 text-emerald-400" />
          <span className="font-medium text-zinc-300">{t("benefit_secure")}</span>
        </div>
        <div className="flex flex-col items-center justify-center border-x border-white/[0.06] px-1 text-center">
          <Lock className="text-brand-400 mb-1 h-4 w-4" />
          <span className="font-medium text-zinc-300">{t("benefit_no_password")}</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="mb-1 h-4 w-4 text-sky-400" />
          <span className="font-medium text-zinc-300">{t("benefit_no_sell")}</span>
        </div>
      </div>
    </div>
  );
}
