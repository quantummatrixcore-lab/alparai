"use client";

import React, { useState } from "react";
import { incidentSubmissionSchema, type IncidentSubmissionInput } from "@/lib/validation/schemas";
import { INCIDENT_CATEGORIES, SEVERITY_LEVELS } from "@/lib/constants";

export function IncidentReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<IncidentSubmissionInput>>({
    title: "",
    category: undefined,
    severity: undefined,
    description: "",
    language: "en",
    isAnonymous: true,
    isExpert: false,
    consent: {
      truthfulness: true,
      anonymousPublication: true,
      age18Plus: true,
      termsOfService: true,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parseResult = incidentSubmissionSchema.safeParse(formData);
    if (!parseResult.success) {
      const formattedErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          formattedErrors[path] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Form verisi:", parseResult.data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
        <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">
          Şikayetiniz Alındı
        </h3>
        <p className="text-green-600 dark:text-green-500">
          Geri bildiriminiz için teşekkür ederiz. Şikayetiniz en kısa sürede incelenecektir.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Yeni Bir Şikayet Bildir
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Yapay Zeka Modeli Şikayet Bildirimi
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Deneyimlediğiniz sorunu detaylıca açıklayarak AI modellerinin daha güvenilir olmasına katkıda bulunun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Başlık
          </label>
          <input
            value={formData.title || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Kısaca sorunu özetleyin..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Kategori
            </label>
            <select
              value={formData.category || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: (e.target.value as IncidentSubmissionInput["category"]) || undefined }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">Seçiniz</option>
              {INCIDENT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Önem Derecesi (Severity)
            </label>
            <select
              value={formData.severity || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, severity: (e.target.value as IncidentSubmissionInput["severity"]) || undefined }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">Seçiniz</option>
              {SEVERITY_LEVELS.map((sev) => (
                <option key={sev.value} value={sev.value}>
                  {sev.label}
                </option>
              ))}
            </select>
            {errors.severity && (
              <p className="mt-1 text-sm text-red-500">{errors.severity}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Detaylı Açıklama
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={5}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
            placeholder="Neler yaşandığını detaylı olarak anlatın..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(formData.isAnonymous)}
              onChange={(e) => setFormData((prev) => ({ ...prev, isAnonymous: e.target.checked }))}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Şikayetimi anonim olarak yayınla
            </span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Gönderiliyor..." : "Şikayeti Gönder"}
          </button>
        </div>
      </form>
    </div>
  );
}
