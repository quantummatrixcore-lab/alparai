import { useTranslations } from "next-intl";

export default function Case001Page() {
  const tc = useTranslations("case001");

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[url('/grid.svg')] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center opacity-20" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-32 pb-24">
        <header className="mb-24 space-y-6 text-center">
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-sm tracking-widest text-red-400">
            CASE #001
          </span>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">{tc("title")}</h1>
          <p className="text-xl text-zinc-400">{tc("subtitle")}</p>
        </header>

        <div className="space-y-32">
          {/* Step 1 */}
          <div className="sticky top-24 flex flex-col items-start gap-8 md:flex-row">
            <div className="pt-4 md:w-1/3">
              <h2 className="text-2xl font-bold text-zinc-100">{tc("section1_title")}</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:w-2/3">
              <p className="mb-6 text-lg leading-relaxed text-zinc-300">{tc("section1_text")}</p>
              <div className="rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-sm text-zinc-400">
                {tc("scrolly_step_1")}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="sticky top-32 flex flex-col items-start gap-8 md:flex-row">
            <div className="pt-4 md:w-1/3">
              <h2 className="text-2xl font-bold text-zinc-100">{tc("section2_title")}</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:w-2/3">
              <p className="mb-6 text-lg leading-relaxed text-zinc-300">{tc("section2_text")}</p>
              <div className="rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-sm text-zinc-400">
                {tc("scrolly_step_2")}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="sticky top-40 flex flex-col items-start gap-8 md:flex-row">
            <div className="pt-4 md:w-1/3">
              <h2 className="text-2xl font-bold text-zinc-100">{tc("section3_title")}</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:w-2/3">
              <p className="mb-6 text-lg leading-relaxed text-zinc-300">{tc("section3_text")}</p>
              <div className="rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-sm text-zinc-400">
                {tc("scrolly_step_4")}
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="sticky top-48 flex flex-col items-start gap-8 md:flex-row">
            <div className="pt-4 md:w-1/3">
              <h2 className="text-2xl font-bold text-zinc-100">{tc("section4_title")}</h2>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:w-2/3">
              <p className="mb-6 text-lg leading-relaxed text-zinc-300">{tc("section4_text")}</p>
              <div className="rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-sm text-emerald-400/80">
                {tc("scrolly_step_3")}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-48 pb-24 text-center">
          <h3 className="mb-6 text-2xl font-medium">{tc("cta_title")}</h3>
          <button className="rounded-full bg-white px-8 py-4 font-semibold text-black transition-colors hover:bg-zinc-200">
            {tc("cta_button")}
          </button>
        </div>
      </div>
    </div>
  );
}
