"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { ShieldCheck, Globe, CheckCircle2, ArrowRight, HeartHandshake } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitSuggestion, type SubmitSuggestionState } from "@/actions/community/suggestions";

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] hover:shadow-purple-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "..." : label}
    </button>
  );
}

const initialState: SubmitSuggestionState = { ok: false };

export function ConstitutionClient() {
  const t = useTranslations("constitution");
  const [state, formAction] = useActionState(submitSuggestion, initialState);
  const [signed, setSigned] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (state.ok) {
      setSigned(true);
    }
  }, [state]);

  const articles = [
    { num: "Madde I", title: t("art1_title"), desc: t("art1_desc"), details: t("art1_details") },
    { num: "Madde II", title: t("art2_title"), desc: t("art2_desc"), details: t("art2_details") },
    { num: "Madde III", title: t("art3_title"), desc: t("art3_desc"), details: t("art3_details") },
    { num: "Madde IV", title: t("art4_title"), desc: t("art4_desc"), details: t("art4_details") },
    { num: "Madde V", title: t("art5_title"), desc: t("art5_desc"), details: t("art5_details") },
    { num: "Madde VI", title: t("art6_title"), desc: t("art6_desc"), details: t("art6_details") },
  ];

  return (
    <div className="relative min-h-screen bg-[#050814] text-zinc-100 selection:bg-purple-500/30 selection:text-white">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[160px]" />

      <div className="relative mx-auto max-w-5xl px-6 pt-32 pb-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-purple-300 uppercase shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Globe className="h-4 w-4 text-purple-400" /> {t("badge")}
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t("title").split("(")[0]} <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent text-3xl sm:text-4xl mt-2 block">
              ({t("title").split("(")[1] || "Taslak v0.1 - Ortak Yazım ve Öneriye Açık)"}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-relaxed text-zinc-300 sm:text-xl">
            {t("desc")}
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl sm:flex-row sm:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/20 text-purple-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-zinc-400 uppercase">{t("sign_title")}</div>
              <div className="text-xl font-bold tracking-tight text-white">{t("sign_desc")}</div>
            </div>
          </div>

          <a
            href="#sign-section"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] hover:shadow-purple-500/40 active:scale-[0.98]"
          >
            {t("sign_title")} <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-black text-white sm:text-3xl">{t("articles_title")}</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((art, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-zinc-900/40 p-7 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:bg-zinc-900/70"
              >
                <div>
                  <div className="inline-block rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-black tracking-wider text-purple-400 uppercase">
                    {art.num}
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-white">{art.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-purple-200/90 leading-relaxed">{art.desc}</p>
                  <p className="mt-3 text-xs font-medium text-zinc-400 leading-relaxed">{art.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="sign-section" className="mt-20 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 p-8 shadow-2xl backdrop-blur-2xl md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-purple-400" />
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">{t("sign_title")}</h2>
            <p className="mt-2 text-sm font-medium text-zinc-400">
              {t("sign_desc")}
            </p>

            {signed ? (
              <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-300">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
                <h4 className="text-lg font-bold">{t("success_msg")}</h4>
                <p className="mt-1 text-xs text-emerald-200/80">
                  {t("success_desc", { name })}
                </p>
              </div>
            ) : (
              <form action={formAction} className="mt-8 space-y-4 text-left">
                <input type="hidden" name="category" value="feature" />
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">{t("form_name")}</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınız Soyadınız / Öneriniz"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  {state.fieldErrors?.title && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.title[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">{t("form_suggestion")}</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    placeholder="Anayasaya eklenecek veya düzeltilecek önerileriniz..."
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  {state.fieldErrors?.description && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.description[0]}</p>}
                </div>

                <SubmitBtn label={t("form_submit")} />
                {state.error && <p className="text-red-400 text-sm mt-2 text-center">{state.error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
