import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (!page) {
            console.log('Eventiqs sayfası bulunamadı. Lütfen sekmenin açık olduğundan emin olun.');
            process.exit(1);
        }

        console.log('Nihai HASAT metinleri (Şikayetvar Modeli + Domainler + UTF-8) güncelleniyor...');

        const problemSolutionText = `PROBLEM:
İnsanlar ve kurumlar yapay zekanın ürettiği halüsinasyon, telif ihlali ve kişisel veri sızıntılarından doğrudan zarar görüyor; ancak seslerini duyurabilecekleri, hak arayabilecekleri bağımsız bir şikayet mercii (Yapay Zekanın Şikayetvar'ı) bulunmuyor. Diğer yanda ise AI üreten şirketler, patlayan bu şikayet krizlerini yönetecek ve EU AI Act regülasyonlarındaki devasa cezalardan korunacak hukuki bir "sorumluluk kalkanı" bulamıyor. Mevcut loglama araçları bu toplumsal ve hukuki kaosu çözmekte yetersiz kalıyor.

ÇÖZÜM (Sentez İş Modeli):
AlparAI, yapay zekanın küresel "Şikayetvar / Trustpilot" platformu olarak çalışan bir Toplumsal Bağışıklık Sistemidir. Çift taraflı pazar modeliyle çalışır:
1. Sivil Şikayet Meydanı: Zarar gören tüketiciler/kurumlar ihlalleri W3C standartlarında platforma bildirir.
2. B2B Çözüm Portalı (Enterprise Proxy): AI şirketleri, marka itibarını korumak için platforma abone olmak zorunda kalır. Kurumlar, "Runtime Governance Proxy" altyapımızı kendi sistemlerine entegre ederek halüsinasyon ve sızıntıları tüketiciye ulaşmadan gerçek zamanlı bloklar ve hukuki denetim logu üretir.`;

        const tractionText = `TRACTION VE MEVCUT DURUM:
Ekip & Otorite Kalkanı: Çekirdek yapay zeka mimarisi ve sistem altyapısı (CTO) Ercüment Erden (ercumenterden.com) tarafından geliştirilmektedir. Regülasyon, uluslararası tahkim ve kriz iletişimi süreçleri için Danışma Kurulu'nda Prof. Dr. Musa Aygül (musaaygul.com) ve kıdemli medya lideri Ahmet Rıfat Albuz (ahmetrifatalbuz.com) yer almaktadır.
Durum: "Şikayetvar" portal konseptinin ve Enterprise Proxy altyapısının (Epistemic Firewall) MVP sürümü kodlanmış, canlı dağıtım (deployment) aşamasına geçilmiştir.
Finansal Hedef: Pre-Revenue ($0 ciro). 3 yıllık projeksiyonda 50 B2B Enterprise pilot sözleşme ile $1.2M - $3.5M ARR bandına ulaşmak hedeflenmektedir.`;

        const whyDemodayText = `NEDEN HASAT VE TEKNOPARK İSTANBUL?
Pre-seed aşamasındaki AlparAI'ın birincil ihtiyacı; Türkiye'deki Enterprise firmalarla "regülasyon sandbox" ortamında pilot POC (Kavram Kanıtı) süreçlerini başlatmaktır. Teknopark İstanbul'un sağlayacağı B2B kurumsal ağ ve DeepTech ekosistemi, bu "Şikayetvar" ve "Uyum Motoru" ikili iş modelinin AB pazarı (EU AI Act Compliance) öncesi ticarileşmesinde en kritik stratejik kaldıraçtır.`;

        await page.fill('textarea[name="problemSolution"]', problemSolutionText);
        await page.fill('textarea[name="traction"]', tractionText);
        await page.fill('textarea[name="whyDemoday"]', whyDemodayText);

        console.log('✅ Nihai sentez metinleri ve kişisel domainler (ercumenterden.com vb.) forma başarıyla ENJEKTE EDİLDİ!');
        process.exit(0);
    } catch (e) {
        console.error('Hata:', e);
        process.exit(1);
    }
})();
