import { chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
    
    const targetSelects = ['sector', 'stage', 'tekmer', 'fundingStatus', 'referralSource'];
    const res = await page.evaluate((targets) => {
        return targets.map(t => {
            const el = document.querySelector(`select[name="${t}"]`);
            return {
                name: t,
                options: el ? Array.from(el.options).map(o => ({ value: o.value, text: o.text })) : []
            };
        });
    }, targetSelects);

    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
})();
