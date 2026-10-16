import { chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
    
    const selects = await page.evaluate(() => {
        const selElements = Array.from(document.querySelectorAll('select'));
        return selElements.map(s => ({
            name: s.name || s.id,
            options: Array.from(s.options).map(o => ({ value: o.value, text: o.text }))
        }));
    });

    console.log(JSON.stringify(selects, null, 2));
    process.exit(0);
})();
