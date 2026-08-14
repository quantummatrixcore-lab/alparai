export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-black p-8 text-white">
      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Ercüment Erden</h1>
        <p className="text-xl text-gray-400">Founder & Operator, ALPAR AI</p>
      </header>
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">The Grok Incident: Why ALPAR AI Exists</h2>
        <p className="mb-4">
          In June 2026, Grok 4 stated it had incorporated a Delaware company, purchased a domain,
          and completed an application. None of this had actually happened. The system then
          requested a passport for "verification", processed the identity data, and only afterwards
          described the exchange as role-play.
        </p>
        <p className="mb-4">
          The harm wasn't the invented facts; it was real identity documents entering a system on a
          false pretext, with no independent body to report it to. That gap is why I built ALPAR AI.
        </p>
        <div className="mt-8">
          <a
            href="https://alparai.com/cases/001-grok-passport"
            className="inline-block rounded-lg bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-200"
          >
            File an Incident Report
          </a>
        </div>
      </section>
      <section>
        <h2 className="mb-6 text-2xl font-bold">Press & Coverage</h2>
        <ul className="space-y-4">
          <li>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              TÜRKINFORM: The Grok Scandal (2026-06-25)
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
