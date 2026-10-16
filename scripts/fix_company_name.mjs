import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));

        await page.evaluate(() => {
            const setInput = (name, value) => {
                const el = document.querySelector(`input[name="${name}"]`);
                if (el) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    nativeInputValueSetter.call(el, value);
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            };

            // 1. Şirket Adı ve Proje Adını Temiz "AlparAI" yap
            setInput('startupName', 'AlparAI');
            setInput('projectName', 'AlparAI');
            setInput('companyName', 'AlparAI');

            // 2. Kuruluş Tarihi
            setInput('foundedDate', '2024-01-01');

            // 3. Tekmer Select
            const select = document.querySelector('select[name="tekmer"]');
            if (select) {
                const opts = Array.from(select.options);
                const target = opts.find(o => o.text.includes('Bağlı') || o.text.includes('Hiçbiri') || o.value.includes('bagli'));
                if (target) {
                    select.value = target.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });

        console.log('[OK] Şirket adı AlparAI yapıldı, Kuruluş Tarihi ve TEKMER tam kilitlendi.');
        process.exit(0);
    } catch(e) {
        console.error(e); process.exit(1);
    }
})();
