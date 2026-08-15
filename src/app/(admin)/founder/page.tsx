export default function FounderAdminPanel() {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="font-bold text-xl tracking-tight">ALPAR</div>
          <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Kurucu Paneli</div>
        </div>
        
        <div className="p-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 px-2 pb-2">Genel</div>
          <button className="flex items-center gap-2 w-full text-left bg-indigo-50 border-l-4 border-indigo-600 px-3 py-2 font-bold text-[13.5px] text-slate-900 mb-1">
            Genel Bakış
          </button>
          <button className="flex items-center gap-2 w-full text-left bg-transparent border-l-4 border-transparent px-3 py-2 font-bold text-[13.5px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 mb-1">
            İçerik Yönetimi
          </button>
          <button className="flex items-center gap-2 w-full text-left bg-transparent border-l-4 border-transparent px-3 py-2 font-bold text-[13.5px] text-slate-600 hover:bg-slate-50 hover:text-slate-900">
            Raporlar & Analitik
          </button>
        </div>

        <div className="px-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 px-2 py-3 border-t border-slate-200 mt-2">Operasyon</div>
          <div className="px-3 py-1.5 text-[12.5px] text-slate-500 cursor-pointer hover:text-slate-800">Denetim Kuyruğu</div>
          <div className="px-3 py-1.5 text-[12.5px] text-slate-500 cursor-pointer hover:text-slate-800">Vaka Kayıtları</div>
          <div className="px-3 py-1.5 text-[12.5px] text-slate-500 cursor-pointer hover:text-slate-800">İçe Aktarım</div>
        </div>

        <div className="px-4 mt-2">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 px-2 py-3 border-t border-slate-200 mt-2">İstihbarat</div>
          <div className="px-3 py-1.5 text-[12.5px] text-slate-500 cursor-pointer hover:text-slate-800">Model Karşılaştırma</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <h1 className="text-2xl font-bold mb-6">Genel Bakış</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Toplam Vaka</h3>
            <p className="text-3xl font-bold text-slate-900">1,248</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Aktif İncelemeler</h3>
            <p className="text-3xl font-bold text-slate-900">42</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Sistem Sağlığı</h3>
            <p className="text-3xl font-bold text-emerald-600">Optimum</p>
          </div>
        </div>
      </div>
    </div>
  );
}
