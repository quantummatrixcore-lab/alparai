import { chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
    
    const checkboxes = await page.evaluate(() => {
        const cbs = Array.from(document.querySelectorAll('input[name="investmentStatus"]'));
        return cbs.map(cb => ({
            id: cb.id,
            value: cb.value,
            checked: cb.checked,
            parentText: cb.closest('label')?.innerText || cb.parentElement?.innerText
        }));
    });

    console.log(JSON.stringify(checkboxes, null, 2));
    process.exit(0);
})();
