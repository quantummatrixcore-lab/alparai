import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (page) {
            const pdfInput = page.locator('input[name="pitchDeck"]');
            if (await pdfInput.count() > 0) {
                await pdfInput.setInputFiles('D:\\03_ALPARAI\\AlparAI_Pitch_Deck_Q4_2026.pdf');
                console.log('[OK] Kusursuz yeni Pitch Deck PDF forma yüklendi.');
            }
        }
        process.exit(0);
    } catch(e) {
        console.error(e); process.exit(1);
    }
})();
