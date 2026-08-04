"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
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
      setError(err instanceof Error ? err.message : "Bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-white">
          <h1 className="mb-2 text-2xl font-bold">E-posta Gönderildi</h1>
          <p className="text-sm text-slate-400">
            Şifre sıfırlama bağlantısı{" "}
            <span className="font-semibold text-purple-400">{email}</span> adresine gönderildi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-8"
      >
        <h1 className="text-2xl font-bold text-white">Şifremi Unuttum</h1>
        <p className="text-sm text-slate-400">
          Kayıtlı e-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div>
          <label htmlFor="email-input" className="mb-1 block text-xs text-slate-400">
            E-posta Adresi
          </label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@alparai.com"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
        </button>
      </form>
    </div>
  );
}
