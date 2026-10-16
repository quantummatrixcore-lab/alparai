import { chromium } from '@playwright/test';
(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const context = browser.contexts()[0];
        const page = await context.newPage();
        await page.goto('file:///' + 'D:/03_ALPARAI/HASAT_2026_BASVURU/MASTER_PITCH_DECK.html'.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.pdf({ 
            path: 'D:/03_ALPARAI/AlparAI_Pitch_Deck_Q4_2026.pdf', 
            width: '1920px', height: '1080px', 
            printBackground: true
        });
        await page.close();
        console.log("PDF BAŞARIYLA BASILDI!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
