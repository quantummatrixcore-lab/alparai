import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        console.log('Bulunan sekme URL:', page ? page.url() : 'YOK');
    } catch(e) { console.error(e); }
})();
