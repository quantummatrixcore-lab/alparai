import { chromium } from '@playwright/test';
import fs from 'fs';

const userImagePath = 'C:/Users/ercum/.gemini/antigravity/brain/73dbd1a3-ade6-48c4-ae15-f284ecce15e6/.user_uploaded/media_1791369278312.png';
const imgBase64 = fs.readFileSync(userImagePath).toString('base64');
const dataUri = `data:image/png;base64,${imgBase64}`;

(async () => {
    try {
        console.log('Kullanıcının amblemi tam boyutta hizalanıp altına AlparAI yazısı ekleniyor...');
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const context = browser.contexts()[0];
        const page = await context.newPage();

        // Canvas size: 800x800
        await page.setViewportSize({ width: 800, height: 800 });

        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@800;900&display=swap');
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        background-color: #030712;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 800px;
                        height: 800px;
                        font-family: 'Inter', -apple-system, sans-serif;
                    }
                    img {
                        width: 520px;
                        height: 520px;
                        object-fit: contain;
                    }
                    .brand-text {
                        margin-top: 10px;
                        font-size: 76px;
                        font-weight: 900;
                        color: #ffffff;
                        letter-spacing: 6px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <img src="${dataUri}" />
                <div class="brand-text">AlparAI</div>
            </body>
            </html>
        `);

        await page.waitForTimeout(500);

        await page.screenshot({ 
            path: 'D:/03_ALPARAI/public/brand/AlparAI_Global_Logo.png',
            fullPage: true
        });
        await page.close();
        console.log('[OK] Amblem ve AlparAI yazısı 800x800 tuvale tam olarak oturtuldu.');

        // Live Eventiqs Formuna otomatik yükleme
        const formPage = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (formPage) {
            const logoInput = formPage.locator('input[name="startupLogo"]');
            if (await logoInput.count() > 0) {
                await logoInput.setInputFiles('D:\\03_ALPARAI\\public\\brand\\AlparAI_Global_Logo.png');
                console.log('[OK] Doğru logo canlı forma yüklendi!');
            }
        }

        process.exit(0);
    } catch(e) {
        console.error('Hata:', e);
        process.exit(1);
    }
})();
