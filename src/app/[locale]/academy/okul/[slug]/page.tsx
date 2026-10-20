"use client";

import { use, useEffect, useState } from "react";

interface Question {
  index: number;
  q: string;
  choices: string[];
}

interface LessonDetail {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  sections: Array<{ heading: string; text: string }>;
  questions: Question[];
}

interface CompleteResult {
  passed: boolean;
  score: number;
  cert_code?: string;
  coupon?: { code: string; percent: number; used: boolean; expires_at: string } | null;
  repeated?: boolean;
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = use(params);
  const isTr = locale !== "en";
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/academy/lessons/${slug}?locale=${isTr ? "tr" : "en"}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then((j) => setLesson(j.data as LessonDetail))
      .catch(() => setError(isTr ? "Ders yüklenemedi." : "Lesson failed to load."));
  }, [slug, isTr]);

  async function submit() {
    if (!email.includes("@")) {
      setError(isTr ? "Geçerli bir e-posta yazın." : "Enter a valid email.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/academy/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          slug,
          locale: isTr ? "tr" : "en",
          answers: lesson?.questions.map((q) => answers[q.index] ?? -1) ?? [],
        }),
      });
      const j = (await res.json()) as { data?: CompleteResult; error?: string };
      if (!res.ok || !j.data) throw new Error(j.error ?? "submit");
      setResult(j.data);
    } catch {
      setError(isTr ? "Gönderilemedi, tekrar deneyin." : "Submit failed, retry.");
    } finally {
      setSending(false);
    }
  }

  if (error && !lesson) return <main className="mx-auto max-w-2xl px-4 py-12">{error}</main>;
  if (!lesson) return <main className="mx-auto max-w-2xl px-4 py-12">…</main>;

  if (result?.passed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border-2 border-emerald-500/60 bg-emerald-50 p-8 text-center dark:bg-emerald-950/30">
          <p className="font-sans text-xs font-bold tracking-widest text-emerald-700 dark:text-emerald-300">
            {isTr ? "ETİK KULLANICI KATILIM BELGESİ" : "ETHICAL USER CERTIFICATE"}
          </p>
          <h1 className="mt-2 text-2xl font-bold">{lesson.title}</h1>
          <p className="mt-1 text-sm opacity-80">
            {isTr ? `Skor: %${result.score}` : `Score: ${result.score}%`} • {email}
          </p>
          <p className="mt-4 font-mono text-lg font-bold tracking-wider">{result.cert_code}</p>
          <p className="mt-1 text-[11px] opacity-70">
            {isTr
              ? "Katılım belgesidir; akredite diploma değildir."
              : "A participation certificate; not an accredited diploma."}
          </p>
          {result.coupon && !result.coupon.used ? (
            <div className="mt-6 rounded-xl bg-white p-4 dark:bg-black/30">
              <p className="font-sans text-sm font-bold">
                %{result.coupon.percent} {isTr ? "indirim kuponun" : "discount coupon"}
              </p>
              <p className="mt-1 font-mono text-xl font-bold tracking-widest text-cyan-700 dark:text-cyan-300">
                {result.coupon.code}
              </p>
              <p className="mt-1 text-[11px] opacity-70">
                {isTr
                  ? "Tek kullanımlık • ilk abonelikte geçerli"
                  : "Single use • valid on first subscription"}
              </p>
            </div>
          ) : null}
          {result.repeated ? (
            <p className="mt-3 text-xs opacity-70">
              {isTr
                ? "Bu dersi daha önce bitirmiştin — mevcut belgen gösteriliyor."
                : "Already completed — showing your existing certificate."}
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="font-sans text-xs font-bold tracking-widest text-cyan-600">
        {isTr ? `DERS • ~${lesson.minutes} DK` : `LESSON • ~${lesson.minutes} MIN`}
      </p>
      <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
      <p className="mt-2 text-sm opacity-80">{lesson.summary}</p>

      {lesson.sections.map((s, i) => (
        <section key={i} className="mt-6">
          <h2 className="font-sans text-lg font-bold">{s.heading}</h2>
          <p className="mt-1 text-sm leading-relaxed opacity-90">{s.text}</p>
        </section>
      ))}

      <h2 className="mt-10 font-sans text-lg font-bold">
        {isTr ? "Mini sınav (%70 geçme)" : "Mini quiz (70% to pass)"}
      </h2>
      {lesson.questions.map((q) => (
        <fieldset
          key={q.index}
          className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-white/10"
        >
          <legend className="px-1 font-sans text-sm font-bold">{q.q}</legend>
          {q.choices.map((c, ci) => (
            <label key={ci} className="mt-1 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name={`q-${q.index}`}
                checked={answers[q.index] === ci}
                onChange={() => setAnswers((a) => ({ ...a, [q.index]: ci }))}
              />
              {c}
            </label>
          ))}
        </fieldset>
      ))}

      <div className="mt-6">
        <label className="font-sans text-sm font-bold" htmlFor="okul-email">
          {isTr
            ? "E-posta (belge ve kupon buraya bağlanır)"
            : "Email (certificate + coupon bind here)"}
        </label>
        <input
          id="okul-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@eposta.com"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-white/20 dark:bg-black/30"
        />
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {result && !result.passed ? (
        <p className="mt-3 text-sm text-amber-700">
          {isTr
            ? `Skor %${result.score} — baraj %70. Dersleri tekrar okuyup yeniden dene.`
            : `Score ${result.score}% — bar is 70%. Re-read and retry.`}
        </p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={sending}
        className="mt-6 w-full rounded-xl bg-cyan-600 px-4 py-3 font-sans text-sm font-bold text-white disabled:opacity-50"
      >
        {sending ? "…" : isTr ? "Sınavı Bitir + Belgemi Al" : "Finish Quiz + Get Certificate"}
      </button>
    </main>
  );
}
