import { ArrowRight, Globe2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Invest in ALPAR AI | The Trust Infrastructure for AI",
  description:
    "Join ALPAR AI in building the accountability layer and public trust infrastructure for the artificial intelligence era. Invest in the Stripe for AI Safety.",
};

export default function InvestPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-zinc-900/50 to-black" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mb-8 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-300">
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
            Pre-Seed Round Open
          </div>
          <h1 className="mb-8 text-5xl font-bold tracking-tight md:text-7xl">
            The Accountability Layer
            <br />
            <span className="text-zinc-500">for the AI Era.</span>
          </h1>
          <p className="mb-10 max-w-2xl text-xl leading-relaxed text-zinc-400">
            As AI integrates into every sector, the lack of accountability creates a massive trust
            deficit. ALPAR AI is building the Stripe for AI Safety — a permanent, community-governed
            ledger for AI failures.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="mailto:invest@alparai.com"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Request Pitch Deck
            </a>
            <Link
              href="/en/about"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-800 bg-transparent px-8 py-4 text-base font-medium text-white transition-colors hover:bg-zinc-900"
            >
              Read our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-t border-zinc-900 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold">$50B</div>
              <div className="text-sm text-zinc-500">TAM by 2030 (AI Safety Market)</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">14+</div>
              <div className="text-sm text-zinc-500">Providers Tracked</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">142+</div>
              <div className="text-sm text-zinc-500">Documented Incidents</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">AGPL</div>
              <div className="text-sm text-zinc-500">Open Source Core</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="bg-zinc-950 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-16 text-3xl font-bold md:text-5xl">Why Now?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <Globe2 className="mb-6 h-10 w-10 text-zinc-400" />
              <h3 className="mb-4 text-xl font-semibold">EU AI Act Tailwind</h3>
              <p className="text-zinc-400">
                Strict regulations are forcing companies to audit and report AI failures. ALPAR AI
                provides the infrastructure for compliance.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <Zap className="mb-6 h-10 w-10 text-zinc-400" />
              <h3 className="mb-4 text-xl font-semibold">Enterprise Demand</h3>
              <p className="text-zinc-400">
                Enterprises hesitate to deploy AI due to liability risks. A verifiable track record
                of model safety is becoming a necessity.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <ShieldCheck className="mb-6 h-10 w-10 text-zinc-400" />
              <h3 className="mb-4 text-xl font-semibold">Data Moat</h3>
              <p className="text-zinc-400">
                By becoming the de facto standard for reporting, we build an unparalleled dataset of
                AI failure modes that insurance and enterprise need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-zinc-900 px-4 py-32 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-3xl font-bold md:text-5xl">Join the Pre-Seed Round</h2>
          <p className="mb-10 text-xl text-zinc-400">
            We are raising a $500K pre-seed round to accelerate engineering, launch API v2, and
            secure early enterprise pilots.
          </p>
          <a
            href="mailto:invest@alparai.com"
            className="inline-flex items-center justify-center rounded-full bg-white px-10 py-5 text-lg font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Contact Founder
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
