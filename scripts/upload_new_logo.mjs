import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (page) {
            const logoInput = page.locator('input[name="startupLogo"]');
            if (await logoInput.count() > 0) {
                await logoInput.setInputFiles('D:\\03_ALPARAI\\public\\brand\\AlparAI_Global_Logo.png');
                console.log('[OK] Kusursuz Yeni Logo (AlparAI_Global_Logo.png) forma yüklendi.');
            }
        }
        process.exit(0);
    } catch(e) {
        console.error(e); process.exit(1);
    }
})();
