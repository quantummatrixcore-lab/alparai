import { getLessonList } from "@/lib/academy/lessons";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-static";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Mini-Okul: 10 dakikalık ücretsiz dersler → Etik Kullanıcı Katılım Belgesi + %15 kupon.
export default async function AcademySchoolPage({ params }: PageProps) {
  const { locale } = await params;
  const loc = locale === "en" ? "en" : "tr";
  const lessons = getLessonList(loc);
  const isTr = loc === "tr";

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="font-sans text-xs font-bold tracking-widest text-cyan-600">
        {isTr ? "ALPARAI MİNİ-OKUL • ÜCRETSİZ" : "ALPARAI MINI-SCHOOL • FREE"}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {isTr ? "10 Dakikada Güvenli Yapay Zekâ" : "Safe AI in 10 Minutes"}
      </h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {isTr
          ? "Her ders 10 dakika. Testi geç, Etik Kullanıcı Katılım Belgeni al, ilk aboneliğinde %15 indirim kazan. Belge katılıma verilir; diploma değildir."
          : "Each lesson takes 10 minutes. Pass the quiz, earn your Ethical User Certificate, and get 15% off your first subscription. A participation certificate — not a diploma."}
      </p>

      <div className="mt-8 space-y-4">
        {lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/${loc}/academy/okul/${l.slug}`}
            className="block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-cyan-500/50 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-600 font-sans text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-sans text-base font-bold">{l.title}</h2>
                <p className="truncate text-xs text-zinc-500">{l.summary}</p>
              </div>
              <span className="ml-auto shrink-0 font-sans text-xs text-zinc-500">
                ~{l.minutes} {isTr ? "dk" : "min"} • {l.questionCount} {isTr ? "soru" : "quiz"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
