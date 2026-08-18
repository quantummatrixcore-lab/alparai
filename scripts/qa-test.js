const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function runQaTest() {
  console.log('Connecting to existing browser over CDP...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  
  const contexts = browser.contexts();
  const pages = contexts[0].pages();
  let page = pages.find(p => p.url().includes('alparai.com'));
  
  if (!page) {
    page = pages.find(p => !p.url().includes('claude.ai'));
    if (!page) page = pages[0];
  }
  
  console.log(`Using existing tab: ${page.url()}`);
  
  const reportPath = path.join(__dirname, 'qa_report.md');
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
  
  let report = '# QA Test Raporu\n\n';
  
  const testUrls = [
    { name: 'Anasayfa', path: '/en' },
    { name: 'Leaderboard', path: '/en/leaderboard' },
    { name: 'Insights', path: '/en/insights' },
    { name: 'Community', path: '/en/community' },
    { name: 'Documentation', path: '/en/documentation' },
    { name: 'Pricing', path: '/en/pricing' },
    { name: 'About', path: '/en/about' },
    { name: '404', path: '/en/rastgele-404-sayfasi' }
  ];

  for (const t of testUrls) {
    console.log(`Testing ${t.name}...`);
    report += `## ${t.name} (${t.path})\n`;
    
    // Add event listeners for console and network errors
    const errors = [];
    const consoleLogs = [];
    
    const handleConsole = msg => { if (msg.type() === 'error') consoleLogs.push(msg.text()); };
    const handlePageError = err => errors.push(err.message);
    const handleRequestFailed = req => errors.push(`Failed: ${req.url()}`);
    
    page.on('console', handleConsole);
    page.on('pageerror', handlePageError);
    page.on('requestfailed', handleRequestFailed);
    
    let status = 0;
    try {
      const response = await page.goto(`https://www.alparai.com${t.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      status = response ? response.status() : 'Bilinmiyor';
      report += `- **HTTP Status / Yüklenme:** ${status}\n`;
      
      const screenshotName = `${t.name.toLowerCase().replace(/ /g, '_')}.png`;
      await page.screenshot({ path: path.join(screenshotsDir, screenshotName), fullPage: true });
      report += `- **Ekran Görüntüsü:** Alındı (${screenshotName})\n`;
      
      report += `- **Console Hataları:** ${consoleLogs.length > 0 ? consoleLogs.join(' | ') : 'Yok'}\n`;
      report += `- **Sayfa Hataları (Görsel/Bozuk Link vb):** ${errors.length > 0 ? errors.join(' | ') : 'Yok'}\n`;
    } catch (e) {
      report += `- **HATA:** ${e.message}\n`;
    }
    
    page.removeListener('console', handleConsole);
    page.removeListener('pageerror', handlePageError);
    page.removeListener('requestfailed', handleRequestFailed);
    report += '\n';
  }
  
  fs.writeFileSync(reportPath, report);
  console.log('Test completed. Report saved to qa_report.md');
  await browser.disconnect();
}

runQaTest().catch(console.error);
