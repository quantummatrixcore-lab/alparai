"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitModelReview } from "@/actions/model-reviews";

interface ModelRatingFormProps {
  modelId: string;
  onSuccess?: () => void;
}

export function ModelRatingForm({ modelId, onSuccess }: ModelRatingFormProps) {
  const t = useTranslations("models");
  const [isPending, startTransition] = React.useTransition();

  const [ratings, setRatings] = React.useState({
    scoreOverall: 0,
    scoreAccuracy: 0,
    scoreSafety: 0,
    scoreCreativity: 0,
    scoreSpeed: 0,
    scoreValue: 0,
  });

  const [hovered, setHovered] = React.useState({
    scoreOverall: 0,
    scoreAccuracy: 0,
    scoreSafety: 0,
    scoreCreativity: 0,
    scoreSpeed: 0,
    scoreValue: 0,
  });

  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const dimensions = [
    { key: "scoreOverall", label: t("overall_rating"), required: true },
    { key: "scoreAccuracy", label: t("accuracy_rating"), required: false },
    { key: "scoreSafety", label: t("safety_rating"), required: false },
    { key: "scoreCreativity", label: t("creativity_rating"), required: false },
    { key: "scoreSpeed", label: t("speed_rating"), required: false },
    { key: "scoreValue", label: t("value_rating"), required: false },
  ] as const;

  const setRating = (key: keyof typeof ratings, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  };

  const setHover = (key: keyof typeof hovered, val: number) => {
    setHovered((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ratings.scoreOverall === 0) {
      toast.error(t("error_overall"));
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("modelId", modelId);
    formData.append("scoreOverall", String(ratings.scoreOverall));
    if (ratings.scoreAccuracy) formData.append("scoreAccuracy", String(ratings.scoreAccuracy));
    if (ratings.scoreSafety) formData.append("scoreSafety", String(ratings.scoreSafety));
    if (ratings.scoreCreativity)
      formData.append("scoreCreativity", String(ratings.scoreCreativity));
    if (ratings.scoreSpeed) formData.append("scoreSpeed", String(ratings.scoreSpeed));
    if (ratings.scoreValue) formData.append("scoreValue", String(ratings.scoreValue));
    formData.append("isAnonymous", String(isAnonymous));

    startTransition(async () => {
      const res = await submitModelReview({ ok: false }, formData);
      if (res.ok) {
        toast.success(t("success_review"));
        if (onSuccess) onSuccess();
      } else {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        }
        toast.error(res.error || t("error_submit"));
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-bg-secondary border-border-subtle mx-auto max-w-xl space-y-6 rounded-2xl border p-6 shadow-xl"
    >
      <h3 className="text-fg-primary border-border-subtle border-b pb-3 text-xl font-bold">
        {t("write_review")}
      </h3>

      <div className="space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.key} className="flex items-center justify-between py-1">
            <span className="text-fg-secondary text-sm font-medium">
              {dim.label} {dim.required && <span className="text-danger-500">*</span>}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const currentRating = ratings[dim.key];
                const currentHover = hovered[dim.key];
                const active = currentHover ? star <= currentHover : star <= currentRating;
                return (
                  <button
                    type="button"
                    key={star}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    onClick={() => setRating(dim.key, star)}
                    onMouseEnter={() => setHover(dim.key, star)}
                    onMouseLeave={() => setHover(dim.key, 0)}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors duration-200 ${
                        active
                          ? "fill-brand-400 text-brand-400"
                          : "text-border-strong hover:text-brand-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-fg-secondary block text-sm font-medium">{t("review_title")}</label>
        <input
          type="text"
          name="title"
          className="bg-bg-tertiary border-border-strong text-fg-primary focus:ring-brand-500/20 w-full rounded-xl border px-4 py-2 focus:ring-2 focus:outline-none"
        />
        {errors.title && <p className="text-danger-500 text-xs">{errors.title[0]}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-fg-secondary block text-sm font-medium">{t("review_body")}</label>
        <textarea
          name="body"
          rows={4}
          className="bg-bg-tertiary border-border-strong text-fg-primary focus:ring-brand-500/20 w-full resize-none rounded-xl border px-4 py-2 focus:ring-2 focus:outline-none"
        />
        {errors.body && <p className="text-danger-500 text-xs">{errors.body[0]}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isAnonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="text-brand-500 bg-bg-tertiary border-border-strong focus:ring-brand-500/20 h-4 w-4 rounded"
        />
        <label htmlFor="isAnonymous" className="text-fg-secondary cursor-pointer text-sm">
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
          <span>{t("submit_review")}</span>
        )}
      </button>
    </form>
  );
}
