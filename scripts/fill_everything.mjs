import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (!page) { process.exit(1); }

        console.log('Tüm form alanları eksiksiz dolduruluyor...');

        // 1. Genel Şirket Bilgileri
        await page.fill('input[name="startupName"]', 'AlparAI');
        await page.fill('input[name="projectName"]', 'AlparAI - Yapay Zekâ Bağımsız Güvenlik ve Tahkim Otoritesi');
        await page.fill('input[name="oneLiner"]', 'Kurallarını doğrudan toplumun ve kullanıcıların koyduğu dünyanın ilk bağımsız Yapay Zekâ Güvenlik, Şikayet ve Tahkim Ekosistemi.');
        await page.fill('input[name="website"]', 'https://alparai.com');
        await page.fill('input[name="teamSize"]', '3');
        await page.selectOption('select[name="sector"]', 'yapay-zeka');
        await page.selectOption('select[name="stage"]', 'mvp');
        await page.fill('input[name="foundedDate"]', '2026-06');
        await page.selectOption('select[name="tekmer"]', 'yok');
        await page.selectOption('select[name="fundingStatus"]', 'almadik');

        // 2. Kurucu Bilgileri
        await page.fill('input[name="founderName"]', 'Ercüment Erden');
        await page.fill('input[name="founderRole"]', 'Kurucu & Baş Mimar (CTO)');
        await page.fill('input[name="founderEmail"]', 'ercument.erden@gmail.com');
        await page.fill('input[name="founderLinkedin"]', 'https://ercumenterden.com');
        await page.fill('input[name="email"]', 'info@alparai.com');

        // 3. Stratejik Vizyon Metinleri
        const problemSolutionText = `PROBLEM:
1. Kuralları Kim Koyuyor?: Yapay zekânın sınırlarını trilyon dolarlık teknoloji tekelleri kendi kâr hedeflerine göre, devletler ise jeopolitik çıkarlarına göre çizmektedir. Doğrudan zarar gören, verisi sızdırılan ve aldatılan halkın/kullanıcının masada hiçbir temsiliyeti ve söz hakkı yoktur.
2. Sivil Hak Boşluğu: İnsanların ve işletmelerin yapay zekâ ihlalleri karşısında başvurabileceği bağımsız bir şikayet mercii ("Yapay Zekânın Şikayetvar'ı") bulunmamaktadır.
3. Zorunlu Güvenlik İhtiyacı: Yapay zekâ güvenliği siber güvenliğin en hızlı büyüyen ($52B+) kaçınılmaz alanıdır. Şirketler LLM entegrasyonlarında halüsinasyon, veri sızıntısı ve EU AI Act cezalarına karşı bir sorumluluk kalkanı (liability shield) bulamamaktadır.

ÇÖZÜM VE TİCARİ İŞ MODELİ:
AlparAI; kuralları şirketlerin veya devletlerin değil, doğrudan kullanıcıların ve toplumun koyduğu çift taraflı (Two-Sided) bir Siber Güvenlik ve RegTech girişimidir.
- 1. B2B İtibar ve Çözüm Portalı (Şikayetvar Modeli): Tüketiciler ihlalleri W3C standartlarında bildirir ve kamuoyu baskısı oluşturur. AI geliştiren şirketler ise itibarını korumak ve regülasyon cezalarından kaçınmak için aylık $499 - $2.499 B2B SaaS aboneliği ödeyerek paneli kullanır.
- 2. Runtime Governance Proxy (Siber Güvenlik Lisansı): Modeller ile son kullanıcı arasına giren izole RAM-içi "Epistemic Firewall" yazılımımız, halüsinasyon ve sızıntıları gerçek zamanlı filtreler. Şirketler bu teknik kalkanı API çağrısı başına mikro-faturalandırma ile satın alır.
- 3. Aktüerya ve Risk Verisi (InsurTech): 2.908+ doğrulanmış vaka havuzumuz, Allianz ve Munich Re gibi sigorta devlerine yüksek kâr marjlı aktüeryal risk modeli olarak lisanslanır.
- 4. Pazar Hedefi: AI pazarının Moody's ve Cloudflare'i olarak kuralları dikte eden tek kapı olmak; 3. yılda $15M - $30M ARR bandına ölçeklenmek.`;

        const tractionText = `TRACTION VE METRİKLER:
1. Yaşayan Veri Hendeği (Data Moat): 24+ küresel model taranarak elde edilmiş, ISO/IEC 27037 adli bilişim standartlarıyla mühürlenmiş 2.908'den fazla gerçek yapay zekâ ihlal kaydı hazır ve aktiftir. Bu arşiv en büyük bağımsız veri varlığımızdır.
2. Ağır Ekip ve Doğrulanmış Otorite:
   - Kurucu & Baş Mimar (CTO): Ercüment Erden (ercumenterden.com) — Sistem mimarisi, ZKP ve otonom güvenlik altyapısının tek teknik kurucusu.
   - Hukuk ve Tahkim Lideri: Prof. Dr. Musa Aygül (musaaygul.com) — Selçuk Üniversitesi Hukuk Fakültesi Ticaret Hukuku Anabilim Dalı Başkanı & MÖHUK / Uluslararası Tahkim Otoritesi.
   - Kamuoyu ve İletişim: Ahmet Rıfat Albuz (ahmetrifatalbuz.com) — 20+ yıllık gazeteci. Kullanıcı edinimini ve kamuoyu baskısını ("Naming & Shaming") yöneten medya lideri.
3. Ürün ve Finans: Epistemic Firewall ve Şikayet Portalı MVP'si canlı dağıtım aşamasındadır. Pre-Revenue ($0 ciro) aşamasındayız; ilk 18 ayda 50 Enterprise pilot ile $1.5M - $3M ARR tabanı, 3. yılda AB regülasyon uyumuyla $15M - $30M ARR hedeflenmektedir.`;

        const whyDemodayText = `NEDEN HASAT VE TEKNOPARK İSTANBUL?
AlparAI, küresel yapay zekâ pazarında kural dinleyen bir amele değil, kuralları dikte eden "Kategori Kralı" (Category King) olmaya aday bir girişimdir. ABD ve Çin blokları karşısında tarafsız, bağımsız ve kurallarını toplumun koyduğu 3. Küresel Hakemlik Otoritesini temsil ediyoruz.

Teknopark İstanbul'dan beklentimiz bir bürokratik himaye değil;
1. Bu çift taraflı (Şikayetvar + Enterprise Proxy) güvenlik modelini Türkiye'deki bankacılık, telekom ve holdinglerle regülasyon sandbox ortamında pilot POC sözleşmelerine dönüştürmek,
2. AB Yapay Zekâ Yasası (EU AI Act Madde 73) akreditasyonunu tamamlayarak küresel pazara açılmak,
3. Türkiye'yi yapay zekâda kural tüketen bir pazar olmaktan çıkarıp, dünyaya "Halk Temelli Güvenlik ve Uyum Standartları" ihraç eden lider bir merkez yapmaktır.`;

        await page.fill('textarea[name="problemSolution"]', problemSolutionText);
        await page.fill('textarea[name="traction"]', tractionText);
        await page.fill('textarea[name="whyDemoday"]', whyDemodayText);

        await page.selectOption('select[name="referralSource"]', 'ekosistem');

        // 4. Dosya Yüklemeleri
        const logoPath = 'D:\\03_ALPARAI\\public\\brand\\ALPARAI_OFFICIAL_SHIELD_LOGO.png';
        const deckPath = 'D:\\03_ALPARAI\\AlparAI_Pitch_Deck_Q4_2026.pdf';

        const logoInput = await page.$('input[name="startupLogo"]');
        if (logoInput) await logoInput.setInputFiles(logoPath);

        const deckInput = await page.$('input[name="pitchDeck"]');
        if (deckInput) await deckInput.setInputFiles(deckPath);

        console.log('Form tüm alanlarıyla eksiksiz dolduruldu!');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
})();
