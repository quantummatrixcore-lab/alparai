"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (resetErr) {
        setError(resetErr.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="border-border-subtle bg-bg-elevated w-full max-w-md rounded-2xl border p-8 text-center text-white">
          <h1 className="text-2xl mb-2 font-bold">{t("email_sent_title")}</h1>
          <p className="text-fg-muted text-sm">{t("email_sent_desc", { email })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="border-border-subtle bg-bg-elevated w-full max-w-md space-y-4 rounded-2xl border p-8"
      >
        <h1 className="text-2xl font-bold text-white">{t("forgot_password_title")}</h1>
        <p className="text-fg-muted text-sm">{t("forgot_password_subtitle")}</p>
        {error && <p className="text-danger-400 text-sm">{error}</p>}
        <div>
          <label htmlFor="email-input" className="text-fg-muted mb-1 block text-xs">
            {t("email_label")}
          </label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email_placeholder")}
            required
            className="border-border-strong focus:border-brand-500 bg-bg-secondary w-full rounded-lg border px-4 py-3 text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 w-full rounded-lg py-3 font-semibold text-white transition-colors disabled:opacity-50"
        >
          {loading ? t("sending") : t("send_link")}
        </button>
      </form>
    </div>
  );
}
