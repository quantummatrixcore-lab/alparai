const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log("Connecting to Chrome via CDP...");
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  
  const contexts = browser.contexts();
  let targetPage;
  for (const context of contexts) {
    for (const page of context.pages()) {
      const url = page.url();
      if (url.includes('console.cloud.google.com')) {
         targetPage = page;
         break;
      }
    }
    if(targetPage) break;
  }
  
  if (!targetPage) {
    console.log("Target tab not found. Exiting.");
    process.exit(1);
  }
  
  console.log("Found tab: " + targetPage.url());
  
  console.log("Navigating to consent screen...");
  await targetPage.goto('https://console.cloud.google.com/apis/credentials/consent?project=alparai-prod', { waitUntil: 'load' });
  await targetPage.waitForTimeout(5000);
  
  await targetPage.evaluate(() => window.scrollTo(0, 0));
  
  console.log("Taking initial screenshot...");
  await targetPage.screenshot({ path: 'D:/Alparai/screenshot_step1.png' });
  
  console.log("Extracting texts to find edit button...");
  const bodyText = await targetPage.evaluate(() => document.body.innerText);
  fs.writeFileSync('D:/Alparai/page_text.txt', bodyText);
  
  // Just disconnect to not close the actual browser
  await browser.close();
  console.log("Done phase 1.");
})();
