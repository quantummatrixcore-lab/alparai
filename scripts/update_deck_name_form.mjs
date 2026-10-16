import { chromium } from '@playwright/test';
(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        
        const deckPath = 'D:\\03_ALPARAI\\AlparAI_Pitch_Deck_Q4_2026.pdf';
        const deckInput = await page.$('input[name="pitchDeck"]');
        if (deckInput) {
            await deckInput.setInputFiles(deckPath);
            console.log('VC Standartlarýndaki yeni dosya forma yüklendi:', deckPath);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
