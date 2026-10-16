import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        
        await page.evaluate(() => {
            const setVal = (sel, val) => {
                const el = document.querySelector(sel);
                if (el && !el.value) {
                    el.value = val;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };
            
            // Proje Adı / Girişim Adı
            setVal('input[name="projectName"]', 'AlparAI');
            setVal('input[name="startupName"]', 'AlparAI');
            
            // One-Liner (Kısa Tanım)
            setVal('input[name="oneLiner"]', 'Yapay Zekânın Küresel Sivil Anayasası ve Kredi Derecelendirme (Şikayetvar + Cloudflare + Moody\'s) Otoritesi.');
            
            // Sector
            setVal('input[name="sector"]', 'Yapay Zekâ Güvenliği (AI TRiSM) & RegTech');
            
            // Stage (Select)
            const stage = document.querySelector('select[name="stage"]');
            if (stage && !stage.value) {
                // select the option that includes MVP or Prototip
                const opts = Array.from(stage.options);
                const mvpOpt = opts.find(o => o.text.includes('MVP') || o.text.includes('Prototip'));
                if (mvpOpt) {
                    stage.value = mvpOpt.value;
                    stage.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            // Tekmer
            const tekmer = document.querySelector('select[name="tekmer"]');
            if (tekmer && !tekmer.value) {
                const opts = Array.from(tekmer.options);
                const noOpt = opts.find(o => o.text.includes('Hayır') || o.text.includes('Bulunmuyorum'));
                if (noOpt) {
                    tekmer.value = noOpt.value;
                    tekmer.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            // Kurucu Bilgileri
            setVal('input[name="founderName"]', 'Ercüment Erden');
            setVal('input[name="founderRole"]', 'Kurucu & Baş Mimar (CTO)');
            setVal('input[name="founderEmail"]', 'ercument.erden@alparai.com');
            setVal('input[name="founderLinkedin"]', 'https://ercumenterden.com');
            
            // Funding Status (Radios - hiç yatırım almadık)
            const fundingRadios = document.querySelectorAll('input[name="fundingStatus"]');
            if(fundingRadios && fundingRadios.length > 0) {
                // Genelde ilk seçenek "Almadım" olur, DOM'a göre bakalım.
                fundingRadios[0].click(); 
            }
            const investmentRadios = document.querySelectorAll('input[name="investmentStatus"]');
            if(investmentRadios && investmentRadios.length > 0) {
                investmentRadios[0].click(); 
            }
        });
        
        console.log('[OK] Kalan tüm ikincil boş alanlar (Girişim Adı, Sektör, Aşama, Kurucu Adı vb.) eksiksiz dolduruldu!');
        process.exit(0);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
})();
