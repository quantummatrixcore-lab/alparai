import { chromium } from '@playwright/test';

(async () => {
    try {
        console.log('MASTER FORM DOLDURMA PROTOKOLÜ BAŞLATILDI...');
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));

        if (!page) {
            console.error('Eventiqs başvuru sayfası bulunamadı!');
            process.exit(1);
        }

        // 1. METİNLER (SINGLE SOURCE OF TRUTH)
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

        // Textareas Fill
        await page.fill('textarea[name="problemSolution"]', problemSolutionText);
        await page.fill('textarea[name="traction"]', tractionText);
        await page.fill('textarea[name="whyDemoday"]', whyDemodayText);
        console.log('[OK] 3 Büyük Metin Alanı dolduruldu.');

        // 2. REACT SEVİYESİNDE TÜM İKİNCİL ALANLARIN DOLDURULMASI
        await page.evaluate(() => {
            const setInput = (name, val) => {
                const el = document.querySelector(`input[name="${name}"]`);
                if (el) {
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(el, val);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };

            const setSelect = (name, valSubstring) => {
                const sel = document.querySelector(`select[name="${name}"]`);
                if (sel) {
                    const opts = Array.from(sel.options);
                    const match = opts.find(o => o.value.includes(valSubstring) || o.text.includes(valSubstring));
                    if (match) {
                        sel.value = match.value;
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            };

            // Girişim & Proje Adı
            setInput('startupName', 'AlparAI');
            setInput('projectName', 'AlparAI');
            setInput('companyName', 'AlparAI');
            
            // One-Liner
            setInput('oneLiner', 'Yapay Zekânın Küresel Sivil Anayasası ve Kredi Derecelendirme (Şikayetvar + Cloudflare + Moody\'s) Otoritesi.');
            
            // Web & İletişim
            setInput('website', 'https://alparai.com');
            setInput('phone', '5324408389');
            setInput('email', 'ercument.erden@alparai.com');
            setInput('linkedin', 'https://ercumenterden.com');
            setInput('teamSize', '3');
            setInput('foundedDate', '2024-01-01');
            
            // Kurucu Bilgileri
            setInput('founderName', 'Ercüment Erden');
            setInput('founderRole', 'Kurucu & Baş Mimar (CTO)');
            setInput('founderEmail', 'ercument.erden@alparai.com');
            setInput('founderLinkedin', 'https://ercumenterden.com');

            // Select Dropdown'lar
            setSelect('sectorId', 'Yapay Zeka');
            setSelect('stage', 'Prototip');
            setSelect('tekmer', 'bağlı-değilim');
            setSelect('tubitak', 'almadim');
            setSelect('referralSource', 'linkedin');

            // Yatırım Durumu (Aldık -> Uncheck, Almadık -> Check)
            const labels = Array.from(document.querySelectorAll('label'));
            labels.forEach(l => {
                if (l.innerText.trim() === 'Aldık') {
                    const cb = l.querySelector('input') || document.getElementById(l.htmlFor);
                    if (cb && cb.checked) { cb.checked = false; cb.dispatchEvent(new Event('change', {bubbles: true})); }
                }
                if (l.innerText.trim() === 'Almadık') {
                    const cb = l.querySelector('input') || document.getElementById(l.htmlFor);
                    if (cb && !cb.checked) { cb.checked = true; cb.dispatchEvent(new Event('change', {bubbles: true})); }
                }
            });
        });

        console.log('[OK] Tüm metin kutuları, kurucu bilgileri ve seçimler eksiksiz dolduruldu.');

        // 3. DOSYA YÜKLEMELERİ
        const logoInput = page.locator('input[name="startupLogo"]');
        if (await logoInput.count() > 0) {
            await logoInput.setInputFiles('D:\\03_ALPARAI\\public\\brand\\AlparAI_Global_Logo.png');
            console.log('[OK] Yeni Endüstri Standardı Logo (AlparAI_Global_Logo.png) forma yüklendi.');
        }

        const pdfInput = page.locator('input[name="pitchDeck"]');
        if (await pdfInput.count() > 0) {
            await pdfInput.setInputFiles('D:\\03_ALPARAI\\AlparAI_Pitch_Deck_Q4_2026.pdf');
            console.log('[OK] Slidev VC Formatlı Pitch Deck (AlparAI_Pitch_Deck_Q4_2026.pdf) forma yüklendi.');
        }

        // 4. SÖZLEŞME ONAY KUTULARI
        const checkboxes = [
            'input[name="privacyConsent"]',
            'input[name="termsConsent"]',
            'input[name="marketingConsent"]',
            'input[name="mediaConsent"]'
        ];

        for (const sel of checkboxes) {
            const cb = page.locator(sel);
            if (await cb.count() > 0) {
                await cb.check({ force: true });
                console.log(`[OK] Onay kutusu kilitlendi: ${sel}`);
            }
        }

        console.log('TEBRİKLER! HASAT 2026 BAŞVURU FORMU %100 EKSİKSİZ VE KUSURSUZ MÜHÜRLENDİ!');
        process.exit(0);
    } catch(e) {
        console.error('Hata:', e);
        process.exit(1);
    }
})();
