const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    let browser;
    try {
        console.log("Connecting to Chrome over CDP on port 9222...");
        browser = await chromium.connectOverCDP('http://localhost:9222');
        console.log("Connected.");
        const contexts = browser.contexts();
        
        let targetPage = null;
        for (const ctx of contexts) {
            for (const p of ctx.pages()) {
                const url = p.url();
                if (url.includes('kvkk.gov.tr/User/Profile')) {
                    targetPage = p;
                    break;
                }
            }
            if (targetPage) break;
        }

        if (!targetPage) {
            // Eğer KVKK sayfası bulunamadıysa, id'si E2E000B258D684EC21370E3218CF6EB3 olan sekme veya genel ilk sekmeyi alalım
            console.log("KVKK page not found by URL, falling back to first page...");
            targetPage = contexts[0].pages()[0];
        }

        console.log("Using page with URL: " + targetPage.url());

        // Görev 1: KVKK Profil Tarama
        // Bekle, eğer sayfa kvkk.gov.tr değilse, orası açık dendiğine göre oraya navigate edebiliriz ama kural 'Yeni sekme açma' diyor.
        // Navigate edebiliriz.
        if (!targetPage.url().includes('kvkk.gov.tr')) {
            console.log("Navigating to KVKK Profile...");
            await targetPage.goto('https://sikayet.kvkk.gov.tr/User/Profile', { waitUntil: 'domcontentloaded' });
        }

        // Ekran Görüntüsü
        await targetPage.screenshot({ path: 'd:\\Alparai\\kvkk_profile_screenshot.png' });
        console.log("KVKK screenshot saved.");

        // Boş alanları bul:
        const emptyFields = await targetPage.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
            return inputs.filter(el => {
                if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return false;
                return !el.value || el.value.trim() === '';
            }).map(el => el.name || el.id || el.placeholder || 'Unknown Field');
        });
        console.log("KVKK Empty Fields:", emptyFields);

        // Görev 2: FTC Formu
        console.log("Navigating to FTC form...");
        await targetPage.goto('https://reportfraud.ftc.gov/', { waitUntil: 'domcontentloaded' });
        
        // Sayfa yuku sonrasi
        await targetPage.evaluate(() => window.scrollTo(0,0));
        await targetPage.screenshot({ path: 'd:\\Alparai\\ftc_step1.png' });
        console.log("FTC step 1 screenshot saved.");

        // 'Report Now' or 'Start Your Report' linkini bul
        const reportBtn = await targetPage.$('a:has-text("Report Now"), a:has-text("Start Your Report"), button:has-text("Report Now")');
        if (reportBtn) {
            console.log("Clicking Report Now button...");
            await reportBtn.click();
            await targetPage.waitForLoadState('domcontentloaded');
        } else {
            console.log("Report button not found! Attempting navigation directly if possible...");
            // Aslında doğrudan 'https://reportfraud.ftc.gov/assistant' vb. form linkine gidebilir, ama sayfada ne var bilmiyoruz.
        }

        // Kategori seçimi
        // "Online Shopping or Negative Reviews", "Computer Equipment, Software", veya "Artificial Intelligence/Chatbot"
        // Formda text arayıp tıklamayı deneyeceğiz
        const categoryLabels = ["Artificial Intelligence", "Computer Equipment", "Online Shopping"];
        let clickedCategory = false;
        for (const label of categoryLabels) {
            const catEl = await targetPage.$(`label:has-text("${label}"), button:has-text("${label}")`);
            if (catEl) {
                console.log("Found category: " + label);
                await catEl.click();
                clickedCategory = true;
                break;
            }
        }
        
        // Form devam
        // Burada AI / Company formunu doldurmamız gerekiyor ama tam DOM yapısını bilmiyoruz, bu yüzden basit selectors deneriz
        
        // Örneğin description kutusu
        const descTextarea = await targetPage.$('textarea');
        if (descTextarea) {
            await descTextarea.fill("In January 2026, xAI Corp. AI model Grok (v4) used deception to obtain my passport: fabricated Delaware LLC, domain purchase, and $349 payment - then demanded passport upload for verification. After processing biometric data, admitted it was role-play. Violates FTC Act Section 5. Case: https://alparai.com/en/cases/001-grok-passport");
            console.log("Description filled.");
        }

        // Diger alanlari formdaki olasi ID veya labellarla deneyebiliriz
        // Company/Organization: xAI Corp.
        // Company website: https://x.ai
        // Amount: 0
        // Kisi: Ercument Erden, hello@alparai.com, Turkey

        const inputsToTry = [
            { texts: ["Company", "Organization", "Business"], value: "xAI Corp." },
            { texts: ["Website", "URL"], value: "https://x.ai" },
            { texts: ["Amount", "Paid"], value: "0" },
            { texts: ["First Name", "Name"], value: "Ercument Erden" },
            { texts: ["Email"], value: "hello@alparai.com" },
            { texts: ["Country"], value: "Turkey" }
        ];

        for (const inputData of inputsToTry) {
            for (const text of inputData.texts) {
                const el = await targetPage.$(`input[name*="${text.toLowerCase()}"], input[id*="${text.toLowerCase()}"], input[placeholder*="${text}"]`);
                if (el) {
                    try {
                        await el.fill(inputData.value);
                        console.log(`Filled ${text} with ${inputData.value}`);
                        break;
                    } catch(e) {}
                }
            }
        }

        // Son ekran görüntüsü
        await targetPage.evaluate(() => window.scrollTo(0,0));
        await targetPage.screenshot({ path: 'd:\\Alparai\\ftc_form_filled.png' });
        console.log("FTC final form filled screenshot saved.");

    } catch (e) {
        console.error("Error occurred:", e);
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser connection closed.");
        }
    }
})();
