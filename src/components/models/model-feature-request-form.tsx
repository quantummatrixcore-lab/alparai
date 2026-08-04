"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitModelFeatureRequest } from "@/actions/model-features";

interface ModelFeatureRequestFormProps {
  modelId: string;
  onSuccess?: () => void;
}

export function ModelFeatureRequestForm({ modelId, onSuccess }: ModelFeatureRequestFormProps) {
  const t = useTranslations("models");
  const [isPending, startTransition] = React.useTransition();
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const categories = [
    { value: "feature", label: t("feature_cat_feature") },
    { value: "safety", label: t("feature_cat_safety") },
    { value: "accuracy", label: t("feature_cat_accuracy") },
    { value: "ux", label: t("feature_cat_ux") },
    { value: "integration", label: t("feature_cat_integration") },
    { value: "other", label: t("feature_cat_other") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("modelId", modelId);
    formData.append("isAnonymous", String(isAnonymous));

    startTransition(async () => {
      const res = await submitModelFeatureRequest({ ok: false }, formData);
      if (res.ok) {
        toast.success(t("success_feature"));
        if (onSuccess) onSuccess();
      } else {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        }
        toast.error(res.error || t("error_feature_submit"));
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bg-secondary border-border-subtle mx-auto max-w-xl space-y-6 rounded-2xl border p-6 shadow-xl"
    >
      <h3 className="text-fg-primary border-border-subtle border-b pb-3 text-xl font-bold">
        {t("request_feature")}
      </h3>

      <div className="space-y-2">
        <label className="text-fg-secondary block text-sm font-medium">
          {t("feature_title")} <span className="text-danger-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder={t("placeholder_feature")}
          className="bg-bg-tertiary border-border-strong text-fg-primary focus:ring-brand-500/20 w-full rounded-xl border px-4 py-2 focus:ring-2 focus:outline-none"
        />
        {errors.title && <p className="text-danger-500 text-xs">{errors.title[0]}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-fg-secondary block text-sm font-medium">
          {t("feature_category")}
        </label>
        <select
          name="category"
          className="bg-bg-tertiary border-border-strong text-fg-primary focus:ring-brand-500/20 w-full rounded-xl border px-4 py-2 focus:ring-2 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-danger-500 text-xs">{errors.category[0]}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-fg-secondary block text-sm font-medium">
          {t("feature_description")}
        </label>
        <textarea
          name="description"
          rows={5}
          className="bg-bg-tertiary border-border-strong text-fg-primary focus:ring-brand-500/20 w-full resize-none rounded-xl border px-4 py-2 focus:ring-2 focus:outline-none"
        />
        {errors.description && <p className="text-danger-500 text-xs">{errors.description[0]}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isAnonymousFeature"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="text-brand-500 bg-bg-tertiary border-border-strong focus:ring-brand-500/20 h-4 w-4 rounded"
        />
        <label htmlFor="isAnonymousFeature" className="text-fg-secondary cursor-pointer text-sm">
          {t("post_anonymously")}
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-brand-500 hover:bg-brand-600 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white transition duration-200 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("submitting")}</span>
          </>
        ) : (
          <span>{t("submit_feature")}</span>
        )}
      </button>
    </form>
  );
}
