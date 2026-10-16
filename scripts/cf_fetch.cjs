const puppeteer = require('puppeteer-core');
const fs = require('fs');
(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await res.json();
    const cfTab = tabs.find(t => t.url.includes('dash.cloudflare.com'));
    
    if (!cfTab) {
      console.log('Cloudflare tab not found');
      return;
    }

    const browser = await puppeteer.connect({ browserWSEndpoint: cfTab.webSocketDebuggerUrl });
    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('dash.cloudflare.com'));
    if (!page) page = pages[0];

    const data = await page.evaluate(async () => {
      const response = await fetch('/api/v4/accounts/635ead830bc3a409e643b59e3768e9f5/pages/projects');
      return await response.json();
    });

    fs.writeFileSync('cf_projects_from_browser.json', JSON.stringify(data, null, 2));
    console.log('Successfully fetched projects from browser session!');
    browser.disconnect();
  } catch (err) {
    console.error(err);
  }
})();
