import { chromium } from '@playwright/test';
import fs from 'fs';

const userImagePath = 'C:/Users/ercum/.gemini/antigravity/brain/73dbd1a3-ade6-48c4-ae15-f284ecce15e6/.user_uploaded/media_1791369278312.png';
const imgBase64 = fs.readFileSync(userImagePath).toString('base64');

(async () => {
    try {
        console.log('Endüstri standardı logo lockup mimarisi oluşturuluyor...');
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const context = browser.contexts()[0];
        const page = await context.newPage();

        // 800x800 Standart Kare Kanvas (Apple HIG & Favicon / Brand standardı)
        await page.setViewportSize({ width: 800, height: 800 });

        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap');
                    
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    
                    /* Derin karanlık zemin - Amblem arkaplanı ile piksel düzeyinde kaynayan renk */
                    body {
                        background-color: #050b14;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 800px;
                        height: 800px;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        overflow: hidden;
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                    }

                    /* Dikiş ve kırpma izlerini (bottom crop artifact) yok eden, optik ağırlık merkezli kapsayıcı */
                    .logo-lockup {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transform: translateY(-8px); /* Optik ağırlık merkezi düzeltmesi (Visual weight adjustment) */
                    }

                    /* 
                       Kullanıcının amblemi: 262x275 px. 
                       Alttaki 20px'lik kesik/dikiş çizgisini temizlemek için hassas taşma maskesi (overflow hidden) ve feathering
                    */
                    .mark-container {
                        position: relative;
                        width: 440px;
                        height: 420px;
                        display: flex;
                        align-items: flex-start;
                        justify-content: center;
                        overflow: hidden; /* Alttaki kırpma çizgisini sıfırlar */
                    }

                    .mark-container img {
                        width: 440px;
                        height: 462px; /* Orijinal 262x275 oranını korur */
                        object-fit: cover;
                        object-position: top center; /* Sadece kalkanı alır, alt çizgiyi dışarı atar */
                        filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 40px rgba(14, 165, 233, 0.12));
                    }

                    /* Alttan yumuşak geçiş maskesi (tam pürüzsüzlük garantisi) */
                    .mark-container::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 30px;
                        background: linear-gradient(to bottom, transparent, #050b14);
                        pointer-events: none;
                    }

                    /* 
                       ENDÜSTRİ STANDARDI TİPOGRAFİ (Stripe / Palantir / Vercel Kuralı):
                       - Font Boyutu: Amblem yüksekliğinin ~1/7'si (Optik Denge)
                       - Font Weight: 700 Bold (Koyu zeminde bloom yapmayan dengeli çelik ton)
                       - Harf Aralığı: -0.03em (Modern Tech Startup sıkılığı)
                       - Renk: Saf göz kör eden beyaz yerine Slate-50 (#F8FAFC) ve teknolojik mavi yansıma
                    */
                    .wordmark {
                        margin-top: 18px; /* X-height oranında nefes alma boşluğu (Gutter) */
                        font-size: 64px;
                        font-weight: 700;
                        letter-spacing: -0.03em;
                        color: #f8fafc;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 1;
                        user-select: none;
                        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(56, 189, 248, 0.15);
                    }

                    .wordmark .brand-ai {
                        color: #38bdf8; /* AlparAI'ın 'AI' kısmına zarif DeepTech vurgusu */
                        margin-left: 1px;
                    }
                </style>
            </head>
            <body>
                <div class="logo-lockup">
                    <div class="mark-container">
                        <img src="data:image/png;base64,${imgBase64}" alt="AlparAI Shield" />
                    </div>
                    <div class="wordmark">
                        <span>Alpar</span><span class="brand-ai">AI</span>
                    </div>
                </div>
            </body>
            </html>
        `);

        // Font ve layout render için bekleme
        await page.waitForTimeout(600);

        // 800x800 Master PNG export
        await page.screenshot({ 
            path: 'D:/03_ALPARAI/public/brand/AlparAI_Global_Logo.png',
            fullPage: true 
        });
        console.log('[OK] Endüstri standardı AlparAI logosu üretildi: D:/03_ALPARAI/public/brand/AlparAI_Global_Logo.png');

        await page.close();

        // Live Eventiqs Formuna otomatik yükleme
        const formPage = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (formPage) {
            const logoInput = formPage.locator('input[name="startupLogo"]');
            if (await logoInput.count() > 0) {
                await logoInput.setInputFiles('D:\\03_ALPARAI\\public\\brand\\AlparAI_Global_Logo.png');
                console.log('[OK] Kusursuz kurumsal logo tarayıcıdaki canlı Eventiqs formuna yüklendi!');
            }
        }

        process.exit(0);
    } catch(e) {
        console.error('Hata:', e);
        process.exit(1);
    }
})();
