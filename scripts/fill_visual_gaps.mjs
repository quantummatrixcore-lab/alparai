import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));

        // Sektör: Yapay Zeka
        await page.selectOption('select[name="sectorId"]', '5e00b8ce-e315-46f9-beeb-9d10526019a8').catch(() => {});
        console.log('[OK] Sektör (Yapay Zeka) seçildi.');

        // Kuruluş Tarihi
        await page.fill('input[name="foundedDate"]', '2024-01-01').catch(() => {});
        console.log('[OK] Kuruluş Tarihi (2024-01-01) girildi.');

        // TEKMER
        await page.selectOption('select[name="tekmer"]', 'bağlı-değilim').catch(() => {});
        console.log('[OK] TEKMER (Bağlı Değilim) seçildi.');

        // TÜBİTAK
        await page.selectOption('select[name="tubitak"]', 'almadim').catch(() => {});
        console.log('[OK] TÜBİTAK (Almadım) seçildi.');

        // Yatırım
        await page.evaluate(() => {
            const labels = Array.from(document.querySelectorAll('label'));
            labels.forEach(l => {
                if (l.innerText.trim() === 'Aldık') {
                    const cb = l.querySelector('input') || document.getElementById(l.htmlFor);
                    if (cb && cb.checked) cb.click(); // Uncheck
                }
                if (l.innerText.trim() === 'Almadık') {
                    const cb = l.querySelector('input') || document.getElementById(l.htmlFor);
                    if (cb && !cb.checked) cb.click(); // Check
                }
            });
        });
        console.log('[OK] Yatırım (Almadık) işaretlendi, Aldık kutusu temizlendi.');

        // Telefon
        await page.fill('input[name="phone"]', '5324408389').catch(() => {});
        console.log('[OK] Telefon (5324408389) düzeltildi.');

        process.exit(0);
    } catch(e) {
        console.error(e); process.exit(1);
    }
})();
