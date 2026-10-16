import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        
        const info = await page.evaluate(() => {
            const allInputs = Array.from(document.querySelectorAll('input, select, textarea'));
            return allInputs.map(el => ({
                tag: el.tagName,
                name: el.name,
                id: el.id,
                type: el.type,
                value: el.value,
                placeholder: el.placeholder
            }));
        });
        
        console.log(JSON.stringify(info, null, 2));
        process.exit(0);
    } catch(e) {
        console.error(e); process.exit(1);
    }
})();
