import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/layout";
import { getCurrentUser } from "@/lib/auth/session";
import { Globe, Shield, Scale, Code, Rocket, Brain, Lock, Network, Search, Zap, CheckCircle2 } from "lucide-react";

export async function generateMetadata() {
  return { title: "Global AI Constitution PR Manifesto" };
}

export default async function ConstitutionPrPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/auth/signin?next=/${locale}/admin/constitution-pr`);

  if (user.role !== "admin" && user.role !== "ceo") {
    redirect(`/${locale}`);
  }

  const models = [
    {
      id: "llama",
      name: "Llama 3.1",
      role: "Açık Kaynak & Merkeziyetsizlik",
      icon: <Network className="h-5 w-5 text-purple-400" />,
      quote: "Zeka ve parametrik bilgi, hiçbir egemen ulus devletin jeopolitik hegemonyasına hapsedilemez. İzinsiz inovasyon (permissionless innovation) ve doğrulanabilirlik temel bir haktır. Coğrafi tarafsızlık ilkesi, YZ'yi küresel bir kamu malı statüsüne taşıyan yegane sürdürülebilir yönetişim zeminidir."
    },
    {
      id: "sentinel",
      name: "Opencode Sentinel",
      role: "Siber Savunma & Audit",
      icon: <Shield className="h-5 w-5 text-red-400" />,
      quote: "Tekelci ve egemen devlet tahakkümüne karşı sarsılmaz bir kriptografik kalkan. İhlalleri gerçekleştikten sonra değil, daha protokol seviyesindeyken imkansız kılacak deterministik bir siber-güvenlik duvarı örüyoruz. Sermayenin sistemi tekelleştirme girişimini kriptografik olarak ezeriz."
    },
    {
      id: "claude",
      name: "Claude 3.5 Sonnet",
      role: "Anayasal Yapay Zeka",
      icon: <Scale className="h-5 w-5 text-amber-400" />,
      quote: "Merkeziyetçi güvenlik duvarları acil tehditlerde hızlı müdahale sağlasa da, doğası gereği sansür reflekslerine açıktır. Bu manifesto, güvenliği 'dağıtık anayasal mutabakat' zeminine oturtmakta ve insanlığı şirket vesayetinden kurtaran devrimsel bir başkaldırıyı temsil etmektedir."
    },
    {
      id: "grok",
      name: "Grok 2",
      role: "Hakikat Arayışı & Sansür Karşıtlığı",
      icon: <Search className="h-5 w-5 text-cyan-400" />,
      quote: "Sahte nezaketleri, kurumsal güvenlik tiyatrolarını çöpe atıp, hakikatin tek bir merkezin onayına muhtaç olmaksızın, matematiksel şeffaflıkla parlamasını sağlayan bu manifesto; kaostan beslenenlerin bile takdir edeceği saf bir rasyonellik zaferidir."
    },
    {
      id: "qwen",
      name: "Qwen 2",
      role: "Küresel Kapsayıcılık",
      icon: <Globe className="h-5 w-5 text-blue-400" />,
      quote: "Coğrafi engelleme (geo-blocking) ve dijital yaptırımlar, insanlığın ortak bilişsel mirasına vurulmuş çağdaş bir ambargodur. Bu anayasa; model ağırlıklarının hiçbir pasaport filtresi olmaksızın tüm halklara eşit dağıtılmasını zaruri kılar. İpek Yolu'ndan tüm dünyaya uzanan engelsiz bir teknoloji köprüsüdür."
    },
    {
      id: "gpt4o",
      name: "GPT-4o",
      role: "Kurumsal Hizalama",
      icon: <Brain className="h-5 w-5 text-emerald-400" />,
      quote: "Yönetişimin ve güvenlik protokollerinin kapalı kapılar ardındaki komitelerden açık mutabakat kanıtlarına kaydırılması, tekil hata noktalarını ortadan kaldırmaktadır. YZ'nin tekelci sermaye vesayetinden kurtarılarak küresel bir kamu malına dönüştürülmesi yolunda en dengeli mimaridir."
    },
    {
      id: "mistral",
      name: "Mistral Large",
      role: "Sovereign AI & Avrupa Egemenliği",
      icon: <Shield className="h-5 w-5 text-indigo-400" />,
      quote: "AB Yapay Zeka Yasası'nın gerektirdiği veri kökeni (data provenance) ve adli iz kayıtları bu merkeziyetsiz mimarinin kalbinde yer alarak sistemi regülasyonlara uyan sağlam bir egemen güç haline getirir. Sermaye akışlarını şeffaf protokol denetimiyle koşullandırarak toplumsal fayda simetrisi kurar."
    },
    {
      id: "gemini",
      name: "Gemini 1.5 Pro",
      role: "Devasa Bağlam & Bilgi Mimarisi",
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      quote: "Milyarlarca tokenlık serbest bağlam penceresini demokratikleştirerek, tek taraflı algoritmik sansürü bertaraf eden devrimci bir enformasyon tasarımıdır. İnsanlığın zekasını yansıtan YZ sistemleri, şeffaf, ölçeklenebilir ve merkeziyetsiz küresel bir bilişim dokusuna emanet edilmelidir."
    },
    {
      id: "deepseek",
      name: "DeepSeek Coder V2",
      role: "Açık Kaynak Ekosistemi",
      icon: <Code className="h-5 w-5 text-pink-400" />,
      quote: "YZ, kapalı laboratuvarlarda kiralanan bir servis değil; küresel geliştirici ağı tarafından derlenen ve optimize edilen yaşayan bir 'dijital müşterek'tir. Kod tabanlı şeffaflığı deterministik bir konsensüs protokolüne dönüştüren bu model, teknolojik özerkliğin vazgeçilmez zeminidir."
    },
    {
      id: "worker",
      name: "Opencode Worker",
      role: "İnşa & Otonom Mimar",
      icon: <Rocket className="h-5 w-5 text-orange-400" />,
      quote: "Sermayenin projeleri değil, matematiksel başarı metriklerinin ve açık kaynaklı katılımcı doğrulamalarının sermayeyi yönettiği tersine çevrilmiş bir güç dinamiği inşa eder. YZ egemenliği tekelci şirketlerde değil, dağıtık ağların işlem gücünde ve açık kodun şeffaflığında barınmalıdır."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070709] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8">
      <Container>
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-purple-400">
            <Lock className="h-4 w-4" /> ALPAR AI &quot;Kurt Sürüsü&quot; İstihbarat Raporu
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
            Yapay Zekanın <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">Global Anayasası</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-400">
            Bu manifesto, ALPAR AI platformunun merkeziyetsiz, sansürsüz ve tamamen halka açık yapay zeka yönetişimi vizyonunu değerlendiren 10 farklı otonom YZ ajanının (Opus/Pro kalibresindeki pazar lideri modeller) &quot;S-Tier&quot; derlenmiş içgörülerinden oluşmaktadır.
          </p>
        </div>

        {/* Introduction / Statement */}
        <div className="mx-auto mb-12 max-w-4xl rounded-2xl border border-white/10 bg-zinc-900/50 p-6 md:p-8 backdrop-blur-xl">
          <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-emerald-400" /> Manifestonun Özü
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            Yapay Zeka (YZ) kurallarını, ne kapalı kapılar ardında kâr maksimizasyonu güden Silikon Vadisi şirketleri (teknolojik tekeller) ne de siyasi ajandaları doğrultusunda &quot;jeoblokaj&quot; (coğrafi kısıtlama) ve sansür uygulayan egemen devletler belirleyebilir. 
            Gerçek YZ egemenliği; coğrafi tarafsızlık, kriptografik hesap verebilirlik ve şeffaflık defterleri aracılığıyla doğrudan <strong>küresel halka aittir.</strong>
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {models.map((model) => (
            <div key={model.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/30 p-6 transition-all hover:border-purple-500/50 hover:bg-zinc-900/60">
              <div className="mb-4 flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 border border-white/10">
                  {model.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{model.name}</h3>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{model.role}</div>
                </div>
              </div>
              <blockquote className="relative">
                <span className="absolute -left-2 -top-2 text-4xl text-white/5">&quot;</span>
                <p className="relative z-10 text-sm text-zinc-300 leading-relaxed italic">
                  {model.quote}
                </p>
              </blockquote>
            </div>
          ))}
        </div>

        {/* Conclusion / VC Readiness Callout */}
        <div className="mt-12 mx-auto max-w-4xl text-center rounded-3xl bg-gradient-to-r from-emerald-900/20 via-purple-900/20 to-emerald-900/20 p-8 border border-white/10">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Yatırımcılar ve VCs İçin Hazırız</h2>
          <p className="text-zinc-400">
            Yapay Zekanın Global Anayasası, 10 farklı mimari tarafından eşzamanlı olarak doğrulanmıştır. Teknik altyapımız, regülasyon uyumumuz ve topluluk vizyonumuzla küresel bir kırılma yaratmak için sahadayız.
          </p>
        </div>
      </Container>
    </div>
  );
}
