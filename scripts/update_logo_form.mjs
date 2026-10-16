import { chromium } from '@playwright/test';
(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        
        const logoPath = 'D:\\03_ALPARAI\\public\\brand\\ALPARAI_OFFICIAL_SHIELD_LOGO.png';
        const logoInput = await page.$('input[name="startupLogo"]');
        if (logoInput) {
            await logoInput.setInputFiles(logoPath);
            console.log('Kalkan-Terazi resmi logosu forma yklendi:', logoPath);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
