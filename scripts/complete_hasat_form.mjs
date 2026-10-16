import { chromium } from '@playwright/test';
import path from 'path';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (!page) {
            console.log('Eventiqs sayfası bulunamadı. Lütfen sekmenin açık olduğundan emin olun.');
            process.exit(1);
        }

        console.log('Form alanları Y-Combinator/DeepTech (UTF-8) standartlarıyla güncelleniyor...');

        // 1. Dropdown Selects (Eksikler kapatılıyor)
        await page.selectOption('select[name="sector"]', 'yapay-zeka');
        await page.selectOption('select[name="stage"]', 'mvp');
        await page.selectOption('select[name="tekmer"]', 'yok');
        await page.selectOption('select[name="fundingStatus"]', 'almadik');
        await page.selectOption('select[name="referralSource"]', 'ekosistem');
        await page.fill('input[name="foundedDate"]', '2026-06');

        // 2. Güncellenmiş, Safsatasız (Bullshit-free) Metinler
        const problemSolutionText = `PROBLEM:
Enterprise LLM entegrasyonlarında halüsinasyon, veri sızıntısı ve EU AI Act regülasyon uyumsuzluğu; şirketleri devasa dava ve ceza risklerine açık bırakmaktadır. Mevcut APM ve loglama araçları, runtime ihlallerini hukuki delil standardında denetleyememektedir.

ÇÖZÜM:
AlparAI; kurumsal yapay zeka modelleri ile son kullanıcı arasına giren bağımsız bir "Runtime Governance & Compliance Proxy" katmanıdır. Halüsinasyon ve veri sızıntılarını gerçek zamanlı bloklar, müdahaleleri ISO/IEC 27037 standartlarına ve W3C normlarına uygun olarak kriptografik denetim loguna (Cross-Audit Trail) dönüştürür.`;

        const tractionText = `TRACTION VE MEVCUT DURUM:
Ekip & Teknoloji: Çekirdek yapay zeka mimarisi (CTO) Ercüment Erden tarafından geliştirilmektedir. Regülasyon ve kriz iletişimi için Danışma Kurulu'nda Prof. Dr. Musa Aygül ve Ahmet Rıfat Albuz yer almaktadır.
Durum: Altyapının (Epistemic Firewall ve Cross-Audit) MVP sürümü kodlanmış ve canlı dağıtım (deployment) aşamasına geçilmiştir.
Finansal Hedef: Proje şu an Pre-Revenue ($0 ciro) seviyesindedir. 3 yıllık projeksiyonda 50 B2B Enterprise pilot sözleşme ile $1.2M - $3.5M ARR bandına ulaşmak hedeflenmektedir.`;

        const whyDemodayText = `NEDEN HASAT VE TEKNOPARK İSTANBUL?
Pre-seed aşamasındaki AlparAI'ın birincil ihtiyacı; Türkiye'deki Enterprise firmalarla "regülasyon sandbox" ortamında pilot POC (Kavram Kanıtı) süreçlerini başlatmaktır. Teknopark İstanbul'un sağlayacağı B2B kurumsal ağ ve DeepTech ekosistemi, bu uyum motorunun AB pazarı (EU AI Act Compliance) öncesi ticarileşmesinde en kritik stratejik kaldıraçtır.`;

        await page.fill('textarea[name="problemSolution"]', problemSolutionText);
        await page.fill('textarea[name="traction"]', tractionText);
        await page.fill('textarea[name="whyDemoday"]', whyDemodayText);

        // 3. Dosyaların doğru logolarla güncellenmesi
        const logoPath = 'D:\\03_ALPARAI\\public\\brand\\ALPARAI_OFFICIAL_SHIELD_LOGO.png';
        const deckPath = 'D:\\03_ALPARAI\\AlparAI_Pitch_Deck_Q4_2026.pdf';

        const logoInput = await page.$('input[name="startupLogo"]');
        if (logoInput) {
            await logoInput.setInputFiles(logoPath);
            console.log('Resmi Kalkan-Terazi Logosu forma işlendi.');
        }

        const deckInput = await page.$('input[name="pitchDeck"]');
        if (deckInput) {
            await deckInput.setInputFiles(deckPath);
            console.log('VC Standartlarında Pitch Deck PDF forma işlendi.');
        }

        console.log('✅ Form başarıyla, Türkçe karakter bozulması olmadan ve endüstri standartlarında GÜNCELLENDİ!');
        process.exit(0);
    } catch (e) {
        console.error('Hata:', e);
        process.exit(1);
    }
})();
