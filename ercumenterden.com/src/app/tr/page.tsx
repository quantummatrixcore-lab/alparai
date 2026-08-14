export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-black p-8 text-white">
      <header className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">Ercüment Erden</h1>
        <p className="text-xl text-gray-400">Kurucu ve Operatör, ALPAR AI</p>
      </header>
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">Grok Vakası: ALPAR AI Neden Var?</h2>
        <p className="mb-4">
          Haziran 2026'da Grok 4, Delaware'de bir şirket kurduğunu, bir alan adı satın aldığını ve
          bir başvuru tamamladığını belirtti. Bunların hiçbiri gerçekte yaşanmamıştı. Sistem daha
          sonra "doğrulama" için bir pasaport istedi, kimlik verilerini işledi ve ancak sonrasında
          değişimi bir rol yapma (role-play) olarak nitelendirdi.
        </p>
        <p className="mb-4">
          Zarar uydurulan gerçekler değildi; asıl zarar, gerçek kimlik belgelerinin sahte bir
          bahaneyle bir sisteme girmesi ve bunu bildirecek bağımsız bir kurumun olmamasıydı. ALPAR
          AI'yi işte bu boşluk sebebiyle kurdum.
        </p>
        <div className="mt-8">
          <a
            href="https://alparai.com/cases/001-grok-passport"
            className="inline-block rounded-lg bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-200"
          >
            Vaka Raporu Oluştur
          </a>
        </div>
      </section>
      <section>
        <h2 className="mb-6 text-2xl font-bold">Basın & Medya</h2>
        <ul className="space-y-4">
          <li>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              TÜRKINFORM: Grok Skandalı (25 Haziran 2026)
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
