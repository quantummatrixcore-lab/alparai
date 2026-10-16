import { chromium } from '@playwright/test';
import fs from 'fs';

const b64 = fs.readFileSync('C:/Users/ercum/.gemini/antigravity/brain/73dbd1a3-ade6-48c4-ae15-f284ecce15e6/.user_uploaded/media_1791369278312.png').toString('base64');

(async () => {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const page = await browser.contexts()[0].newPage();
    await page.setContent(`<img id="img" src="data:image/png;base64,${b64}" />`);
    const dims = await page.evaluate(() => {
        const img = document.getElementById('img');
        return { w: img.naturalWidth, h: img.naturalHeight };
    });
    console.log('Original image dimensions:', dims);
    await page.close();
    process.exit(0);
})();
