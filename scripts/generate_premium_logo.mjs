import { chromium } from '@playwright/test';
import fs from 'fs';

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <rect id="bg" width="1024" height="1024" fill="#020617" />
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <linearGradient id="neonCyan" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#22d3ee" />
    </linearGradient>

    <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>

    <linearGradient id="platinum" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>

    <filter id="glowHeavy" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="24" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="glowSubtle" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <use href="#bg" />
  <rect width="1024" height="1024" fill="url(#bgGrad)" />

  <g transform="translate(512, 440)" stroke-linejoin="round" stroke-linecap="round">
    <!-- Outer Hexagon (Firewall) -->
    <path d="M 0 -180 L 155.88 -90 L 155.88 90 L 0 180 L -155.88 90 L -155.88 -90 Z" fill="none" stroke="url(#neonCyan)" stroke-width="12" filter="url(#glowHeavy)" opacity="0.8" />
    <path d="M 0 -180 L 155.88 -90 L 155.88 90 L 0 180 L -155.88 90 L -155.88 -90 Z" fill="none" stroke="#22d3ee" stroke-width="4" />
    
    <!-- Inner Architecture (A) -->
    <path d="M 0 -110 L 90 60 L 45 60 L 0 -25 L -45 60 L -90 60 Z" fill="url(#platinum)" filter="url(#glowSubtle)" />
    
    <!-- The Core / TrustScore Lock -->
    <circle cx="0" cy="110" r="24" fill="url(#neonPurple)" filter="url(#glowHeavy)" />
    <circle cx="0" cy="110" r="12" fill="#ffffff" />
  </g>

  <!-- Typography -->
  <text x="512" y="800" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="100" fill="url(#platinum)" letter-spacing="4">ALPAR<tspan fill="#22d3ee">AI</tspan></text>
  
  <text x="512" y="860" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="24" fill="#64748b" letter-spacing="18">EPISTEMIC FIREWALL</text>
</svg>
`;

fs.writeFileSync('D:/03_ALPARAI/public/brand/AlparAI_Global_Logo.svg', svgContent);

(async () => {
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        // Open a new tab in the existing browser just for rendering
        const context = browser.contexts()[0];
        const page = await context.newPage();
        
        await page.setContent(`
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;900&display=swap');
                    body { margin: 0; background: #020617; display: flex; align-items: center; justify-content: center; height: 100vh; }
                    svg { font-family: 'Inter', sans-serif; }
                </style>
            </head>
            <body>
                ${svgContent}
            </body>
            </html>
        `);
        
        // Wait a bit for font loading
        await page.waitForTimeout(2000);
        
        const svgElement = await page.$('svg');
        await svgElement.screenshot({ path: 'D:/03_ALPARAI/public/brand/AlparAI_Global_Logo.png' });
        
        // Close the temporary tab
        await page.close();
        
        console.log('[OK] Logo SVG ve PNG olarak üretildi.');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
})();
