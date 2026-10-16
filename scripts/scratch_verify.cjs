const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    console.log('Launching headless browser (msedge)...');
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    console.log('Navigating to https://alparai.com/en ...');
    const response = await page.goto('https://alparai.com/en', { waitUntil: 'networkidle', timeout: 60000 });
    console.log('HTTP Status:', response ? response.status() : 'N/A');

    console.log('Waiting 10 seconds for settled state (network idle + 10s)...');
    await page.waitForTimeout(10000);

    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotsDir, 'alparai_en_full.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('SCREENSHOT_PATH:', screenshotPath);

    // a. Skeleton count: occurrences of animate-pulse skeleton grid
    const skeletons = await page.$$('.animate-pulse');
    console.log('SKELETON_COUNT:', skeletons.length);

    // b. Resolved content: count links matching /en/incidents/[id]
    const incidentLinks = await page.$$eval('a[href*="/en/incidents/"]', anchors =>
      anchors.map(a => a.getAttribute('href'))
    );
    // Filter out root /en/incidents if any, keeping /en/incidents/[id]
    const specificIncidentLinks = incidentLinks.filter(href => href && href.match(/\/en\/incidents\/[^\s/]+/));
    console.log('INCIDENT_LINKS_COUNT:', specificIncidentLinks.length);
    console.log('INCIDENT_LINKS_SAMPLE:', specificIncidentLinks.slice(0, 10));

    // Fallback incident titles: "Air Canada", "Chevrolet", "DPD"
    const bodyText = await page.innerText('body');
    const fallbackTitlesFound = ["Air Canada", "Chevrolet", "DPD"].filter(title => bodyText.includes(title));
    console.log('FALLBACK_TITLES_FOUND:', fallbackTitlesFound);

    // c. Empty states: count /en/submit CTA links
    const submitLinks = await page.$$eval('a[href*="/en/submit"]', anchors =>
      anchors.map(a => a.getAttribute('href'))
    );
    console.log('SUBMIT_CTA_COUNT:', submitLinks.length);
    console.log('SUBMIT_CTA_LINKS:', submitLinks);

    // d. Ticker: confirm LIVE RADAR items render with provider badges
    const liveRadarPresent = bodyText.includes('LIVE RADAR') || bodyText.includes('Live Radar');
    console.log('LIVE_RADAR_PRESENT:', liveRadarPresent);

    // Check ticker items and badges
    const tickerItems = await page.$$eval('[data-ticker-item], .ticker-item, [class*="ticker"], [class*="radar"]', els =>
      els.map(el => el.innerText.trim()).filter(t => t.length > 0)
    );
    console.log('TICKER_ITEMS_COUNT:', tickerItems.length);
    
    // Check provider badges specifically in ticker / radar or page
    const providerBadges = await page.$$eval('[class*="badge"], [class*="provider"], span.text-xs', els =>
      els.map(el => el.innerText.trim()).filter(t => t.length > 0)
    );
    console.log('PROVIDER_BADGES_SAMPLE:', providerBadges.slice(0, 15));

    await browser.close();
    console.log('VERIFICATION_COMPLETE');
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
})();
