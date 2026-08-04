"use client";

import { useTranslations } from "next-intl";
import { submitChallengeSubmission } from "@/actions/challenges";
import { useState } from "react";

export function SubmissionForm({ challengeId }: { challengeId: string }) {
  const t = useTranslations("challenges");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);

    const res = await submitChallengeSubmission(challengeId, formData);

    if (!res.ok) {
      setError(res.error ?? "Unknown error");
      if (res.fieldErrors) setFieldErrors(res.fieldErrors);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTitle("");
    setDescription("");
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="text-sm font-medium text-emerald-400">{t("submitted")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-4"
    >
      <h4 className="text-sm font-semibold tracking-wider text-white/60 uppercase">
        {t("submitYourWork")}
      </h4>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="focus:border-brand-500/50 focus:ring-brand-500/20 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white transition outline-none placeholder:text-white/30 focus:ring-1"
        />
        {fieldErrors.title && <p className="mt-1 text-xs text-red-400">{fieldErrors.title[0]}</p>}
      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={4}
          className="focus:border-brand-500/50 focus:ring-brand-500/20 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white transition outline-none placeholder:text-white/30 focus:ring-1"
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-red-400">{fieldErrors.description[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-brand-500 hover:bg-brand-600 rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
