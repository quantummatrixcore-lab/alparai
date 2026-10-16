import { chromium } from '@playwright/test';

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const page = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (!page) { process.exit(1); }

        console.log('Gerçek iletişim bilgileri (532 440 83 89 ve ercument.erden@alparai.com) forma işleniyor...');

        // 1. İletişim Bilgileri (Resmi Teknopark Kayıtlarından)
        await page.fill('input[name="founderEmail"]', 'ercument.erden@alparai.com');
        await page.fill('input[name="email"]', 'ercument.erden@alparai.com');
        await page.selectOption('select[name="phoneCountryCode"]', '+90');
        await page.fill('input[name="phone"]', '5324408389');
        await page.fill('input[name="founderRole"]', 'Kurucu & Genel Müdür / Baş Sistem Mimarı');

        console.log('✅ GERÇEK TELEFON VE RESMİ E-POSTA FORMA BAŞARIYLA ENJEKTE EDİLDİ!');
        process.exit(0);
    } catch(e) { 
        console.error(e);
        process.exit(1); 
    }
})();
