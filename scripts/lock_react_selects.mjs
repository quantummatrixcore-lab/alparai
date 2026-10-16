import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));

        if (!page) { process.exit(1); }

        // Sektör: value by GUID
        await page.selectOption('select[name="sectorId"]', '5e00b8ce-e315-46f9-beeb-9d10526019a8');
        console.log('[OK] Sektör (Yapay Zeka GUID) seçildi.');

        // Tekmer: index 1 (Bağlı değilim)
        await page.selectOption('select[name="tekmer"]', { index: 1 });
        console.log('[OK] TEKMER seçildi.');

        // Tubitak: index 1 (Almadım)
        await page.selectOption('select[name="tubitak"]', { index: 1 });
        console.log('[OK] TÜBİTAK seçildi.');

        // Ekran görüntüsü yenileme
        await page.screenshot({ path: 'D:/03_ALPARAI/hasat_form_final_master_proof.png', fullPage: true });
        console.log('[OK] Teyit ekranı mühürlendi.');
        process.exit(0);
    } catch(e) {
        console.error(e); process.exit(1);
    }
})();
