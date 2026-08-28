export const dynamic = "force-dynamic";

export default function FounderAdminPanel() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <div className="flex w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <div className="text-xl font-bold tracking-tight">ALPAR</div>
          <div className="text-fg-muted mt-1 text-[10px] tracking-widest uppercase">
            Kurucu Paneli
          </div>
        </div>

        <div className="p-4">
          <div className="text-fg-muted px-2 pb-2 text-[10px] tracking-widest uppercase">Genel</div>
          <button className="mb-1 flex w-full items-center gap-2 border-l-4 border-indigo-600 bg-indigo-50 px-3 py-2 text-left text-[13.5px] font-bold text-slate-900">
            Genel Bakış
          </button>
          <button className="text-fg-secondary mb-1 flex w-full items-center gap-2 border-l-4 border-transparent bg-transparent px-3 py-2 text-left text-[13.5px] font-bold hover:bg-slate-50 hover:text-slate-900">
            İçerik Yönetimi
          </button>
          <button className="text-fg-secondary flex w-full items-center gap-2 border-l-4 border-transparent bg-transparent px-3 py-2 text-left text-[13.5px] font-bold hover:bg-slate-50 hover:text-slate-900">
            Raporlar & Analitik
          </button>
        </div>

        <div className="px-4">
          <div className="text-fg-muted mt-2 border-t border-slate-200 px-2 py-3 text-[10px] tracking-widest uppercase">
            Operasyon
          </div>
          <div className="text-fg-muted cursor-pointer px-3 py-1.5 text-[12.5px] hover:text-slate-800">
            Denetim Kuyruğu
          </div>
          <div className="text-fg-muted cursor-pointer px-3 py-1.5 text-[12.5px] hover:text-slate-800">
            Vaka Kayıtları
          </div>
          <div className="text-fg-muted cursor-pointer px-3 py-1.5 text-[12.5px] hover:text-slate-800">
            İçe Aktarım
          </div>
        </div>

        <div className="mt-2 px-4">
          <div className="text-fg-muted mt-2 border-t border-slate-200 px-2 py-3 text-[10px] tracking-widest uppercase">
            İstihbarat
          </div>
          <div className="text-fg-muted cursor-pointer px-3 py-1.5 text-[12.5px] hover:text-slate-800">
            Model Karşılaştırma
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <h1 className="text-fg-secondaryxl mb-6 font-bold">Genel Bakış</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-fg-muted mb-2 text-sm font-semibold tracking-wider uppercase">
              Toplam Vaka
            </h3>
            <p className="text-3xl font-bold text-slate-900">1,248</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-fg-muted mb-2 text-sm font-semibold tracking-wider uppercase">
              Aktif İncelemeler
            </h3>
            <p className="text-3xl font-bold text-slate-900">42</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-fg-muted mb-2 text-sm font-semibold tracking-wider uppercase">
              Sistem Sağlığı
            </h3>
            <p className="text-3xl font-bold text-emerald-600">Optimum</p>
          </div>
        </div>
      </div>
    </div>
  );
}
