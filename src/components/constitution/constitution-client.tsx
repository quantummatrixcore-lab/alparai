"use client";

import React, { useState, useOptimistic, useTransition } from "react";
import { ShieldCheck, Globe, Users, Lock, Sparkles, CheckCircle2, ArrowRight, HeartHandshake } from "lucide-react";

export interface Article {
  num: string;
  title: string;
  desc: string;
  details: string;
}

const CONSTITUTION_ARTICLES: Article[] = [
  {
    num: "Madde I",
    title: "Evrensel Erişim & Coğrafi Tarafsızlık",
    desc: "Yapay zeka modellerine ve güvenlik teknolojilerine erişim, kullanıcının coğrafi konumuna, ırkına veya ülkesine göre kısıtlanamaz.",
    details: "Amerika'da kullanılan gelişmiş zeka modelleri Afrikalı, Asyalı veya Avrupalı bir öğrencinin, araştırmacının veya geliştiricinin elinden alınamaz. Yapay zeka tüm insanlığın ortak mirasıdır."
  },
  {
    num: "Madde II",
    title: "Topluluk Egemenliği (Şirket Vesayetine Son)",
    desc: "Yapay zekanın etik, güvenlik ve kullanım kurallarını tek taraflı olarak dev teknoloji şirketleri veya izole hükümetler koyamaz.",
    details: "Kurallar halkın, bağımsız araştırmacıların, etikerlerin ve küresel topluluğun katılımıyla oluşturulan açık sicillerde ve anayasal ilkelerde tanımlanır."
  },
  {
    num: "Madde III",
    title: "Zorunlu Halüsinasyon ve İhlal Şeffaflığı",
    desc: "Her yapay zeka modeli, ürettiği kritik hataları, güvenlik açıklarını ve toplumsal zararları saklamadan kamuya açık sicile (EU AI Act Madde 73) bildirmekle yükümlüdür.",
    details: "Halı altına süpürülen algoritma krizleri insanlığın güvenliğini tehdit eder. ALPAR AI bu sicilin bağımsız koruyucusudur."
  },
  {
    num: "Madde IV",
    title: "Veri Telifi ve İnsan Emeği Onuru",
    desc: "İnsanların ürettiği düşünsel, sanatsal ve bilimsel içerikler rızasız ve tazminatsız şekilde dev modellerin eğitimi için gasp edilemez.",
    details: "Veri sahipliği şeffaf bir şekilde izlenmeli ve kolektif telif hakkı mekanizmaları otonom olarak çalıştırılmalıdır."
  },
  {
    num: "Madde V",
    title: "Algoritma Açıklanabilirliği ve İtiraz Hakkı",
    desc: "Bir yapay zeka sistemi bir insanın hayatı, kredisi, işi veya özgürlüğü hakkında karar veriyorsa, bu kararın gerekçesini insan dilinde açıklamak zorundadır.",
    details: "Kara kutu (Black Box) karar alma süreçleri kabul edilemez. Her yurttaşın yapay zeka kararlarına insan hakemler önünde itiraz etme hakkı saklıdır."
  },
  {
    num: "Madde VI",
    title: "Kriptografik İzin ve Hak Hakikati",
    desc: "Sentetik medya, deepfake ve yapay zeka çıktısı olan tüm içerikler doğruluk damgasıyla imzalanmalıdır.",
    details: "Toplumsal manipülasyon ve bilgi kirliliğini önlemek için içeriklerin kaynağı kriptografik olarak kamusal sicilde doğrulanabilir olmalıdır."
  }
];

export function ConstitutionClient() {
  const [signatures, setSignatures] = useState(1482);
  const [signed, setSigned] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Geliştirici / Araştırmacı");
  const [isPending, startTransition] = useTransition();

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    startTransition(() => {
      setSignatures((prev) => prev + 1);
      setSigned(true);
    });
  };

  return (
    <div className="relative min-h-screen bg-[#050814] text-zinc-100 selection:bg-purple-500/30 selection:text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[160px]" />

      <div className="relative mx-auto max-w-5xl px-6 pt-32 pb-24">
        {/* Header Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-purple-300 uppercase shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Globe className="h-4 w-4 text-purple-400" /> KÜRESEL HALK MANİFESTOSU & DEVRİMİ
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Yapay Zekanın <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              Global Anayasası
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg font-medium leading-relaxed text-zinc-300 sm:text-xl">
            Yapay zekanın sınırlarını dev teknoloji şirketleri veya hükümetler çizemez. <br />
            <strong>Bu anayasayı insanlık olarak biz yazıyoruz.</strong> Dünyanın neresinde olursanız olun, eşit, şeffaf ve hesap verebilir yapay zeka hakkınızı savunun.
          </p>
        </div>

        {/* Global Signature Counter Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl sm:flex-row sm:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/20 text-purple-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Topluluk İmzası</div>
              <div className="text-3xl font-black tracking-tight text-white">{signatures.toLocaleString()} Yurttaş İmzası</div>
            </div>
          </div>

          <a
            href="#sign-section"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] hover:shadow-purple-500/40 active:scale-[0.98]"
          >
            Anayasayı İmzala <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Articles List */}
        <div className="mt-16 space-y-6">
          <h2 className="text-2xl font-black text-white sm:text-3xl">Anayasa Maddeleri</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {CONSTITUTION_ARTICLES.map((art, idx) => (
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

        {/* Signature Form Section */}
        <div id="sign-section" className="mt-20 rounded-3xl border border-purple-500/30 bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-zinc-950/90 p-8 shadow-2xl backdrop-blur-2xl md:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-purple-400" />
            <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Siz de Anayasayı İmzalamaya Katılın</h2>
            <p className="mt-2 text-sm font-medium text-zinc-400">
              Devletlerin engellerine ve şirketlerin tekelci kurallarına karşı halkın yapay zeka haklarını temsil eden bu bildiride adınızı duyurun.
            </p>

            {signed ? (
              <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-300">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
                <h4 className="text-lg font-bold">Tebrikler! İmzanız Küresel Yapay Zeka Siciline Kaydedildi.</h4>
                <p className="mt-1 text-xs text-emerald-200/80">
                  {name} olarak Global Yapay Zeka Anayasası kurucuları arasına katıldınız. Katkınız için teşekkürler.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSign} className="mt-8 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Ad Soyad / Unvan</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Dr. Ahmet Yılmaz / Bağımsız Araştırmacı"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">E-posta Adresi</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmet@domain.com"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">Rol / Uzmanlık</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Geliştirici / Araştırmacı">Geliştirici / Yapay Zeka Araştırmacısı</option>
                    <option value="Hukukçu / Uyum Uzmanı">Hukukçu / Regülasyon Uzmanı</option>
                    <option value="Öğrenci / Akademisyen">Öğrenci / Akademisyen</option>
                    <option value="Yurttaş / Yapay Zeka Kullanıcısı">Yurttaş / Yapay Zeka Kullanıcısı</option>
                    <option value="Girişimci / Yatırımcı">Girişimci / Yatırımcı</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-90 active:scale-[0.99]"
                >
                  {isPending ? "Kaydediliyor..." : "Anayasayı İmzala & Destekle"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
