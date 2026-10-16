import { chromium } from '@playwright/test';
import fs from 'fs';

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <!-- Kozmik Obsidian Arka Plan -->
    <radialGradient id="spaceObsidian" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="45%" stop-color="#050814" />
      <stop offset="100%" stop-color="#02040a" />
    </radialGradient>

    <!-- Tesla Elektromanyetik Rezonans Gradyanı (Cyan-Electric Blue) -->
    <linearGradient id="teslaResonance" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0066ff" />
      <stop offset="50%" stop-color="#00d4ff" />
      <stop offset="100%" stop-color="#a5f3fc" />
    </linearGradient>

    <!-- Atatürk İstikbal Oku (Platin Titanyum & Saf Çelik) -->
    <linearGradient id="ataturkMonolith" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="35%" stop-color="#e2e8f0" />
      <stop offset="70%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>

    <!-- Da Vinci Altın Işık Çekirdeği (Bilinç & Hakemlik) -->
    <linearGradient id="daVinciCore" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>

    <!-- Yoğun Kuantum Glow Filtresi -->
    <filter id="quantumGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="28" result="blur1" />
      <feGaussianBlur stdDeviation="12" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="sharpGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Arka Plan -->
  <rect width="1200" height="1200" fill="url(#spaceObsidian)" />

  <!-- 1. TESLA 3-6-9 REZONANS VE MANYETİK ALAN YÖRÜNGELERİ -->
  <g transform="translate(600, 480)" opacity="0.45">
    <!-- R1 = 377 (Fibonacci) -->
    <circle cx="0" cy="0" r="377" fill="none" stroke="#00d4ff" stroke-width="1.5" stroke-dasharray="12 24 4 24" />
    <!-- R2 = 233 (Fibonacci) -->
    <circle cx="0" cy="0" r="233" fill="none" stroke="#818cf8" stroke-width="2" stroke-dasharray="8 16" />
    <!-- R3 = 144 (Fibonacci) -->
    <circle cx="0" cy="0" r="144" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="6 6" />
    
    <!-- 120 Derecelik Manyetik Denge Eksenleri (Tesla Üçgeni 3-6-9) -->
    <line x1="0" y1="-377" x2="0" y2="377" stroke="#00d4ff" stroke-width="0.75" stroke-opacity="0.3" />
    <line x1="-326.5" y1="188.5" x2="326.5" y2="-188.5" stroke="#00d4ff" stroke-width="0.75" stroke-opacity="0.3" />
    <line x1="-326.5" y1="-188.5" x2="326.5" y2="188.5" stroke="#00d4ff" stroke-width="0.75" stroke-opacity="0.3" />
  </g>

  <!-- 2. ALPAR DEVLET KALKANI (SAVUNMA VE SİVİL DOKUNULMAZLIK) -->
  <g transform="translate(600, 480)">
    <!-- Dış Kalkan Katmanı (Cyber-Shield Geometry) -->
    <path d="M 0 -340 
             L 240 -170 
             L 240 120 
             C 240 250 130 340 0 380 
             C -130 340 -240 250 -240 120 
             L -240 -170 Z" 
          fill="none" 
          stroke="url(#teslaResonance)" 
          stroke-width="8" 
          stroke-linejoin="round"
          filter="url(#quantumGlow)" />

    <!-- Kalkan İç İkincil Zırh Hattı -->
    <path d="M 0 -290 
             L 190 -140 
             L 190 90 
             C 190 200 100 275 0 310 
             C -100 275 -190 200 -190 90 
             L -190 -140 Z" 
          fill="rgba(6, 182, 212, 0.04)" 
          stroke="#00d4ff" 
          stroke-width="2.5" 
          stroke-opacity="0.7" 
          stroke-linejoin="round" />
  </g>

  <!-- 3. ATATÜRK İSTİKBAL MONOLİTİ: "A" HARFİ VE GÖKLERE YÜKSELEN MIZRAK -->
  <g transform="translate(600, 480)">
    <!-- Sol Çelik Kanat (İrade) -->
    <path d="M 0 -240 
             L -130 180 
             L -65 180 
             L 0 -30 Z" 
          fill="url(#ataturkMonolith)" 
          filter="url(#sharpGlow)" />

    <!-- Sağ Çelik Kanat (Akıl) -->
    <path d="M 0 -240 
             L 130 180 
             L 65 180 
             L 0 -30 Z" 
          fill="url(#ataturkMonolith)" 
          filter="url(#sharpGlow)" />

    <!-- Merkez Işık Yarığı (Saf Adalet Hattı) -->
    <line x1="0" y1="-255" x2="0" y2="170" stroke="#00f2fe" stroke-width="4" filter="url(#quantumGlow)" />

    <!-- 4. DA VINCI KUANTUM ÇEKİRDEĞİ (EPISTEMIC TRUST NODE / BİLİNÇ ODACIĞI) -->
    <g transform="translate(0, 115)">
      <!-- Dış Enerji Koridoru -->
      <polygon points="0,-48 42,-24 42,24 0,48 -42,24 -42,-24" 
               fill="none" 
               stroke="url(#daVinciCore)" 
               stroke-width="3" 
               filter="url(#quantumGlow)" />
      
      <!-- Merkez Hakemlik Gözü / Singularity -->
      <circle cx="0" cy="0" r="16" fill="url(#daVinciCore)" filter="url(#quantumGlow)" />
      <circle cx="0" cy="0" r="7" fill="#ffffff" />
      
      <!-- Yatay Kalkan Kilidi (The Sovereign Crossbar) -->
      <path d="M -95 -8 L -45 -8 L -45 8 L -95 8 Z" fill="#00d4ff" opacity="0.8" />
      <path d="M 95 -8 L 45 -8 L 45 8 L 95 8 Z" fill="#00d4ff" opacity="0.8" />
    </g>
  </g>

  <!-- 5. TİPOGRAFİ VE DEVLET AKLI KURUMSAL İMZASI (Mükemmel Taşmayan Tipografi) -->
  <g transform="translate(600, 980)" text-anchor="middle">
    <!-- Marka Başlığı -->
    <text font-family="'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif" 
          font-weight="900" 
          font-size="92" 
          fill="#f8fafc" 
          letter-spacing="12">
      ALPAR<tspan fill="#00d4ff">AI</tspan>
    </text>

    <!-- Stratejik Unvan (Alt Başlık - Kenarlardan Asla Taşmaz) -->
    <text y="70" 
          font-family="'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif" 
          font-weight="600" 
          font-size="20" 
          fill="#94a3b8" 
          letter-spacing="10">
      EPISTEMIC FIREWALL &amp; SOVEREIGN TRUST
    </text>
  </g>
</svg>
`;

fs.writeFileSync('D:/03_ALPARAI/public/brand/AlparAI_Global_Logo.svg', svgContent);
fs.writeFileSync('D:/03_ALPARAI/public/brand/AlparAI_Titan_Logo.svg', svgContent);

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const context = browser.contexts()[0];
        const page = await context.newPage();
        
        await page.setContent(`
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;900&display=swap');
                    body { margin: 0; background: #02040a; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
                    svg { font-family: 'Inter', sans-serif; }
                </style>
            </head>
            <body>
                ${svgContent}
            </body>
            </html>
        `);
        
        await page.waitForTimeout(2000);
        
        const svgElement = await page.$('svg');
        await svgElement.screenshot({ 
            path: 'D:/03_ALPARAI/public/brand/AlparAI_Global_Logo.png',
            omitBackground: false 
        });
        await page.close();
        console.log('[OK] Kusursuz Tipografili Titan Logo (AlparAI_Global_Logo.png) oluşturuldu.');

        // Live Eventiqs Formuna yükle
        const formPage = browser.contexts()[0].pages().find(p => p.url().includes('eventiqs.com'));
        if (formPage) {
            const logoInput = formPage.locator('input[name="startupLogo"]');
            if (await logoInput.count() > 0) {
                await logoInput.setInputFiles('D:\\03_ALPARAI\\public\\brand\\AlparAI_Global_Logo.png');
                console.log('[OK] Mükemmel kırpılmamış logo canlı forma yüklendi!');
            }
        }

        process.exit(0);
    } catch(e) {
        console.error('Hata:', e);
        process.exit(1);
    }
})();
