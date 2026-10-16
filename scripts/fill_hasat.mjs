import { chromium } from '@playwright/test';

(async () => {
    console.log('[OMEGA SPARK] Kovan Zihni baglaniyor...');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    let page = null;
    
    for (const p of contexts[0].pages()) {
        if (p.url().includes('eventiqs.com')) {
            page = p;
            break;
        }
    }
    
    if (!page) {
        page = await contexts[0].newPage();
        await page.goto('https://hasat.eventiqs.com/entrepreneur');
        await page.waitForLoadState('networkidle');
    }

    console.log('[OMEGA SPARK] 1000 Puanlik Hucum Paketi Enjekte Ediliyor...');

    await page.evaluate(() => {
        const fill = (name, val) => {
            const el = document.querySelector(`[name="${name}"]`) || document.querySelector(`#${name}`);
            if (el) { 
                el.value = val; 
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };

        const check = (name) => {
            const el = document.querySelector(`[name="${name}"]`) || document.querySelector(`#${name}`);
            if (el && !el.checked) {
                el.click();
            }
        };

        fill('startupName', 'AlparAI');
        fill('projectName', 'AlparAI - Yapay Zekanin Freni');
        fill('oneLiner', 'Yapay Zeka Modelleri (LLM) icin Kriptografik Denetim, EU AI Act Uyum Motoru ve Risk Sigortasi Aktueryasi.');
        fill('website', 'https://alparai.com');
        fill('teamSize', '3');
        fill('foundedDate', '2026-06-25');
        fill('founderName', 'Ercument Erden');
        fill('founderRole', 'Kurucu & Bas Mimar');
        
        fill('problemSolution', 'PROBLEM: EU AI Act (Madde 73) ihlal cezalari, 2.908+ resmi AI halusinasyon/ihlal vakasi ve (Grok vakasindaki gibi) yasadisi PII toplama riskleri. Ayrica sigorta sirketlerinin (Allianz vb.) AI riskini fiyatlayamamasi.\n\nCOZUM: Epistemic Firewall (Sifir Bilgi Ispati) ile veriyi gormeden RAM icinde kriptografik dogrulama yapan; AI ciktilarini anlik capraz sorgulamaya (Cross-Audit) tabi tutarak ISO 27037 standartlarinda adli delil ureten B2B Hukuki Telemetri Agi.');
        
        fill('traction', 'Hukuk (Prof. Dr. Musa Aygul) ve Medya/Kurumsal Iletisim (Ahmet Rifat Albuz) danismanlik zayifliklari resmi olarak kapatilmis ve kilitlenmistir. Mimari olarak ZK (Sifir Bilgi Ispati) ve capraz denetim algoritmalari kodlanmis, CI/CD surecleri testten gecmis, Traefik uzerinden dagitim (deployment) asamasina basilmistir.');
        
        fill('whyDemoday', 'AlparAI siradan bir B2B SaaS degil, "Devlet Akli" gerektiren kuresel bir siber guvenlik ve regulasyon otoritesidir (DeepTech). Teknopark Istanbul`un saglayacagi kurumsal zirh (State Authority), kuresel patent savunmasi ve akilli sermaye eslesmeleri, bu 100 Milyon TL degerlemeli vizyonun globale (InsurTech & RegTech) acilmasindaki tek eksik halkadir.');

        check('privacyConsent');
        check('termsConsent');
        check('marketingConsent');
        check('mediaConsent');
    });

    console.log('[OMEGA SPARK] Metinler saniyeler icinde yuklendi.');
    process.exit(0);
})();
