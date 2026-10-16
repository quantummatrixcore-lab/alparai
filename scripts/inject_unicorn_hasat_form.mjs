import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (!page) {
            console.log('Eventiqs sayfası bulunamadı. Lütfen sekmenin açık olduğundan emin olun.');
            process.exit(1);
        }

        console.log('UNICORN HASAT metinleri (Şikayetvar + Cloudflare + Moody\'s Modeli | 2.908+ Vaka | $15M-$30M ARR) güncelleniyor...');

        const problemSolutionText = `PROBLEM:
Bugün yapay zekânın sınırlarını teknoloji tekelleri kendi kâr hırsına, devletler ise kendi çıkarlarına göre çizmektedir. Halüsinasyonla aldatılan, kişisel verisi çalınan ve doğrudan zarar gören halkın başvurabileceği bağımsız bir şikayet mercii ("Yapay Zekânın Şikayetvar'ı") yoktur. Diğer yanda AI üreten şirketler, patlayan şikayet krizlerini yönetecek ve EU AI Act regülasyonlarındaki devasa cezalardan korunacak gerçek zamanlı hukuki bir "sorumluluk kalkanı" bulamamaktadır.

ÇÖZÜM (Sentez İş Modeli - Kategori Kralı):
AlparAI; kuralları halkın deneyimiyle koyan, parasını şirketlerden kazanan çift taraflı bir B2B RegTech & Siber Güvenlik ekosistemidir:
1. Sivil Şikayet Meydanı: Tüketiciler ihlalleri ISO/IEC 27037 standartlarında dondurarak şikayet eder; sınırları halk çizer.
2. B2B Çözüm Portalı: Şirketler marka itibarını korumak için portalı abone olarak kullanır. 
3. Runtime Governance Proxy (Cloudflare Modeli): Modeller ile insan arasına giren izole RAM-içi "Epistemic Firewall" yazılımımız, sızıntıları gerçek zamanlı bloklar.
4. Veri Hendeği (Moody's Modeli): Biriken gerçek ihlal arşivi, Allianz gibi sigorta devlerine aktüeryal risk verisi olarak yüksek kâr marjıyla satılır.`;

        const tractionText = `TRACTION VE MEVCUT DURUM:
1. Veri Varlığı (Data Moat): 24+ küresel model taranarak elde edilmiş, kriptografik olarak mühürlenmiş 2.908'den fazla gerçek yapay zekâ ihlal kaydı hazır ve aktiftir. Tavuk-yumurta problemi baştan çözülmüştür.
2. Doğrulanmış Ekip Otoritesi: Sistem mimarisi ve ZKP altyapısı kurucu CTO Ercüment Erden (ercumenterden.com) tarafından inşa edilmektedir. Hukuki ve tahkim zırhı Prof. Dr. Musa Aygül (Selçuk Üni. Ticaret Hukuku Anabilim Dalı Bşk.), kriz iletişimi ise Ahmet Rıfat Albuz (ahmetrifatalbuz.com) tarafından yönetilmektedir.
3. Finansal Büyüme Skalası: Pre-Revenue ($0 ciro). Kademeli ARR büyüme modeliyle; 18. ayda 50 B2B Enterprise sözleşme ile $1.5M-$3M ARR, 36. ayda global InsurTech lisanslamasıyla $15M-$30M ARR, 5. yılda ise küresel tahkim tekeliyle $100M+ ARR (Unicorn) hedeflenmektedir.`;

        const whyDemodayText = `NEDEN HASAT VE TEKNOPARK İSTANBUL?
AlparAI sıradan bir B2B yazılımı değil; Türkiye'yi ABD ve Çin kutuplaşmasında "3. Bağımsız Küresel Hakem" yapacak ağır siklet bir DeepTech bayrağıdır. Teknopark İstanbul ve HASAT'tan beklentimiz: Türkiye'deki regüle şirketlerle "sandbox" ortamında pilot (POC) süreçlerini başlatmak, hukuki altyapının testini tamamlamak ve girişimi küresel bir yatırımcı havuzunda tohum (seed) yatırım turuna hazırlamaktır.`;

        await page.fill('textarea[name="problemSolution"]', problemSolutionText);
        await page.fill('textarea[name="traction"]', tractionText);
        await page.fill('textarea[name="whyDemoday"]', whyDemodayText);

        console.log('Metinler (Textareas) dolduruldu.');

        // Update inputs
        const fillIfExists = async (selector, value) => {
            const count = await page.locator(selector).count();
            if (count > 0) {
                await page.fill(selector, value);
                console.log(`[OK] ${selector} => ${value}`);
            }
        };

        await fillIfExists('input[name="phone"]', '+90 (532) 440-83-89');
        await fillIfExists('input[name="website"]', 'https://alparai.com');
        await fillIfExists('input[name="linkedin"]', 'https://ercumenterden.com');
        await fillIfExists('input[name="email"]', 'ercument.erden@alparai.com');
        
        // Şirket unvanı
        await fillIfExists('input[name="startupName"]', 'alparai.com');

        console.log('TÜM FORM GÜNCEL KATEGORİ KRALI VİZYONUYLA (2.908+ Vaka, $15M-$30M ARR, Musa Hoca Unvanı) MÜHÜRLENDİ!');
        process.exit(0);
    } catch (e) {
        console.error('Hata oluştu:', e.message);
        process.exit(1);
    }
})();
