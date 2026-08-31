"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { submitFlaggingReport } from "@/actions/report-flagging";
import type { ReportFlaggingState } from "@/actions/report-flagging";

const DETECTORS = ["GPTZero", "Turnitin", "ZeroGPT", "Copyleaks", "Other"] as const;

const PLATFORMS = [
  { value: "school", labelKey: "platformSchool" as const },
  { value: "employer", labelKey: "platformEmployer" as const },
  { value: "court", labelKey: "platformCourt" as const },
  { value: "other", labelKey: "platformOther" as const },
] as const;

const initialState: ReportFlaggingState = { ok: false };

export default function ReportFlaggingForm() {
  const t = useTranslations("reportFlagging");
  const [state, formAction, isPending] = useActionState(submitFlaggingReport, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/40">
          <svg
            className="h-8 w-8 text-emerald-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">{t("successTitle")}</h2>
        <p className="text-fg-muted max-w-sm">{t("successMessage")}</p>
        <button
          className="border-border-subtle text-fg-primary mt-2 rounded-lg border bg-white/5 px-5 py-2 text-sm font-medium transition-all duration-200 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[hsl(260_80%_70%)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none"
          onClick={() => window.location.reload()}
          type="button"
        >
          {t("submitAnother")}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" ref={formRef}>
      <div className="flex flex-col gap-1.5">
        <label className="text-fg-primary text-sm font-medium" htmlFor="detector_name">
          {t("detectorLabel")}
          <span aria-hidden="true" className="ml-1 text-[hsl(260_80%_70%)]">
            *
          </span>
        </label>
        <select
          className="border-border-subtle w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white transition-all duration-200 outline-none focus:border-[hsl(260_80%_60%_/_0.6)] focus:ring-2 focus:ring-[hsl(260_80%_70%_/_0.25)] [&>option]:bg-[hsl(240_15%_12%)] [&>option]:text-white"
          id="detector_name"
          name="detector_name"
          required
        >
          <option value="">{t("selectDetector")}</option>
          {DETECTORS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-fg-primary text-sm font-medium" htmlFor="platform">
          {t("platformLabel")}
          <span aria-hidden="true" className="ml-1 text-[hsl(260_80%_70%)]">
            *
          </span>
        </label>
        <select
          className="border-border-subtle w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white transition-all duration-200 outline-none focus:border-[hsl(260_80%_60%_/_0.6)] focus:ring-2 focus:ring-[hsl(260_80%_70%_/_0.25)] [&>option]:bg-[hsl(240_15%_12%)] [&>option]:text-white"
          id="platform"
          name="platform"
          required
        >
          <option value="">{t("selectPlatform")}</option>
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {t(p.labelKey)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-fg-primary text-sm font-medium" htmlFor="context">
          {t("contextLabel")}
          <span aria-hidden="true" className="ml-1 text-[hsl(260_80%_70%)]">
            *
          </span>
        </label>
        <textarea
          className="border-border-subtle placeholder:text-fg-secondary min-h-[140px] w-full resize-y rounded-lg border bg-white/5 px-4 py-3 text-sm text-white transition-all duration-200 outline-none focus:border-[hsl(260_80%_60%_/_0.6)] focus:ring-2 focus:ring-[hsl(260_80%_70%_/_0.25)]"
          id="context"
          minLength={20}
          name="context"
          placeholder={t("contextPlaceholder")}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-fg-primary text-sm font-medium" htmlFor="evidence_url">
          {t("evidenceLabel")}
        </label>
        <input
          className="border-border-subtle placeholder:text-fg-secondary w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white transition-all duration-200 outline-none focus:border-[hsl(260_80%_60%_/_0.6)] focus:ring-2 focus:ring-[hsl(260_80%_70%_/_0.25)]"
          id="evidence_url"
          name="evidence_url"
          placeholder="https://..."
          type="url"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-fg-primary text-sm font-medium" htmlFor="email">
          {t("emailLabel")}
        </label>
        <input
          autoComplete="email"
          className="border-border-subtle placeholder:text-fg-secondary w-full rounded-lg border bg-white/5 px-4 py-2.5 text-sm text-white transition-all duration-200 outline-none focus:border-[hsl(260_80%_60%_/_0.6)] focus:ring-2 focus:ring-[hsl(260_80%_70%_/_0.25)]"
          id="email"
          name="email"
          placeholder="you@example.com"
          type="email"
        />
        <p className="text-fg-muted text-xs">{t("emailHint")}</p>
      </div>

      {state.error && (
        <p
          aria-live="polite"
          className="border-danger-500/20 rounded-lg border bg-red-500/10 px-4 py-3 text-sm text-red-400"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <button
        className="group relative mt-2 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[hsl(260_80%_55%)] to-[hsl(230_80%_55%)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[hsl(260_80%_50%_/_0.3)] transition-all duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[hsl(260_80%_70%)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        id="report-flagging-submit"
        type="submit"
      >
        {isPending ? (
          <>
            <svg
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                fill="currentColor"
              />
            </svg>
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </button>
    </form>
  );
}
