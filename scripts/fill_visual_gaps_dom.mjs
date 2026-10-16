import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));

        await page.evaluate(() => {
            const setSelect = (name, value) => {
                const sel = document.querySelector(`select[name="${name}"]`);
                if (sel) {
                    sel.value = value;
                    sel.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };
            const setInput = (name, value) => {
                const el = document.querySelector(`input[name="${name}"]`);
                if (el) {
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };

            // 1. Sektör
            setSelect('sectorId', '5e00b8ce-e315-46f9-beeb-9d10526019a8');
            // 2. Tarih
            setInput('foundedDate', '2024-01-01');
            // 3. Tekmer
            setSelect('tekmer', 'bağlı-değilim');
            // 4. Tübitak
            setSelect('tubitak', 'almadim');
            // 5. Telefon
            setInput('phone', '5324408389');

            // 6. Yatırım Aldık -> Kaldır, Almadık -> İşaretle
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

        console.log('[OK] DOM üzerinden tüm boşluklar saniyeler içinde dolduruldu.');
        process.exit(0);
    } catch(e) {
        console.error(e); process.exit(1);
    }
})();
